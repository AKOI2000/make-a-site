
"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/lib/auth-sessions";
import { getTemplateById } from "@/lib/templates/registry";
import birthdayClassicSections from "@/app/_template/birthday-classic/sections";

export async function saveWebsiteSections(websiteId, submittedSections) {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("You must be signed in to edit this website.");
  }

  if (
    typeof websiteId !== "string" ||
    !Array.isArray(submittedSections)
  ) {
    throw new Error("Invalid section update.");
  }

  const website = await prisma.giftWebsite.findFirst({
    where: {
      id: websiteId,
      ownerId: userId,
    },
    select: {
      id: true,
      templateId: true,
    },
  });

  if (!website) {
    throw new Error("Website not found or access denied.");
  }

  const template = getTemplateById(website.templateId);

  if (!template) {
    throw new Error("The website template is not available.");
  }

  const defaults =
    template.id === "birthday-classic"
      ? birthdayClassicSections
      : null;

  if (!defaults || submittedSections.length !== defaults.length) {
    throw new Error("Invalid section configuration.");
  }

  const submittedById = new Map();

  for (const section of submittedSections) {
    if (
      !section ||
      typeof section.id !== "string" ||
      submittedById.has(section.id) ||
      typeof section.visible !== "boolean" ||
      !Number.isInteger(section.order)
    ) {
      throw new Error("Invalid section configuration.");
    }

    submittedById.set(section.id, section);
  }

  const sections = defaults.map((defaultSection) => {
    const submitted = submittedById.get(defaultSection.id);

    if (!submitted || submitted.order < 0 || submitted.order >= defaults.length) {
      throw new Error("Invalid section configuration.");
    }

    return {
      id: defaultSection.id,
      label: defaultSection.label,
      visible: submitted.visible,
      order: submitted.order,
    };
  });

  const orders = sections.map((section) => section.order);

  if (new Set(orders).size !== defaults.length) {
    throw new Error("Section positions must be unique.");
  }

  sections.sort((a, b) => a.order - b.order);

  const normalisedSections = sections.map((section, order) => ({
    ...section,
    order,
  }));

  await prisma.giftWebsite.update({
    where: {
      id: website.id,
    },
    data: {
      sections: normalisedSections,
    },
  });

  return { success: true };
}
