import Link from "next/link";

function WebsiteHeader() {
  return (
    <div className="website-list__header">
      <div>
        <h2 className="website-list__title">Your websites</h2>
        <p className="website-list__description">
          All your thoughtful little creations, in one place.
        </p>
      </div>

      <Link href="/dashboard/sites" className="website-list__view-all">
        View all
      </Link>
    </div>
  );
}

export default WebsiteHeader;
