
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { r2 } from "@/app/lib/r2";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_REQUEST_SIZE = MAX_FILE_SIZE + 1024 * 1024;
const MAX_IMAGE_PIXELS = 40_000_000;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_FORMATS = ["jpeg", "png", "webp"];

function getSectionId(value) {
  if (typeof value !== "string") return null;

  const sectionId = value.trim();

  if (!sectionId || sectionId.length > 100) return null;

  return sectionId;
}

function getUploadError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function processImage(file) {
  if (!file || typeof file === "string") {
    throw getUploadError("Please select an image.");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw getUploadError("Only JPEG, PNG and WebP images are allowed.");
  }

  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    throw getUploadError("Images must be between 1 byte and 10 MB.");
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
    throw getUploadError("The uploaded file is not a supported image.");
  }

  return image
    .rotate()
    .resize({
      width: 2000,
      height: 2000,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toBuffer();
}

async function getOwnedAsset(websiteId, assetId, userId, sectionId) {
  return prisma.giftAsset.findFirst({
    where: {
      id: assetId,
      websiteId,
      ownerId: userId,
      status: "READY",
      ...(sectionId ? { sectionId } : {}),
    },
    select: {
      id: true,
      websiteId: true,
      sectionId: true,
      storageKey: true,
      altText: true,
      caption: true,
      sortOrder: true,
      createdAt: true,
    },
  });
}

function isRequestTooLarge(request) {
  const contentLength = Number(
    request.headers.get("content-length") || 0,
  );

  return contentLength > MAX_REQUEST_SIZE;
}

function logR2Error(action, error) {
  console.error(`${action} failed:`, {
    name: error.name,
    message: error.message,
    code: error.code,
    status: error.$metadata?.httpStatusCode,
  });
}

function getRequestedSection(request) {
  const url = new URL(request.url);
  const values = url.searchParams.getAll("sectionId");

  if (values.length === 0) {
    return { sectionId: null, error: null };
  }

  if (values.length !== 1) {
    return {
      sectionId: null,
      error: "Provide exactly one section ID.",
    };
  }

  const sectionId = getSectionId(values[0]);

  if (!sectionId) {
    return {
      sectionId: null,
      error: "A valid section ID is required.",
    };
  }

  return { sectionId, error: null };
}

// GET: Retrieve an image from private R2 storage.
export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        { message: "You must sign in first." },
        { status: 401 },
      );
    }

    const { websiteId, assetId } = await params;
    const { sectionId, error } = getRequestedSection(request);

    if (error) {
      return Response.json({ message: error }, { status: 400 });
    }

    const asset = await getOwnedAsset(
      websiteId,
      assetId,
      session.user.id,
      sectionId,
    );

    if (!asset) {
      return Response.json(
        { message: "Image not found." },
        { status: 404 },
      );
    }

    const result = await r2.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: asset.storageKey,
      }),
    );

    if (!result.Body) {
      return Response.json(
        { message: "Image not found." },
        { status: 404 },
      );
    }

    const imageBytes = await result.Body.transformToByteArray();

    return new Response(imageBytes, {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    logR2Error("Image retrieval", error);

    return Response.json(
      { message: "The image could not be retrieved." },
      { status: 500 },
    );
  }
}

// PATCH: Update a photo's caption and alt text.
export async function PATCH(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        { message: "You must sign in first." },
        { status: 401 },
      );
    }

    const { websiteId, assetId } = await params;
    const { sectionId, error } = getRequestedSection(request);

    if (error) {
      return Response.json({ message: error }, { status: 400 });
    }

    const asset = await getOwnedAsset(
      websiteId,
      assetId,
      session.user.id,
      sectionId,
    );

    if (!asset) {
      return Response.json(
        { message: "Image not found." },
        { status: 404 },
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        { message: "Invalid request body." },
        { status: 400 },
      );
    }

    const { caption, altText } = body ?? {};

    if (
      (caption !== undefined &&
        caption !== null &&
        typeof caption !== "string") ||
      (altText !== undefined &&
        altText !== null &&
        typeof altText !== "string")
    ) {
      return Response.json(
        { message: "Caption and alt text must be text." },
        { status: 400 },
      );
    }

    if (
      (typeof caption === "string" && caption.length > 500) ||
      (typeof altText === "string" && altText.length > 500)
    ) {
      return Response.json(
        {
          message:
            "Caption and alt text must be 500 characters or fewer.",
        },
        { status: 400 },
      );
    }

    const data = {};

    if (caption !== undefined) {
      data.caption = caption?.trim() || null;
    }

    if (altText !== undefined) {
      data.altText = altText?.trim() || null;
    }

    if (Object.keys(data).length === 0) {
      return Response.json(
        { message: "No photo details were provided." },
        { status: 400 },
      );
    }

    const updatedAsset = await prisma.giftAsset.update({
      where: { id: asset.id },
      data,
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

    return Response.json({
      message: "Photo details saved successfully.",
      asset: updatedAsset,
    });
  } catch (error) {
    console.error("Photo details update failed:", {
      name: error.name,
      message: error.message,
    });

    return Response.json(
      { message: "Photo details could not be saved." },
      { status: 500 },
    );
  }
}

// PUT: Replace the image while preserving its asset ID and details.
export async function PUT(request, { params }) {
  let newStorageKey;

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        { message: "You must sign in first." },
        { status: 401 },
      );
    }

    const { websiteId, assetId } = await params;
    const { sectionId, error } = getRequestedSection(request);

    if (error) {
      return Response.json({ message: error }, { status: 400 });
    }

    const asset = await getOwnedAsset(
      websiteId,
      assetId,
      session.user.id,
      sectionId,
    );

    if (!asset) {
      return Response.json(
        { message: "Image not found." },
        { status: 404 },
      );
    }

    if (isRequestTooLarge(request)) {
      return Response.json(
        { message: "The upload request is too large." },
        { status: 413 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const outputBuffer = await processImage(file);

    newStorageKey =
      `users/${session.user.id}/websites/${websiteId}/${randomUUID()}.webp`;

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: newStorageKey,
        Body: outputBuffer,
        ContentType: "image/webp",
      }),
    );

    const updatedAsset = await prisma.giftAsset.update({
      where: { id: asset.id },
      data: { storageKey: newStorageKey },
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

    try {
      await r2.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: asset.storageKey,
        }),
      );
    } catch (error) {
      logR2Error("Old image cleanup after replacement", error);
    }

    return Response.json({
      message: "Image replaced successfully.",
      asset: updatedAsset,
    });
  } catch (error) {
    if (newStorageKey) {
      try {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: newStorageKey,
          }),
        );
      } catch (cleanupError) {
        logR2Error("Replacement upload cleanup", cleanupError);
      }
    }

    if (error.status) {
      return Response.json(
        { message: error.message },
        { status: error.status },
      );
    }

    logR2Error("Image replacement", error);

    return Response.json(
      { message: "The image could not be replaced." },
      { status: 500 },
    );
  }
}

// DELETE: Remove the database record and its R2 object.
export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        { message: "You must sign in first." },
        { status: 401 },
      );
    }

    const { websiteId, assetId } = await params;
    const { sectionId, error } = getRequestedSection(request);

    if (error) {
      return Response.json({ message: error }, { status: 400 });
    }

    const asset = await getOwnedAsset(
      websiteId,
      assetId,
      session.user.id,
      sectionId,
    );

    if (!asset) {
      return Response.json(
        { message: "Image not found." },
        { status: 404 },
      );
    }

    await prisma.giftAsset.delete({
      where: { id: asset.id },
    });

    try {
      await r2.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: asset.storageKey,
        }),
      );
    } catch (error) {
      logR2Error("Image cleanup after deletion", error);
    }

    return Response.json({
      message: "Photo deleted successfully.",
      assetId: asset.id,
    });
  } catch (error) {
    console.error("Photo deletion failed:", {
      name: error.name,
      message: error.message,
      code: error.code,
    });

    return Response.json(
      { message: "The photo could not be deleted." },
      { status: 500 },
    );
  }
}
