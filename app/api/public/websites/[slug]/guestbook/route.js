
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import {
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import { prisma } from "@/lib/prisma";
import { r2 } from "@/app/lib/r2";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_REQUEST_SIZE = MAX_FILE_SIZE + 1024 * 1024;
const MAX_IMAGE_PIXELS = 40_000_000;
const MAX_WISHES = 20;
const MAX_NAME_LENGTH = 80;
const MAX_MESSAGE_LENGTH = 2000;
const VISITOR_COOKIE = "gift_guest_visitor";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_FORMATS = ["jpeg", "png", "webp"];

function errorResponse(message, status) {
  return Response.json({ message }, { status });
}

function isValidVisitorId(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

function getVisitorCookieHeader(visitorId) {
  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";

  return (
    `${VISITOR_COOKIE}=${visitorId}; Path=/; HttpOnly; SameSite=Lax; ` +
    `Max-Age=${VISITOR_COOKIE_MAX_AGE}${secure}`
  );
}

function isUniqueConstraintError(error) {
  return (
    error?.code === "P2002" ||
    (error?.code === "P2010" &&
      String(error?.meta?.code) === "23505") ||
    String(error?.message || "").includes("23505")
  );
}

async function deleteGuestPhoto(storageKey) {
  if (!storageKey) return;

  try {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: storageKey,
      }),
    );
  } catch (error) {
    console.error("Guest photo cleanup failed:", {
      name: error.name,
      message: error.message,
    });
  }
}

export async function POST(request, { params }) {
  let storageKey = null;
  let wishCreated = false;

  try {
    const { slug } = await params;

    if (!slug) {
      return errorResponse("Website not found.", 404);
    }

    const contentLength = Number(
      request.headers.get("content-length") || 0,
    );

    if (contentLength > MAX_REQUEST_SIZE) {
      return errorResponse("The submission is too large.", 413);
    }

    const cookieVisitorId = request.cookies?.get(VISITOR_COOKIE)?.value;
    const hasValidVisitorCookie = isValidVisitorId(cookieVisitorId);
    const visitorId = hasValidVisitorCookie
      ? cookieVisitorId
      : randomUUID();

    const formData = await request.formData();

    const rawName = formData.get("guestName");
    const rawMessage = formData.get("message");

    if (
      typeof rawName !== "string" ||
      typeof rawMessage !== "string"
    ) {
      return errorResponse("A name and message are required.", 400);
    }

    const guestName = rawName.trim();
    const message = rawMessage.trim();

    if (!guestName) {
      return errorResponse("Please enter your name.", 400);
    }

    if (!message) {
      return errorResponse("Please enter a birthday wish.", 400);
    }

    if (
      guestName.length > MAX_NAME_LENGTH ||
      message.length > MAX_MESSAGE_LENGTH
    ) {
      return errorResponse("Your name or message is too long.", 400);
    }

    const fileValue = formData.get("photo");

    if (typeof fileValue === "string" && fileValue.trim()) {
      return errorResponse("Invalid photo upload.", 400);
    }

    // Browsers may include an empty File when no photo is selected.
    const file =
      fileValue &&
      typeof fileValue !== "string" &&
      fileValue.name
        ? fileValue
        : null;

    let outputBuffer = null;

    if (file) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return errorResponse(
          "Only JPEG, PNG and WebP photos are allowed.",
          400,
        );
      }

      if (file.size === 0 || file.size > MAX_FILE_SIZE) {
        return errorResponse(
          "Photos must be between 1 byte and 10 MB.",
          400,
        );
      }

      const inputBuffer = Buffer.from(await file.arrayBuffer());

      try {
        const image = sharp(inputBuffer, {
          limitInputPixels: MAX_IMAGE_PIXELS,
        });

        const metadata = await image.metadata();

        if (
          !ALLOWED_FORMATS.includes(metadata.format) ||
          !metadata.width ||
          !metadata.height
        ) {
          return errorResponse(
            "The uploaded file is not a supported image.",
            400,
          );
        }

        outputBuffer = await image
          .rotate()
          .resize({
            width: 2000,
            height: 2000,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 85 })
          .toBuffer();
      } catch (error) {
        console.error("Guest photo processing failed:", {
          message: error.message,
        });

        return errorResponse(
          "The photo could not be processed. Please try another image.",
          400,
        );
      }
    }

    const website = await prisma.giftWebsite.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
      },
      select: {
        id: true,
      },
    });

    if (!website) {
      return errorResponse("Website not found.", 404);
    }

    // Older websites may not have a guestbook record yet.
    const guestbook = await prisma.giftGuestbook.upsert({
      where: {
        websiteId: website.id,
      },
      create: {
        websiteId: website.id,
        status: "OPEN",
        wishCount: 0,
        roundNumber: 1,
      },
      update: {},
      select: {
        id: true,
        wishCount: true,
        roundNumber: true,
      },
    });

    if (guestbook.wishCount >= MAX_WISHES) {
      return errorResponse("This guestbook round is full.", 409);
    }

    // Give the visitor a clear response before attempting an upload.
    // The database constraint below remains the final safeguard.
    const existingWish = await prisma.giftWish.findFirst({
      where: {
        guestbookId: guestbook.id,
        roundNumber: guestbook.roundNumber,
        visitorId,
      },
      select: {
        id: true,
      },
    });

    if (existingWish) {
      return errorResponse(
        "You've already left a wish for this round.",
        409,
      );
    }

    // Upload the optional photo before reserving a wish slot.
    if (outputBuffer) {
      storageKey =
        `guestbooks/${guestbook.id}/round-${guestbook.roundNumber}/${randomUUID()}.webp`;

      await r2.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: storageKey,
          Body: outputBuffer,
          ContentType: "image/webp",
        }),
      );
    }

    const wishId = randomUUID();

    // Reserve a slot and create the wish in one atomic SQL statement.
    // The database unique constraint prevents duplicate wishes, even
    // when two submissions from the same visitor arrive simultaneously.
    const createdWishes = await prisma.$queryRaw`
      WITH reserved AS (
        UPDATE "GiftGuestbook" AS gb
        SET
          "wishCount" = gb."wishCount" + 1,
          "updatedAt" = CURRENT_TIMESTAMP
        FROM "GiftWebsite" AS website
        WHERE
          gb.id = ${guestbook.id}
          AND gb."websiteId" = website.id
          AND website.slug = ${slug}
          AND website.status = 'PUBLISHED'
          AND gb."roundNumber" = ${guestbook.roundNumber}
          AND gb."wishCount" < ${MAX_WISHES}
        RETURNING gb.id, gb."roundNumber"
      )
      INSERT INTO "GiftWish" (
        id,
        "guestbookId",
        "roundNumber",
        "visitorId",
        "guestName",
        message,
        "photoKey",
        "createdAt"
      )
      SELECT
        ${wishId},
        reserved.id,
        reserved."roundNumber",
        ${visitorId},
        ${guestName},
        ${message},
        ${storageKey},
        CURRENT_TIMESTAMP
      FROM reserved
      RETURNING id, "guestName", message, "createdAt"
    `;

    if (createdWishes.length === 0) {
      await deleteGuestPhoto(storageKey);
      storageKey = null;

      const currentGuestbook =
        await prisma.giftGuestbook.findUnique({
          where: {
            id: guestbook.id,
          },
          select: {
            wishCount: true,
            roundNumber: true,
          },
        });

      if (
        currentGuestbook &&
        currentGuestbook.wishCount >= MAX_WISHES
      ) {
        return errorResponse("This guestbook round is full.", 409);
      }

      if (
        !currentGuestbook ||
        currentGuestbook.roundNumber !== guestbook.roundNumber
      ) {
        return errorResponse(
          "The guestbook round has changed. Please refresh the page.",
          409,
        );
      }

      return errorResponse(
        "Your wish could not be submitted. Please try again.",
        409,
      );
    }

    wishCreated = true;

    const wish = createdWishes[0];
    const headers = new Headers();

    // Store the visitor ID in the browser after their first successful
    // submission, so later submissions use the same identifier.
    if (!hasValidVisitorCookie) {
      headers.append(
        "Set-Cookie",
        getVisitorCookieHeader(visitorId),
      );
    }

    return Response.json(
      {
        message: "Your birthday wish has been submitted.",
        wish: {
          ...wish,
          photoUrl: storageKey
            ? `/api/public/websites/${encodeURIComponent(slug)}/guestbook/photos/${encodeURIComponent(wish.id)}`
            : null,
        },
      },
      {
        status: 201,
        headers,
      },
    );
  } catch (error) {
    console.error("Guestbook submission failed:", {
      name: error.name,
      message: error.message,
      code: error.code,
      databaseCode: error.meta?.code,
      status: error.$metadata?.httpStatusCode,
    });

    if (!wishCreated && storageKey) {
      await deleteGuestPhoto(storageKey);
      storageKey = null;
    }

    if (isUniqueConstraintError(error)) {
      return errorResponse(
        "You've already left a wish for this round.",
        409,
      );
    }

    return errorResponse(
      "Your wish could not be submitted. Please try again.",
      500,
    );
  }
}
