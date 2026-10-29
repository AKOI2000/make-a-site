import Image from "next/image";
import Link from "next/link";
import { getTemplateById } from "@/lib/templates/registry";
import "./WebsiteList.scss";

export default function WebsiteList({ websites = [] }) {
  return (
    <section className="website-list">
      {websites.length > 0 ? (
        <div className="website-list__grid">
          {websites.map((website) => {
            const template = getTemplateById(website.templateId);

            return (
              <article className="website-card" key={website.id}>
                <div className="website-card__preview">
                  <Image
                    src={template.previewImage}
                    alt={`${template.name} template preview`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="website-card__preview-image"
                  />

                  <span
                    className={`website-card__status website-card__status--${website.status.toLowerCase()} website-card__preview-badge`}
                  >
                    {website.status === "PUBLISHED" ? "Published" : "Draft"}
                  </span>
                </div>

                <div className="website-card__body">
                  <h3 className="website-card__title">
                    {website.title || "Untitled website"}
                  </h3>

                  <p className="website-card__url">/{website.slug}</p>

                  <p className="website-card__updated">
                    Updated{" "}
                    {new Date(website.updatedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                  <div className="website-card__actions">
                    <Link
                      href={`/dashboard/sites/${website.slug}/edit`}
                      className="website-card__button website-card__button--primary"
                    >
                      Edit
                    </Link>

                    {website.status === "PUBLISHED" && (
                      <Link
                        href={`/${website.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="website-card__button"
                      >
                        View site ↗
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="website-list__empty">
          <span className="website-list__empty-icon" aria-hidden="true">
            ♡
          </span>

          <h3 className="website-list__empty-title">
            Your first gift website starts here
          </h3>

          <p className="website-list__empty-description">
            Create a special space filled with photos, memories, and messages
            for someone you love.
          </p>

          <Link
            href="/dashboard/create"
            className="website-list__create-button"
          >
            Create your first website
          </Link>
        </div>
      )}
    </section>
  );
}
