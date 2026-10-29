"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/lib/auth-sessions";
import { getTemplateById } from "@/lib/templates/registry";

import { redirect } from "next/navigation";
import { createWebsiteApi } from "@/lib/data/websites";

export async function createWebsite(formData) {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("You must be signed in to create a website.");
  }

  const recipientName = formData.get("recipientName")?.toString().trim();
  const title = formData.get("websiteTitle")?.toString().trim();
  const slug = formData.get("slug")?.toString().trim().toLowerCase();
  const templateId = formData.get("templateId")?.toString();

  if (!recipientName || !title || !slug || !templateId) {
    throw new Error("Please complete all required fields.");
  }

  if (
    recipientName.length > 80 ||
    title.length > 100 ||
    slug.length > 60 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  ) {
    throw new Error("Please check your website details.");
  }

  const template = getTemplateById(templateId);

  if (!template) {
    throw new Error("The selected template is not available.");
  }

  const existingWebsite = await prisma.giftWebsite.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existingWebsite) {
    throw new Error("That website address is already taken.");
  }

  const website = await createWebsiteApi({
    ownerId: userId,
    title,
    slug,
    template,
    recipientName,
  });

  redirect(`/dashboard/sites/${website.slug}/edit`);
}



