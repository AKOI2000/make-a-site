
import Image from "next/image";
import Link from "next/link";
import { getTemplateById } from "@/lib/templates/registry";
import birthdayClassicSections from "@/app/_template/birthday-classic/sections";
import SectionControls from "./SectionControls";
import "./EditorWorkspace.scss";

export default function EditorWorkspace({ website }) {
  const template = getTemplateById(website.templateId);
  const previewHref = `/dashboard/sites/${website.slug}/preview`;

  const sections =
    Array.isArray(website.sections) && website.sections.length > 0
      ? website.sections
      : website.templateId === "birthday-classic"
        ? birthdayClassicSections
        : [];

  return (
    <main className="editor-workspace">
      <aside className="editor-workspace__panel">
        <div className="editor-workspace__panel-header">
          <span className="editor-workspace__eyebrow">YOUR WEBSITE</span>

          <h2 className="editor-workspace__panel-title">Make it personal</h2>

          <p className="editor-workspace__panel-description">
            Add the little details that make this gift yours.
          </p>
        </div>

        <div className="editor-workspace__section">
          <span className="editor-workspace__section-number">01</span>
          <div>
            <h3>Content</h3>
            <p>Edit your messages, photos and wishes.</p>
          </div>
        </div>

        <div className="editor-workspace__section">
          <span className="editor-workspace__section-number">02</span>
          <div>
            <h3>Sections</h3>
            <p>Choose what appears on your website.</p>
          </div>
        </div>

        <div className="editor-workspace__section">
          <span className="editor-workspace__section-number">03</span>
          <div>
            <h3>Photos and music</h3>
            <p>Add personal memories to your website.</p>
          </div>
        </div>

        <SectionControls
          websiteId={website.id}
          initialSections={sections}
          initialContent={website.content}
          initialGuestbookEmail={website.guestbookEmail ?? ""}
        />
      </aside>

      <section className="editor-workspace__preview-area">
        <div className="editor-workspace__preview-toolbar">
          <div>
            <span className="editor-workspace__preview-label">
              WEBSITE PREVIEW
            </span>
            <p>See how your website will look.</p>
          </div>
        </div>

        <div className="editor-workspace__preview-placeholder">
          {template?.previewImage ? (
            <div className="editor-workspace__image-wrapper">
              <Image
                src={template.previewImage}
                alt={`${template.name} template preview`}
                width={1200}
                height={750}
                priority
                className="editor-workspace__template-image"
              />
            </div>
          ) : (
            <div className="editor-workspace__image-fallback">
              <span className="editor-workspace__eyebrow">
                TEMPLATE PREVIEW
              </span>
              <p>Preview image unavailable.</p>
            </div>
          )}

          <div className="editor-workspace__preview-placeholder-content">
            <span className="editor-workspace__eyebrow">
              YOUR SELECTED TEMPLATE
            </span>

            <h2>{template?.name ?? website.templateId}</h2>

            <p>{template?.description ?? "Your selected website template."}</p>

            <Link
              href={previewHref}
              className="editor-workspace__preview-link"
              target="_blank"
            >
              Open full preview
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
