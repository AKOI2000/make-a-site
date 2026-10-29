
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { r2 } from "@/app/lib/r2";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_REQUEST_SIZE = MAX_FILE_SIZE + 1024 * 1024;
const MAX_ASSETS_PER_WEBSITE = 30;
const MAX_IMAGE_PIXELS = 40_000_000;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_FORMATS = ["jpeg", "png", "webp"];

function getSectionId(value) {
  if (typeof value !== "string") return null;

  const sectionId = value.trim();

  if (!sectionId || sectionId.length > 100) return null;

  return sectionId;
}

export async function POST(request, { params }) {
  let storageKey;

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        { message: "You must sign in first." },
        { status: 401 },
      );
    }

    const { websiteId } = await params;

    const website = await prisma.giftWebsite.findFirst({
      where: {
        id: websiteId,
        ownerId: session.user.id,
      },
      select: { id: true },
    });

    if (!website) {
      return Response.json(
        { message: "Website not found." },
        { status: 404 },
      );
    }

    const contentLength = Number(
      request.headers.get("content-length") || 0,
    );

    if (contentLength > MAX_REQUEST_SIZE) {
      return Response.json(
        { message: "The upload request is too large." },
        { status: 413 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const sectionId = getSectionId(formData.get("sectionId"));

    if (!sectionId) {
      return Response.json(
        { message: "A valid section ID is required." },
        { status: 400 },
      );
    }

    if (!file || typeof file === "string") {
      return Response.json(
        { message: "Please select an image." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { message: "Only JPEG, PNG and WebP images are allowed." },
        { status: 400 },
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return Response.json(
        { message: "Images must be between 1 byte and 10 MB." },
        { status: 400 },
      );
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    const image = sharp(inputBuffer, {
      limitInputPixels: MAX_IMAGE_PIXELS,
    });

    const metadata = await image.metadata();

    if (
      !ALLOWED_FORMATS.includes(metadata.format) ||
      !metadata.width ||
      !metadata.height
    ) {
      return Response.json(
        { message: "The uploaded file is not a supported image." },
        { status: 400 },
      );
    }

    // Enforce the 30-asset limit across the entire website.
    const [assetCount, sectionAssetCount] = await Promise.all([
      prisma.giftAsset.count({
        where: {
          ownerId: session.user.id,
          websiteId,
        },
      }),
      prisma.giftAsset.count({
        where: {
          ownerId: session.user.id,
          websiteId,
          sectionId,
        },
      }),
    ]);

    if (assetCount >= MAX_ASSETS_PER_WEBSITE) {
      return Response.json(
        { message: "This website has reached its 30-photo limit." },
        { status: 400 },
      );
    }

    const outputBuffer = await image
      .rotate()
      .resize({
        width: 2000,
        height: 2000,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();

    storageKey =
      `users/${session.user.id}/websites/${websiteId}/${randomUUID()}.webp`;

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: storageKey,
        Body: outputBuffer,
        ContentType: "image/webp",
      }),
    );

    const asset = await prisma.giftAsset.create({
      data: {
        ownerId: session.user.id,
        websiteId,
        sectionId,
        storageKey,
        sortOrder: sectionAssetCount,
        status: "READY",
      },
      select: {
        id: true,
        websiteId: true,
        sectionId: true,
        altText: true,
        caption: true,
        sortOrder: true,
        createdAt: true,
      },
    });

    return Response.json(
      {
        message: "Image uploaded successfully.",
        asset,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Image upload failed:", {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.$metadata?.httpStatusCode,
    });

    if (storageKey) {
      try {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: storageKey,
          }),
        );
      } catch (cleanupError) {
        console.error("R2 cleanup failed:", {
          name: cleanupError.name,
          message: cleanupError.message,
        });
      }
    }

    return Response.json(
      { message: "The image could not be uploaded." },
      { status: 500 },
    );
  }
}

export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        { message: "You must sign in first." },
        { status: 401 },
      );
    }

    const { websiteId } = await params;
    const sectionId = getSectionId(
      new URL(request.url).searchParams.get("sectionId"),
    );

    if (!sectionId) {
      return Response.json(
        { message: "A valid section ID is required." },
        { status: 400 },
      );
    }

    const website = await prisma.giftWebsite.findFirst({
      where: {
        id: websiteId,
        ownerId: session.user.id,
      },
      select: { id: true },
    });

    if (!website) {
      return Response.json(
        { message: "Website not found." },
        { status: 404 },
      );
    }

    const assets = await prisma.giftAsset.findMany({
      where: {
        websiteId,
        ownerId: session.user.id,
        sectionId,
        status: "READY",
      },
      orderBy: {
        sortOrder: "asc",
      },
      select: {
        id: true,
        websiteId: true,
        sectionId: true,
        altText: true,
        caption: true,
        sortOrder: true,
        createdAt: true,
      },
    });

    return Response.json({ assets });
  } catch (error) {
    console.error("Asset listing failed:", {
      name: error.name,
      message: error.message,
    });

    return Response.json(
      { message: "The uploaded images could not be retrieved." },
      { status: 500 },
    );
  }
}
