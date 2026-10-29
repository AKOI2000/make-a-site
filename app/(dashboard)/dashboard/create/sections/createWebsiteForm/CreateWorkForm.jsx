"use client";

import { useState } from "react";
import TemplateSelection from "../TemplateSelection/TemplateSelection";
import "./CreateWorkForm.scss";
import { createWebsite } from "@/app/(dashboard)/dashboard/create/actions";

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CreateWebsiteForm() {
  const [recipientName, setRecipientName] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [templateId, setTemplateId] = useState("birthday-classic");

  function handleRecipientChange(event) {
    const value = event.target.value;

    setRecipientName(value);

    if (!slugEdited) {
      setSlug(createSlug(value));
    }

    setTitle((current) => {
      if (!current || current === `${recipientName}'s Birthday Website`) {
        return value.trim() ? `${value.trim()}'s Birthday Website` : "";
      }

      return current;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    formData.set("templateId", templateId);

    createWebsite(formData);
  }

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <input type="hidden" name="recipientName" value={recipientName} />
      <div className="create-form__field">
        <label htmlFor="recipientName">Who is this gift for?</label>

        <input
          id="recipientName"
          name="recipientName"
          type="text"
          placeholder="e.g. Alausa"
          value={recipientName}
          onChange={handleRecipientChange}
          maxLength={80}
          required
        />
      </div>

      <div className="create-form__field">
        <label htmlFor="websiteTitle">Website title</label>

        <input
          id="websiteTitle"
          name="websiteTitle"
          type="text"
          placeholder="e.g. Alausa's Birthday Website"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={100}
          required
        />
      </div>

      <div className="create-form__field">
        <label htmlFor="websiteSlug">Website address</label>

        <div className="create-form__url">
          <span>your-domain.com/</span>

          <input
            id="websiteSlug"
            name="slug"
            type="text"
            placeholder="alausa"
            value={slug}
            onChange={(event) => {
              setSlugEdited(true);
              setSlug(createSlug(event.target.value));
            }}
            maxLength={60}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
          />
        </div>

        <p className="create-form__hint">
          You can edit the address before creating your website.
        </p>
      </div>

      <TemplateSelection
        selectedTemplate={templateId}
        onSelect={setTemplateId}
      />

      <footer className="create-form__footer">
        <p>Your website will start as a private draft.</p>

        <button type="submit">Continue</button>
      </footer>
    </form>
  );
}
