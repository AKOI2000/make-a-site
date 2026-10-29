
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { publishWebsite } from "./publish-actions";
import "./EditorHeader.scss";

export default function EditorHeader({ website }) {
  const [isPublished, setIsPublished] = useState(
    website.status === "PUBLISHED",
  );
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handlePublish() {
    setError("");

    startTransition(async () => {
      try {
        const result = await publishWebsite(website.id);

        if (result.success) {
          setIsPublished(true);
        }
      } catch (error) {
        setError(error.message || "Could not publish this website.");
      }
    });
  }

  return (
    <header className="editor-header">
      <Link
        href="/dashboard/sites"
        className="editor-header__back"
        aria-label="Back to your websites"
      >
        <span aria-hidden="true">←</span>
        <span className="editor-header__back-label">My websites</span>
      </Link>

      <div className="editor-header__details">
        <h1 className="editor-header__title">
          {website.title || "Untitled website"}
        </h1>

        <span
          className={`editor-header__status editor-header__status--${
            isPublished ? "published" : "draft"
          }`}
        >
          {isPublished ? "Published" : "Draft"}
        </span>
      </div>

      <div className="editor-header__actions">
        <button
          type="button"
          className="editor-header__publish-button"
          disabled={isPublished || isPending}
          onClick={handlePublish}
        >
          {isPending
            ? "Publishing..."
            : isPublished
              ? "Published"
              : "Publish"}
        </button>

        {error && <p role="alert">{error}</p>}
      </div>
    </header>
  );
}
