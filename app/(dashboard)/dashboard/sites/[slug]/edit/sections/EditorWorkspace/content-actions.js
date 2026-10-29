
"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/lib/auth-sessions";

export async function saveIntroduction(websiteId, message) {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("You must be signed in to edit this website.");
  }

  if (
    typeof websiteId !== "string" ||
    typeof message !== "string"
  ) {
    throw new Error("Invalid introduction content.");
  }

  const trimmedMessage = message.trim();

  if (!trimmedMessage || trimmedMessage.length > 2000) {
    throw new Error(
      "The introduction must contain between 1 and 2,000 characters."
    );
  }

  const website = await prisma.giftWebsite.findFirst({
    where: {
      id: websiteId,
      ownerId: userId,
      templateId: "birthday-classic",
    },
    select: {
      id: true,
      content: true,
    },
  });

  if (!website) {
    throw new Error("Website not found or access denied.");
  }

  const existingContent =
    website.content &&
    typeof website.content === "object" &&
    !Array.isArray(website.content)
      ? website.content
      : {};

  const existingIntro =
    existingContent.intro &&
    typeof existingContent.intro === "object" &&
    !Array.isArray(existingContent.intro)
      ? existingContent.intro
      : {};

  await prisma.giftWebsite.update({
    where: {
      id: website.id,
    },
    data: {
      content: {
        ...existingContent,
        intro: {
          ...existingIntro,
          message: trimmedMessage,
        },
      },
    },
  });

  return { success: true };
}

export async function saveEnvelope(websiteId, submittedEnvelope) {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("You must be signed in to edit this website.");
  }

  if (
    typeof websiteId !== "string" ||
    !submittedEnvelope ||
    typeof submittedEnvelope !== "object" ||
    Array.isArray(submittedEnvelope)
  ) {
    throw new Error("Invalid birthday letter content.");
  }

  const fields = [
    "recipient",
    "heading",
    "greeting",
    "closing",
    "signature",
  ];

  const envelopeContent = {};

  for (const field of fields) {
    const value = submittedEnvelope[field];

    if (typeof value !== "string") {
      throw new Error(`Invalid birthday letter ${field}.`);
    }

    const trimmedValue = value.trim();

    if (!trimmedValue || trimmedValue.length > 300) {
      throw new Error(
        `The birthday letter ${field} must contain between 1 and 300 characters.`
      );
    }

    envelopeContent[field] = trimmedValue;
  }

  if (
    !Array.isArray(submittedEnvelope.paragraphs) ||
    submittedEnvelope.paragraphs.length !== 2
  ) {
    throw new Error("The birthday letter must have exactly two paragraphs.");
  }

  envelopeContent.paragraphs = submittedEnvelope.paragraphs.map(
    (paragraph, index) => {
      if (typeof paragraph !== "string") {
        throw new Error(`Invalid birthday letter paragraph ${index + 1}.`);
      }

      const trimmedParagraph = paragraph.trim();

      if (!trimmedParagraph || trimmedParagraph.length > 2000) {
        throw new Error(
          `Each birthday letter paragraph must contain between 1 and 2,000 characters.`
        );
      }

      return trimmedParagraph;
    }
  );

  const website = await prisma.giftWebsite.findFirst({
    where: {
      id: websiteId,
      ownerId: userId,
      templateId: "birthday-classic",
    },
    select: {
      id: true,
      content: true,
    },
  });

  if (!website) {
    throw new Error("Website not found or access denied.");
  }

  const existingContent =
    website.content &&
    typeof website.content === "object" &&
    !Array.isArray(website.content)
      ? website.content
      : {};

  const existingEnvelope =
    existingContent.envelope &&
    typeof existingContent.envelope === "object" &&
    !Array.isArray(existingContent.envelope)
      ? existingContent.envelope
      : {};

  await prisma.giftWebsite.update({
    where: {
      id: website.id,
    },
    data: {
      content: {
        ...existingContent,
        envelope: {
          ...existingEnvelope,
          ...envelopeContent,
        },
      },
    },
  });

  return { success: true };
}



export async function saveGuestbookEmail(websiteId, email) {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("You must be signed in to edit this website.");
  }

  if (
    typeof websiteId !== "string" ||
    typeof email !== "string"
  ) {
    throw new Error("Invalid guestbook email.");
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length > 254) {
    throw new Error("The email address cannot exceed 254 characters.");
  }

  if (
    trimmedEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
  ) {
    throw new Error("Please enter a valid email address.");
  }

  const website = await prisma.giftWebsite.findFirst({
    where: {
      id: websiteId,
      ownerId: userId,
      templateId: "birthday-classic",
    },
    select: {
      id: true,
    },
  });

  if (!website) {
    throw new Error("Website not found or access denied.");
  }

  await prisma.giftWebsite.update({
    where: {
      id: website.id,
    },
    data: {
      guestbookEmail: trimmedEmail || null,
    },
  });

  return { success: true };
}


export async function saveFinalPhotograph(websiteId, submittedContent) {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("You must be signed in to edit this website.");
  }

  if (
    typeof websiteId !== "string" ||
    !submittedContent ||
    typeof submittedContent !== "object" ||
    Array.isArray(submittedContent)
  ) {
    throw new Error("Invalid final photograph content.");
  }

  const finalPhotographContent = {};

  for (const field of ["line1", "line2"]) {
    const value = submittedContent[field];

    if (typeof value !== "string") {
      throw new Error(`Invalid final photograph ${field}.`);
    }

    const trimmedValue = value.trim();

    if (!trimmedValue || trimmedValue.length > 300) {
      throw new Error(
        `Final photograph ${field} must contain between 1 and 300 characters.`,
      );
    }

    finalPhotographContent[field] = trimmedValue;
  }

  const imageAssetId = submittedContent.imageAssetId;

  if (
    imageAssetId !== null &&
    imageAssetId !== undefined &&
    typeof imageAssetId !== "string"
  ) {
    throw new Error("Invalid final photograph image.");
  }

  const website = await prisma.giftWebsite.findFirst({
    where: {
      id: websiteId,
      ownerId: userId,
      templateId: "birthday-classic",
    },
    select: {
      id: true,
      content: true,
    },
  });

  if (!website) {
    throw new Error("Website not found or access denied.");
  }

  if (typeof imageAssetId === "string" && imageAssetId.trim()) {
    const imageAsset = await prisma.giftAsset.findFirst({
      where: {
        id: imageAssetId,
        websiteId: website.id,
        ownerId: userId,
        sectionId: "final-photograph",
        status: "READY",
      },
      select: {
        id: true,
      },
    });

    if (!imageAsset) {
      throw new Error(
        "The selected image was not found in Final Photograph.",
      );
    }

    finalPhotographContent.imageAssetId = imageAsset.id;
  } else {
    finalPhotographContent.imageAssetId = null;
  }

  const existingContent =
    website.content &&
    typeof website.content === "object" &&
    !Array.isArray(website.content)
      ? website.content
      : {};

  const existingFinalPhotograph =
    existingContent.finalPhotograph &&
    typeof existingContent.finalPhotograph === "object" &&
    !Array.isArray(existingContent.finalPhotograph)
      ? existingContent.finalPhotograph
      : {};

  await prisma.giftWebsite.update({
    where: {
      id: website.id,
    },
    data: {
      content: {
        ...existingContent,
        finalPhotograph: {
          ...existingFinalPhotograph,
          ...finalPhotographContent,
        },
      },
    },
  });

  return { success: true };
}

