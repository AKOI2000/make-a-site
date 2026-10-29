
import { GetObjectCommand } from "@aws-sdk/client-s3";

import { prisma } from "@/lib/prisma";
import { r2 } from "@/app/lib/r2";

export async function GET(request, { params }) {
  try {
    const { slug, wishId } = await params;

    if (!slug || !wishId) {
      return Response.json(
        { message: "A website slug and wish ID are required." },
        { status: 400 },
      );
    }

    const wish = await prisma.giftWish.findFirst({
      where: {
        id: wishId,
        photoKey: {
          not: null,
        },
        guestbook: {
          website: {
            slug,
            status: "PUBLISHED",
          },
        },
      },
      select: {
        photoKey: true,
      },
    });

    if (!wish?.photoKey) {
      return Response.json(
        { message: "Guest photo not found." },
        { status: 404 },
      );
    }

    const result = await r2.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: wish.photoKey,
      }),
    );

    if (!result.Body) {
      return Response.json(
        { message: "Guest photo not found." },
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
    console.error("Public guest photo retrieval failed:", {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.$metadata?.httpStatusCode,
    });

    return Response.json(
      { message: "The guest photo could not be retrieved." },
      { status: 500 },
    );
  }
}
