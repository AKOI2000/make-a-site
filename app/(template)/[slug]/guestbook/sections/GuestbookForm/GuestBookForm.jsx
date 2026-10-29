
"use client";

import { useState } from "react";
import "./GuestBookForm.scss"

export default function GuestbookForm({ slug, initialWishCount = 0 }) {
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState(null);
  const [wishCount, setWishCount] = useState(initialWishCount);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFull = wishCount >= 20;

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting || isFull) return;

    const form = event.currentTarget;

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const formData = new FormData(form);

      const response = await fetch(
        `/api/public/websites/${encodeURIComponent(slug)}/guestbook`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (
          response.status === 409 &&
          /full|20 wishes/i.test(result.message ?? "")
        ) {
          setWishCount(20);
          return;
        }

        throw new Error(
          result.message || "Your wish could not be submitted."
        );
      }

      setWishCount((count) => Math.min(count + 1, 20));
      setGuestName("");
      setMessage("");
      setPhoto(null);
      form.reset();

      setSuccess("Your birthday wish has been submitted. Thank you!");
    } catch (error) {
      setError(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isFull) {
    return (
      <section className="public-guestbook__notice" aria-live="polite">
        <h2>The guestbook is full</h2>
        <p>
          This round has received all 20 wishes. Thank you for wanting to
          share a message.
        </p>
      </section>
    );
  }

  return (
    <section className="public-guestbook__form">
      <p className="public-guestbook__progress">
        {wishCount} of 20 wishes received.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="public-guestbook__field">
          <label htmlFor="guestName">Your name</label>
          <input
            id="guestName"
            name="guestName"
            type="text"
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
            maxLength={80}
            autoComplete="name"
            placeholder="Enter your name"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="public-guestbook__field">
          <label htmlFor="message">Your birthday wish</label>
          <textarea
            id="message"
            name="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={2000}
            rows={6}
            placeholder="Write a heartfelt message..."
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="public-guestbook__field">
          <label htmlFor="photo">Add a photo (optional)</label>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) =>
              setPhoto(event.target.files?.[0] ?? null)
            }
            disabled={isSubmitting}
          />
          <p className="public-guestbook__hint">
            JPEG, PNG or WebP, up to 10 MB.
          </p>
        </div>

        {error && (
          <p className="public-guestbook__error" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="public-guestbook__success" role="status">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="public-guestbook__submit"
        >
          {isSubmitting ? "Submitting..." : "Send birthday wish"}
        </button>
      </form>
    </section>
  );
}
