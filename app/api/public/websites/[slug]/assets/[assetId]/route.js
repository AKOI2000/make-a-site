
import { GetObjectCommand } from "@aws-sdk/client-s3";

import { prisma } from "@/lib/prisma";
import { r2 } from "@/app/lib/r2";

function getRequestedSection(request) {
  const url = new URL(request.url);
  const values = url.searchParams.getAll("sectionId");

  if (values.length !== 1) {
    return {
      sectionId: null,
      error: "Exactly one section ID is required.",
    };
  }

  const sectionId = values[0].trim();

  if (!sectionId || sectionId.length > 100) {
    return {
      sectionId: null,
      error: "A valid section ID is required.",
    };
  }

  return { sectionId, error: null };
}

export async function GET(request, { params }) {
  try {
    const { slug, assetId } = await params;
    const { sectionId, error } = getRequestedSection(request);

    if (error) {
      return Response.json(
        { message: error },
        { status: 400 },
      );
    }

    const asset = await prisma.giftAsset.findFirst({
      where: {
        id: assetId,
        sectionId,
        status: "READY",
        website: {
          slug,
          status: "PUBLISHED",
        },
      },
      select: {
        storageKey: true,
      },
    });

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
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Public image retrieval failed:", {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.$metadata?.httpStatusCode,
    });

    return Response.json(
      { message: "The image could not be retrieved." },
      { status: 500 },
    );
  }
}
