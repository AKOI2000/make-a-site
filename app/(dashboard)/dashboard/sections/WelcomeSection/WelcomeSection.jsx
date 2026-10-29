import Link from "next/link";
import "./WelcomeSection.scss";

export default function WelcomeSection({ name }) {
  const firstName = name?.trim().split(/\s+/)[0] || "there";

  return (
    <section className="welcome-section">
      <p className="welcome-section__eyebrow">A little something special</p>

      <h2 className="welcome-section__title">Welcome, {firstName}!</h2>

      <p className="welcome-section__description">
        Turn your favourite memories, photos, and heartfelt words into a
        beautiful gift website for someone you love.
      </p>

      <Link href="/dashboard/create" className="welcome-section__button">
        Create a website
      </Link>
    </section>
  );
}
