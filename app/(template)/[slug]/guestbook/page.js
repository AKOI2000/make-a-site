
import { notFound } from "next/navigation";
import Link from "next/link";

import { getPublishedWebsiteBySlug } from "@/lib/data/websites";
import "./guestbook.scss";
import GuestbookForm from "./sections/GuestbookForm/GuestBookForm";

export default async function GuestbookPage({ params }) {
  const { slug } = await params;

  const website = await getPublishedWebsiteBySlug(slug);

  if (!website || website.templateId !== "birthday-classic") {
    notFound();
  }

  const wishCount = website.guestbook?.wishCount ?? 0;
  const isFull = wishCount >= 20;

  return (
    <main className="public-guestbook">
      <header className="public-guestbook__header">
        <p className="public-guestbook__eyebrow">
          A LITTLE SOMETHING SPECIAL
        </p>

        <h1>Birthday Guestbook</h1>

        <p>
          Leave a heartfelt message and help make this birthday even more
          memorable.
        </p>
      </header>

      {isFull ? (
        <section className="public-guestbook__notice">
          <h2>The guestbook is full</h2>
          <p>
            This round has received all 20 wishes. Thank you for wanting
            to share a message.
          </p>
        </section>
      ) : (
        <GuestbookForm slug={slug} initialWishCount={wishCount} />
      )}

      <footer className="public-guestbook__footer">
        <Link href={`/${encodeURIComponent(slug)}`}>
          Return to the birthday website
        </Link>
      </footer>
    </main>
  );
}
