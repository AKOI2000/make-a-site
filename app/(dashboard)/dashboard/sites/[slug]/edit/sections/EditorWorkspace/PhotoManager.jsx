"use client";

import { useEffect, useState } from "react";
import "./PhotoManager.scss";

import PhotoUpload from "./components/PhotoUpload";
import PhotoCard from "./components/PhotoCard";
import PhotoStatus from "./components/PhotoStatus";

export default function PhotoManager({
  websiteId,
  sectionId = "memories",
  selectedAssetId = null,
  onSelectAsset,
  allowMultiple = true,
}) {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [savingAssetId, setSavingAssetId] = useState(null);
  const [replacingAssetId, setReplacingAssetId] = useState(null);
  const [deletingAssetId, setDeletingAssetId] = useState(null);
  const [selectingAssetId, setSelectingAssetId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const isFinalPhotograph = sectionId === "final-photograph";
  const showUpload = allowMultiple || assets.length === 0;

  const encodedWebsiteId = encodeURIComponent(websiteId ?? "");
  const encodedSectionId = encodeURIComponent(sectionId);

  function getAssetUrl(asset) {
    const baseUrl =
      `/api/websites/${encodedWebsiteId}/assets/${encodeURIComponent(asset.id)}`;

    return asset.previewVersion
      ? `${baseUrl}?sectionId=${encodedSectionId}&v=${asset.previewVersion}`
      : `${baseUrl}?sectionId=${encodedSectionId}`;
  }

  function getAssetEndpoint(assetId) {
    return (
      `/api/websites/${encodedWebsiteId}/assets/${encodeURIComponent(assetId)}` +
      `?sectionId=${encodedSectionId}`
    );
  }

  useEffect(() => {
    let cancelled = false;

    async function loadAssets() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/websites/${encodedWebsiteId}/assets?sectionId=${encodedSectionId}`,
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "The uploaded photos could not be retrieved.",
          );
        }

        if (!cancelled) {
          setAssets(
            (result.assets ?? []).map((asset) => ({
              ...asset,
              caption: asset.caption ?? "",
              altText: asset.altText ?? "",
            })),
          );
        }
      } catch (loadError) {
        console.error("Asset loading failed:", loadError);

        if (!cancelled) {
          setError("The uploaded photos could not be loaded.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    if (websiteId && sectionId) {
      loadAssets();
    } else {
      setAssets([]);
      setIsLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [websiteId, sectionId, encodedWebsiteId, encodedSectionId]);

  function handleFieldChange(assetId, field, value) {
    setAssets((current) =>
      current.map((asset) =>
        asset.id === assetId ? { ...asset, [field]: value } : asset,
      ),
    );
  }

  async function handleSaveAsset(asset) {
    setError("");
    setMessage("");
    setSavingAssetId(asset.id);

    try {
      const response = await fetch(getAssetEndpoint(asset.id), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caption: asset.caption,
          altText: asset.altText.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "The photo details could not be saved.",
        );
      }

      if (result.asset) {
        setAssets((current) =>
          current.map((item) =>
            item.id === asset.id
              ? {
                  ...item,
                  ...result.asset,
                  caption: result.asset.caption ?? "",
                  altText: result.asset.altText ?? "",
                }
              : item,
          ),
        );
      }

      setMessage("Photo details saved successfully.");
    } catch (saveError) {
      console.error("Saving photo details failed:", saveError);
      setError(saveError.message || "The photo details could not be saved.");
    } finally {
      setSavingAssetId(null);
    }
  }

  async function handleSelectAsset(asset) {
    if (!isFinalPhotograph || typeof onSelectAsset !== "function") return;

    setError("");
    setMessage("");
    setSelectingAssetId(asset.id);

    try {
      await onSelectAsset(asset.id);
      setMessage("Final Photograph selection saved successfully.");
    } catch (selectError) {
      console.error("Selecting Final Photograph failed:", selectError);
      setError(
        selectError.message || "The photograph selection could not be saved.",
      );
    } finally {
      setSelectingAssetId(null);
    }
  }

  async function handleUpload(event) {
    const input = event.target;
    const files = Array.from(input.files ?? []);

    if (files.length === 0) return;

    setError("");
    setMessage("");

    if (!allowMultiple && files.length > 1) {
      setError("Please select only one image.");
      input.value = "";
      return;
    }

    if (!allowMultiple && assets.length > 0) {
      setError("Delete the existing image before uploading another.");
      input.value = "";
      return;
    }

    if (
      files.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.type),
      )
    ) {
      setError("Please select JPEG, PNG or WebP images only.");
      input.value = "";
      return;
    }

    if (files.some((file) => file.size === 0 || file.size > 10 * 1024 * 1024)) {
      setError("Each image must be between 1 byte and 10 MB.");
      input.value = "";
      return;
    }

    setIsUploading(true);

    let uploadedCount = 0;
    let failedCount = 0;
    const uploadedAssets = [];

    try {
      for (const file of files) {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("sectionId", sectionId);

        const response = await fetch(
          `/api/websites/${encodedWebsiteId}/assets`,
          {
            method: "POST",
            body: formData,
          },
        );

        const result = await response.json();

        if (!response.ok) {
          failedCount += 1;
          setError(
            result.message || "One or more photos could not be uploaded.",
          );
          continue;
        }

        if (result.asset) {
          uploadedAssets.push({
            ...result.asset,
            caption: result.asset.caption ?? "",
            altText: result.asset.altText ?? "",
          });

          uploadedCount += 1;
        }
      }

      if (uploadedAssets.length > 0) {
        setAssets((current) => [...current, ...uploadedAssets]);
      }

      if (uploadedCount > 0 && failedCount === 0) {
        setMessage(
          `${uploadedCount} ${uploadedCount === 1 ? "photo" : "photos"} uploaded successfully.`,
        );
        setError("");
      } else if (uploadedCount > 0) {
        setMessage(`${uploadedCount} photo(s) uploaded. Some uploads failed.`);
      } else if (failedCount === 0) {
        setError("No photos were uploaded.");
      }
    } catch (uploadError) {
      console.error("Photo upload failed:", uploadError);
      setError("A connection error occurred. Please try again.");
    } finally {
      setIsUploading(false);
      input.value = "";
    }
  }

  async function handleReplace(asset, event) {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPEG, PNG or WebP image.");
      input.value = "";
      return;
    }

    if (file.size === 0 || file.size > 10 * 1024 * 1024) {
      setError("The replacement image must be between 1 byte and 10 MB.");
      input.value = "";
      return;
    }

    setReplacingAssetId(asset.id);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(getAssetEndpoint(asset.id), {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "The photo could not be replaced.");
      }

      setAssets((current) =>
        current.map((item) =>
          item.id === asset.id
            ? {
                ...item,
                ...result.asset,
                caption: result.asset?.caption ?? item.caption,
                altText: result.asset?.altText ?? item.altText,
                previewVersion: Date.now(),
              }
            : item,
        ),
      );

      setMessage(
        "Photo replaced successfully. Its caption and alt text were kept.",
      );
    } catch (replaceError) {
      console.error("Replacing photo failed:", replaceError);
      setError(replaceError.message || "The photo could not be replaced.");
    } finally {
      setReplacingAssetId(null);
      input.value = "";
    }
  }

  async function handleDelete(asset) {
    const confirmed = window.confirm(
      "Delete this photo? This action cannot be undone.",
    );

    if (!confirmed) return;

    setError("");
    setMessage("");
    setDeletingAssetId(asset.id);

    try {
      const response = await fetch(getAssetEndpoint(asset.id), {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "The photo could not be deleted.");
      }

      setAssets((current) =>
        current.filter((item) => item.id !== asset.id),
      );

      setMessage("Photo deleted successfully.");
    } catch (deleteError) {
      console.error("Deleting photo failed:", deleteError);
      setError(deleteError.message || "The photo could not be deleted.");
    } finally {
      setDeletingAssetId(null);
    }
  }

  function isBusy(assetId) {
    return (
      savingAssetId === assetId ||
      replacingAssetId === assetId ||
      deletingAssetId === assetId ||
      selectingAssetId === assetId
    );
  }

  return (
    <section className="photo-manager">
      <h3>
        {isFinalPhotograph ? "Final Photograph" : "Memory Wall photos"}
      </h3>

      <p>
        {isFinalPhotograph
          ? "Upload a photograph and select the one you want to use in the Final Photograph section."
          : "Upload the photos you want to include in the birthday website. JPEG, PNG and WebP images are supported, up to 10 MB each."}
      </p>

      {showUpload && (
        <PhotoUpload
          isUploading={isUploading}
          isLoading={isLoading}
          onUpload={handleUpload}
          multiple={allowMultiple}
        />
      )}

      <PhotoStatus
        isLoading={isLoading}
        isUploading={isUploading}
        message={message}
        error={error}
      />

      {!isLoading && assets.length === 0 && (
        <p>You have not uploaded any photos yet.</p>
      )}

      {assets.length > 0 && (
        <div className="photo-manager__grid">
          {assets.map((asset) => (
            <div key={asset.id}>
              {isFinalPhotograph && (
                <p>
                  {selectedAssetId === asset.id ? "Currently selected" : ""}
                </p>
              )}

              <PhotoCard
                asset={asset}
                imageUrl={getAssetUrl(asset)}
                isSaving={savingAssetId === asset.id}
                isReplacing={replacingAssetId === asset.id}
                isDeleting={deletingAssetId === asset.id}
                isBusy={isBusy(asset.id)}
                onFieldChange={handleFieldChange}
                onSave={handleSaveAsset}
                onReplace={handleReplace}
                onDelete={handleDelete}
              />

              {isFinalPhotograph && (
                <button
                  type="button"
                  disabled={Boolean(selectingAssetId) || isBusy(asset.id)}
                  onClick={() => handleSelectAsset(asset)}
                >
                  {selectingAssetId === asset.id
                    ? "Saving selection..."
                    : selectedAssetId === asset.id
                      ? "Selected photo"
                      : "Use this photo"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}