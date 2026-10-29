
"use client";

import Image from "next/image";

export default function PhotoCard({
  asset,
  imageUrl,
  isSaving,
  isReplacing,
  isDeleting,
  onFieldChange,
  onSave,
  onReplace,
  onDelete,
  isBusy,
}) {
  return (
    <figure className="photo-manager__item">
      <Image
        key={imageUrl}
        src={imageUrl}
        alt={asset.altText || asset.caption || ""}
        width={600}
        height={400}
        unoptimized
        style={{
          width: "100%",
          height: "auto",
          objectFit: "cover",
        }}
      />

      <div className="photo-manager__fields">
        <label htmlFor={`caption-${asset.id}`}>
          Photo caption
        </label>

        <input
          id={`caption-${asset.id}`}
          type="text"
          value={asset.caption}
          placeholder="e.g. Our favourite memory"
          maxLength={300}
          disabled={isBusy}
          onChange={(event) =>
            onFieldChange(asset.id, "caption", event.target.value)
          }
        />

        <label htmlFor={`alt-${asset.id}`}>
          Image alt text <span>(optional)</span>
        </label>

        <input
          id={`alt-${asset.id}`}
          type="text"
          value={asset.altText}
          placeholder="Describe the photo for screen readers"
          maxLength={300}
          disabled={isBusy}
          onChange={(event) =>
            onFieldChange(asset.id, "altText", event.target.value)
          }
        />

        <button
          type="button"
          disabled={isBusy}
          onClick={() => onSave(asset)}
        >
          {isSaving ? "Saving..." : "Save photo details"}
        </button>

        <label
          className="photo-manager__replace"
          htmlFor={`replace-${asset.id}`}
          aria-disabled={isBusy}
        >
          {isReplacing ? "Replacing..." : "Replace photo"}
        </label>

        <input
          className="photo-manager__replace-input"
          id={`replace-${asset.id}`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={isBusy}
          onChange={(event) => onReplace(asset, event)}
        />

        <button
          type="button"
          disabled={isBusy}
          onClick={() => onDelete(asset)}
        >
          {isDeleting ? "Deleting..." : "Delete photo"}
        </button>
      </div>

      {asset.caption && <figcaption>{asset.caption}</figcaption>}
    </figure>
  );
}
