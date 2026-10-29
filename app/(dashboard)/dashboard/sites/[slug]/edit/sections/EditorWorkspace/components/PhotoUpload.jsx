
"use client";

export default function PhotoUpload({
  isUploading,
  isLoading,
  onUpload,
}) {
  return (
    <div className="photo-manager__upload">
      <label htmlFor="memory-wall-photos">
        Choose photos
      </label>

      <input
        id="memory-wall-photos"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={isUploading || isLoading}
        onChange={onUpload}
      />
    </div>
  );
}
