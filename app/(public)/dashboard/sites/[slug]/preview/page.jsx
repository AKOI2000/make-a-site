
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/app/lib/auth-sessions";
import { prisma } from "@/lib/prisma";
import { getUserWebsiteBySlug } from "@/lib/data/websites";
import { introContent } from "@/app/lib/content";
import birthdayClassicSections from "@/app/_template/birthday-classic/sections";
import BirthdayClassic from "@/app/_template/birthday-classic/BirthdayClassic";
import "./preview.scss";

export const metadata = {
  title: "Website Preview | Make-A-Site",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PreviewWebsitePage({ params }) {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const { slug } = await params;

  const website = await getUserWebsiteBySlug(session.user.id, slug);

  if (!website) {
    notFound();
  }

  if (website.templateId !== "birthday-classic") {
    notFound();
  }

  const assets = await prisma.giftAsset.findMany({
    where: {
      websiteId: website.id,
      ownerId: session.user.id,
      sectionId: "memories",
      status: "READY",
    },
    orderBy: {
      sortOrder: "asc",
    },
    select: {
      id: true,
      altText: true,
      caption: true,
      sortOrder: true,
    },
  });

  const content = {
    ...website.content,
    intro: {
      message: website.content?.intro?.message ?? introContent.message,
    },
    envelope: website.content?.envelope,
    memories: assets.map((asset) => ({
      id: asset.id,
      imagelink: `/api/websites/${encodeURIComponent(website.id)}/assets/${encodeURIComponent(asset.id)}?sectionId=memories`,
      imageAlt: asset.altText || asset.caption || "A birthday memory",
      caption: asset.caption || "",
    })),
  };

  const sections =
    Array.isArray(website.sections) && website.sections.length > 0
      ? website.sections
      : birthdayClassicSections;

  return (
    <main className="website-preview">
      <BirthdayClassic content={content} sections={sections} isPreview />
    </main>
  );
}
