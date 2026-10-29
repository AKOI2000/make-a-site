
"use client";

export default function PhotoStatus({
  isLoading,
  isUploading,
  message,
  error,
}) {
  return (
    <>
      {isUploading && (
        <p role="status">Uploading photos...</p>
      )}

      {isLoading && (
        <p role="status">Loading saved photos...</p>
      )}

      {message && (
        <p role="status">{message}</p>
      )}

      {error && (
        <p role="alert">{error}</p>
      )}
    </>
  );
}
