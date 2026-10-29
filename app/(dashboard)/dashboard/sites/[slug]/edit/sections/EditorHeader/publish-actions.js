
"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/lib/auth-sessions";
import { getTemplateById } from "@/lib/templates/registry";

export async function publishWebsite(websiteId) {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("You must be signed in to publish this website.");
  }

  if (typeof websiteId !== "string" || !websiteId) {
    throw new Error("Invalid website.");
  }

  const website = await prisma.giftWebsite.findFirst({
    where: {
      id: websiteId,
      ownerId: userId,
    },
    select: {
      id: true,
      templateId: true,
      status: true,
    },
  });

  if (!website) {
    throw new Error("Website not found or access denied.");
  }

  const template = getTemplateById(website.templateId);

  if (!template) {
    throw new Error("The website template is not available.");
  }

  if (website.status === "PUBLISHED") {
    return { success: true, alreadyPublished: true };
  }

  await prisma.giftWebsite.update({
    where: {
      id: website.id,
    },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  return { success: true };
}
