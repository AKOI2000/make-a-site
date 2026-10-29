import Link from "next/link";
import "./landing.scss";

export default function LandingPage() {
  return (
    <main className="landing">
      <header className="landing__header">
        <Link href="/" className="landing__logo">
          Make-A-Site<span>.</span>
        </Link>

        <nav className="landing__nav">
          <Link href="#how-it-works">How it works</Link>
          <Link href="/signin" className="landing__nav-cta">
            Get started
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="landing__section landing__split landing__hero">
        <div className="landing__stack">
          <span className="landing__eyebrow">A gift that feels personal</span>

          <h1 className="landing__title landing__title--xl">
            Some people
            <br />
            deserve <span>more.</span>
          </h1>

          <p className="landing__lead">
            Turn your memories, photos and heartfelt words into a website made
            for someone special.
          </p>

          <div className="landing__hero-actions">
            <Link href="/signin" className="landing__button">
              Create your gift <span>↗</span>
            </Link>
            <Link href="#how-it-works" className="landing__text-link">
              Discover how it works
            </Link>
          </div>

          <span className="landing__hero-note">
            Your story. Your memories. Your gift.
          </span>
        </div>

        <div className="landing__hero-visual">
          <div className="landing__image landing__image--main">
            <span>A little piece of your story</span>
          </div>
          <div className="landing__image landing__image--small">
            <span>Made with love</span>
          </div>
          <div className="landing__note">
            <span>♡</span>
            Made just for you
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="landing__section landing__section--paper landing__stack">
        <span className="landing__eyebrow">Not just another gift</span>

        <h2 className="landing__title">
          Make it personal.
          <br />
          Make it <span>memorable.</span>
        </h2>

        <p className="landing__lead">
          The best gifts tell a story. Bring yours to life with a personalised
          website filled with the moments and words that matter.
        </p>
      </section>

      {/* FEATURES */}
      <section className="landing__section landing__features">
        <article className="landing__split landing__feature">
          <div className="landing__feature-visual landing__feature-visual--memories">
            <span className="landing__feature-num">01</span>
            <div className="landing__paper">
              <span className="landing__eyebrow">Our favourite moments</span>
              <p className="landing__serif">Little memories, forever.</p>
            </div>
          </div>

          <div className="landing__stack landing__feature-copy">
            <span className="landing__eyebrow">The memories</span>
            <h3 className="landing__title landing__title--sm">
              Every photo has a story.
            </h3>
            <p className="landing__lead">
              Bring your favourite moments together in one beautiful place.
            </p>
          </div>
        </article>

        <article className="landing__split landing__feature landing__feature--reverse">
          <div className="landing__feature-visual landing__feature-visual--words">
            <span className="landing__feature-num">02</span>
            <div className="landing__paper landing__paper--letter">
              <span className="landing__eyebrow">Dear you,</span>
              <p className="landing__serif">
                There are so many things I want you to know, and so many
                reasons you matter to me.
              </p>
              <span className="landing__eyebrow">With love, always.</span>
            </div>
          </div>

          <div className="landing__stack landing__feature-copy">
            <span className="landing__eyebrow">The words</span>
            <h3 className="landing__title landing__title--sm">
              Say what matters.
            </h3>
            <p className="landing__lead">
              Create a space for your wishes, your feelings and everything you
              want them to remember.
            </p>
          </div>
        </article>

        <article className="landing__split landing__feature">
          <div className="landing__feature-visual landing__feature-visual--gift">
            <span className="landing__feature-num">03</span>
            <div className="landing__paper">
              <span className="landing__eyebrow">For someone special</span>
              <p className="landing__serif">Open when you&apos;re ready ♡</p>
            </div>
          </div>

          <div className="landing__stack landing__feature-copy">
            <span className="landing__eyebrow">The experience</span>
            <h3 className="landing__title landing__title--sm">
              A gift they can revisit.
            </h3>
            <p className="landing__lead">
              Share their personal website and give them something to return to
              long after the occasion.
            </p>
          </div>
        </article>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="landing__section landing__section--paper landing__stack landing__stack--loose"
      >
        <div className="landing__stack">
          <span className="landing__eyebrow">Simple by design</span>
          <h2 className="landing__title">
            Three steps.
            <br />
            One meaningful gift.
          </h2>
        </div>

        <div className="landing__steps">
          <article className="landing__step">
            <span>01</span>
            <h3 className="landing__title landing__title--xs">
              Choose your starting point.
            </h3>
            <p>Begin with a thoughtfully designed gift website.</p>
          </article>

          <article className="landing__step">
            <span>02</span>
            <h3 className="landing__title landing__title--xs">Make it yours.</h3>
            <p>Add your photos, personal messages and favourite memories.</p>
          </article>

          <article className="landing__step">
            <span>03</span>
            <h3 className="landing__title landing__title--xs">
              Share something special.
            </h3>
            <p>Publish your website and send them a gift made just for them.</p>
          </article>
        </div>

        <Link href="/signin" className="landing__button">
          Start creating <span>↗</span>
        </Link>
      </section>

      {/* CLOSING */}
      <section className="landing__section landing__section--tint landing__stack">
        <span className="landing__eyebrow">For the people who matter</span>

        <h2 className="landing__title">
          Give them something
          <br />
          that feels like <span>you.</span>
        </h2>

        <p className="landing__lead">
          Some moments deserve their own little corner of the internet.
        </p>

        <Link href="/signin" className="landing__button">
          Create your gift <span>↗</span>
        </Link>
      </section>

      <footer className="landing__footer">
        <Link href="/" className="landing__logo">
          Make-A-Site<span>.</span>
        </Link>
        <p>Made for meaningful moments.</p>
        <span>© {new Date().getFullYear()} Make-A-Site</span>
      </footer>
    </main>
  );
}