import Link from "next/link";
import "./SitesHeader.scss";

export default function SitesHeader({ websiteCount = 0 }) {
  return (
    <header className="sites-header">
      <div className="sites-header__content">
        <h1 className="sites-header__title">Your websites</h1>

        <p className="sites-header__description">
          Manage all your thoughtful little creations in one place.
        </p>
      </div>

      <div className="sites-header__actions">
        <span className="sites-header__count">
          {websiteCount} {websiteCount === 1 ? "website" : "websites"}
        </span>

        <Link
          href="/dashboard/create"
          className="sites-header__create-button"
        >
          <span aria-hidden="true">+</span>
          Create website
        </Link>
      </div>
    </header>
  );
}