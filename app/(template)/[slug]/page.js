import { notFound } from "next/navigation";
import { getPublishedWebsiteBySlug } from "@/lib/data/websites";
import { getTemplateById } from "@/lib/templates/registry";
import BirthdayClassic from "@/app/_template/birthday-classic/BirthdayClassic";

export default async function Page({ params }) {
  const { slug } = await params;

  const website = await getPublishedWebsiteBySlug(slug);

  if (!website) notFound();

  const template = getTemplateById(website.templateId);

  if (!template || website.templateId !== "birthday-classic") {
    notFound();
  }

  const memories = website.assets
    .filter(
      (asset) => asset.sectionId === "memories" && asset.status === "READY",
    )
    .map((asset) => ({
      id: asset.id,
      imagelink:
        `/api/public/websites/${encodeURIComponent(website.slug)}/assets/${encodeURIComponent(asset.id)}` +
        `?sectionId=memories`,
      imageAlt: asset.altText || asset.caption || "A birthday memory",
      caption: asset.caption || "",
    }));

  const finalPhotographAsset = website.assets.find(
    (asset) =>
      asset.sectionId === "final-photograph" && asset.status === "READY",
  );


  const finalPhotograph = {
    ...website.content?.finalPhotograph,
    image: finalPhotographAsset
      ? `/api/public/websites/${encodeURIComponent(website.slug)}/assets/${encodeURIComponent(finalPhotographAsset.id)}` +
        `?sectionId=final-photograph`
      : "/final-photograph.jpeg",
    altText: finalPhotographAsset
      ? finalPhotographAsset.altText ||
        finalPhotographAsset.caption ||
        "A personal photograph"
      : "A personal photograph",
  };

  const guestbook = website.guestbook
    ? {
        id: website.guestbook.id,
        slug: website.slug,
        status: website.guestbook.status,
        wishCount: website.guestbook.wishCount,
        roundNumber: website.guestbook.roundNumber,
        guestbookEmail: website.guestbookEmail,
        wishes: website.guestbook.wishes.map((wish) => ({
          id: wish.id,
          guestName: wish.guestName,
          message: wish.message,
          createdAt: wish.createdAt.toISOString(),
          photoUrl: wish.photoKey
            ? `/api/public/websites/${encodeURIComponent(website.slug)}/guestbook/photos/${encodeURIComponent(wish.id)}`
            : null,
        })),
      }
    : null;

  const content = {
    ...website.content,
    memories,
    finalPhotograph,
    guestbook,
  };

  return <BirthdayClassic content={content} sections={website.sections} />;
}
