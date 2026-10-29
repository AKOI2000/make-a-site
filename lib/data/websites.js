import { prisma } from "@/lib/prisma";
import birthdayClassicSections from "@/app/_template/birthday-classic/sections";

export async function getUserWebsites(userId, limit) {
  if (!userId) {
    throw new Error("A user ID is required to fetch websites.");
  }

  return prisma.giftWebsite.findMany({
    where: {
      ownerId: userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    ...(limit ? { take: limit } : {}),
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      updatedAt: true,
      templateId: true,
    },
  });
}

export async function createWebsiteApi({
  ownerId,
  title,
  slug,
  template,
  recipientName,
}) {
  const sections =
    template.id === "birthday-classic" ? birthdayClassicSections : [];

  return prisma.giftWebsite.create({
    data: {
      ownerId,
      title,
      slug,
      occasionType: template.occasion,
      templateId: template.id,
      templateVersion: template.version,
      status: "DRAFT",
      content: {
        recipientName,
      },
      sections,
      guestbook: {
        create: {
          status: "CLOSED",
          wishCount: 0,
          roundNumber: 1,
        },
      },
    },
    select: {
      slug: true,
    },
  });
}

export async function getUserWebsiteBySlug(userId, slug) {
  if (!userId || !slug) {
    throw new Error("A user ID and website slug are required.");
  }

  return prisma.giftWebsite.findFirst({
    where: {
      ownerId: userId,
      slug,
    },
    select: {
      id: true,
      ownerId: true,
      title: true,
      slug: true,
      status: true,
      content: true,
      sections: true,
      templateId: true,
      templateVersion: true,
      updatedAt: true,
      guestbookEmail: true,
    },
  });
}

export async function getPublishedWebsiteBySlug(slug) {
  if (!slug) {
    throw new Error("A website slug is required.");
  }

  return prisma.giftWebsite.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      content: true,
      sections: true,
      templateId: true,
      templateVersion: true,
      publishedAt: true,
      guestbookEmail: true,

      owner: {
        select: {
          email: true,
        },
      },

      assets: {
        where: {
          status: "READY",
        },
        orderBy: {
          sortOrder: "asc",
        },
        select: {
          id: true,
          sectionId: true,
          altText: true,
          caption: true,
          sortOrder: true,
          status: true,
        },
      },

      guestbook: {
        select: {
          id: true,
          status: true,
          wishCount: true,
          roundNumber: true,
          wishes: {
            orderBy: {
              createdAt: "asc",
            },
            select: {
              id: true,
              guestName: true,
              message: true,
              photoKey: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });
}
