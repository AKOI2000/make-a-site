
"use client";

import { useState, useTransition } from "react";
import {
  envelope as defaultEnvelope,
  finalPhotograph as defaultFinalPhotograph,
} from "@/app/lib/content";
import { saveWebsiteSections } from "./section-actions";
import {
  saveIntroduction,
  saveEnvelope,
  saveGuestbookEmail,
  saveFinalPhotograph,
} from "./content-actions";
import PhotoManager from "./PhotoManager";
import "./SectionControls.scss";

const envelopeFields = [
  { name: "recipient", label: "Envelope recipient" },
  { name: "heading", label: "Letter heading" },
  { name: "greeting", label: "Greeting" },
  { name: "closing", label: "Closing" },
  { name: "signature", label: "Signature" },
];

function getObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

export default function SectionControls({
  websiteId,
  initialSections,
  initialContent,
  initialGuestbookEmail = "",
}) {
  const [sections, setSections] = useState(() =>
    [...initialSections].sort((a, b) => a.order - b.order),
  );

  const [introMessage, setIntroMessage] = useState(
    initialContent?.intro?.message ?? "",
  );

  const [guestbookEmail, setGuestbookEmail] = useState(
    initialGuestbookEmail,
  );

  const [letter, setLetter] = useState(() => ({
    ...defaultEnvelope,
    ...getObject(initialContent?.envelope),
    paragraphs: Array.isArray(initialContent?.envelope?.paragraphs)
      ? initialContent.envelope.paragraphs
      : [...defaultEnvelope.paragraphs],
  }));

  const [finalPhotoContent, setFinalPhotoContent] = useState(() => ({
    ...defaultFinalPhotograph,
    ...getObject(initialContent?.finalPhotograph),
  }));

  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  function save(action, value, successMessage) {
    setSaveError("");
    setSaveStatus("Saving changes...");

    startTransition(async () => {
      try {
        await action(websiteId, value);
        setSaveError("");
        setSaveStatus(successMessage);
      } catch (error) {
        console.error("Failed to save website changes:", error);

        setSaveError(
          error instanceof Error
            ? error.message
            : "Couldn't save your changes. Please try again.",
        );

        setSaveStatus("");
      }
    });
  }

  function saveSections(nextSections) {
    setSaveError("");
    setSaveStatus("Saving changes...");

    startTransition(async () => {
      try {
        await saveWebsiteSections(websiteId, nextSections);
        setSaveStatus("Changes saved.");
      } catch (error) {
        console.error("Failed to save website sections:", error);
        setSaveError("Couldn't save your changes. Please try again.");
        setSaveStatus("");
      }
    });
  }

  function toggleVisibility(sectionId) {
    const nextSections = sections.map((section) =>
      section.id === sectionId
        ? { ...section, visible: !section.visible }
        : section,
    );

    setSections(nextSections);
    saveSections(nextSections);
  }

  function moveSection(index, direction) {
    const nextSections = [...sections];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= nextSections.length) return;

    [nextSections[index], nextSections[targetIndex]] = [
      nextSections[targetIndex],
      nextSections[index],
    ];

    const reorderedSections = nextSections.map((section, order) => ({
      ...section,
      order,
    }));

    setSections(reorderedSections);
    saveSections(reorderedSections);
  }

  function handleIntroductionBlur() {
    const message = introMessage.trim();

    if (!message || message.length > 2000) {
      setSaveError("The introduction must contain 1 to 2,000 characters.");
      setSaveStatus("");
      return;
    }

    setIntroMessage(message);
    save(saveIntroduction, message, "Introduction saved.");
  }

  function handleLetterBlur() {
    const trimmedLetter = {
      ...letter,
      recipient: letter.recipient.trim(),
      heading: letter.heading.trim(),
      greeting: letter.greeting.trim(),
      closing: letter.closing.trim(),
      signature: letter.signature.trim(),
      paragraphs: letter.paragraphs.map((paragraph) => paragraph.trim()),
    };

    const values = [
      trimmedLetter.recipient,
      trimmedLetter.heading,
      trimmedLetter.greeting,
      trimmedLetter.closing,
      trimmedLetter.signature,
      ...trimmedLetter.paragraphs,
    ];

    if (
      values.some((value) => !value || value.length > 2000) ||
      envelopeFields.some((field) => trimmedLetter[field.name].length > 300) ||
      trimmedLetter.paragraphs.length !== 2
    ) {
      setSaveError("Please complete the birthday letter fields correctly.");
      setSaveStatus("");
      return;
    }

    setLetter(trimmedLetter);
    save(saveEnvelope, trimmedLetter, "Birthday letter saved.");
  }

  function handleGuestbookEmailBlur() {
    const email = guestbookEmail.trim();

    if (
      email.length > 254 ||
      (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ) {
      setSaveError(
        email.length > 254
          ? "The email address cannot exceed 254 characters."
          : "Please enter a valid email address.",
      );

      setSaveStatus("");
      return;
    }

    setGuestbookEmail(email);

    save(
      saveGuestbookEmail,
      email,
      email
        ? "Guestbook recipient email saved."
        : "Guestbook recipient email cleared.",
    );
  }

  function handleFinalPhotographBlur() {
    const trimmedContent = {
      line1: finalPhotoContent.line1.trim(),
      line2: finalPhotoContent.line2.trim(),
      imageAssetId: finalPhotoContent.imageAssetId ?? null,
    };

    if (
      !trimmedContent.line1 ||
      !trimmedContent.line2 ||
      trimmedContent.line1.length > 300 ||
      trimmedContent.line2.length > 300
    ) {
      setSaveError(
        "Both final photograph lines must contain 1 to 300 characters.",
      );

      setSaveStatus("");
      return;
    }

    setFinalPhotoContent((current) => ({
      ...current,
      ...trimmedContent,
    }));

    save(
      saveFinalPhotograph,
      trimmedContent,
      "Final photograph settings saved.",
    );
  }

  async function handleFinalPhotographSelect(imageAssetId) {
    const updatedContent = {
      line1: finalPhotoContent.line1.trim(),
      line2: finalPhotoContent.line2.trim(),
      imageAssetId,
    };

    if (
      !updatedContent.line1 ||
      !updatedContent.line2 ||
      updatedContent.line1.length > 300 ||
      updatedContent.line2.length > 300
    ) {
      throw new Error(
        "Please complete both final photograph text fields before selecting a photo.",
      );
    }

    setSaveError("");
    setSaveStatus("Saving photograph selection...");

    try {
      await saveFinalPhotograph(websiteId, updatedContent);

      setFinalPhotoContent((current) => ({
        ...current,
        imageAssetId,
      }));

      setSaveStatus("Final photograph selection saved.");
    } catch (error) {
      console.error("Failed to save final photograph selection:", error);

      setSaveError(
        error instanceof Error
          ? error.message
          : "The photograph selection could not be saved.",
      );

      setSaveStatus("");
      throw error;
    }
  }

  return (
    <section className="section-controls">
      <div className="section-controls__header">
        <h3 className="section-controls__title">Your sections</h3>
        <p className="section-controls__description">
          Choose which sections appear and change their order.
        </p>
      </div>

      <div className="section-controls__list">
        {sections.map((section, index) => (
          <div className="section-controls__item" key={section.id}>
            <div className="section-controls__item-main">
              <label className="section-controls__visibility">
                <input
                  type="checkbox"
                  checked={section.visible}
                  disabled={isPending}
                  onChange={() => toggleVisibility(section.id)}
                />
                <span>{section.label}</span>
              </label>

              <span className="section-controls__position">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <div className="section-controls__actions">
              <button
                type="button"
                onClick={() => moveSection(index, -1)}
                disabled={isPending || index === 0}
                aria-label={`Move ${section.label} up`}
              >
                ↑
              </button>

              <button
                type="button"
                onClick={() => moveSection(index, 1)}
                disabled={isPending || index === sections.length - 1}
                aria-label={`Move ${section.label} down`}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>

      <EditorField
        title="Introduction"
        description="Your changes save when you leave the field."
        label="Introduction message"
        id="introduction-message"
        value={introMessage}
        onChange={(value) => {
          setIntroMessage(value);
          setSaveError("");
          setSaveStatus("Unsaved changes.");
        }}
        onBlur={handleIntroductionBlur}
        multiline
        rows={6}
        maxLength={2000}
        placeholder="Write your introduction..."
        disabled={isPending}
      />

      <div className="section-controls__content-editor">
        <h3 className="section-controls__title">Birthday letter</h3>

        <p className="section-controls__description">
          Personalise the letter inside the envelope. Changes save when you
          leave a field.
        </p>

        {envelopeFields.map((field) => (
          <EditorField
            key={field.name}
            id={`letter-${field.name}`}
            label={field.label}
            value={letter[field.name]}
            maxLength={300}
            disabled={isPending}
            onChange={(value) => {
              setLetter((current) => ({
                ...current,
                [field.name]: value,
              }));

              setSaveError("");
              setSaveStatus("Unsaved changes.");
            }}
            onBlur={handleLetterBlur}
          />
        ))}

        {letter.paragraphs.map((paragraph, index) => (
          <EditorField
            key={index}
            id={`letter-paragraph-${index + 1}`}
            label={`Paragraph ${index + 1}`}
            value={paragraph}
            maxLength={2000}
            rows={5}
            multiline
            disabled={isPending}
            placeholder={`Write paragraph ${index + 1}...`}
            onChange={(value) => {
              setLetter((current) => ({
                ...current,
                paragraphs: current.paragraphs.map((item, i) =>
                  i === index ? value : item,
                ),
              }));

              setSaveError("");
              setSaveStatus("Unsaved changes.");
            }}
            onBlur={handleLetterBlur}
          />
        ))}
      </div>

      <div className="section-controls__content-editor">
        <h3 className="section-controls__title">Final photograph</h3>

        <p className="section-controls__description">
          Personalise the closing message shown when the photograph is
          revealed. Changes save when you leave a field.
        </p>

        <EditorField
          id="final-photograph-line1"
          label="First line"
          value={finalPhotoContent.line1 ?? ""}
          maxLength={300}
          disabled={isPending}
          placeholder="Happy Birthday, {name}!"
          onChange={(value) => {
            setFinalPhotoContent((current) => ({
              ...current,
              line1: value,
            }));

            setSaveError("");
            setSaveStatus("Unsaved changes.");
          }}
          onBlur={handleFinalPhotographBlur}
        />

        <EditorField
          id="final-photograph-line2"
          label="Second line"
          value={finalPhotoContent.line2 ?? ""}
          maxLength={300}
          disabled={isPending}
          placeholder="We love you more than words can say."
          onChange={(value) => {
            setFinalPhotoContent((current) => ({
              ...current,
              line2: value,
            }));

            setSaveError("");
            setSaveStatus("Unsaved changes.");
          }}
          onBlur={handleFinalPhotographBlur}
        />

        <PhotoManager
          websiteId={websiteId}
          sectionId="final-photograph"
          selectedAssetId={finalPhotoContent.imageAssetId ?? null}
          onSelectAsset={handleFinalPhotographSelect}
          allowMultiple={false}
        />
      </div>

      <EditorField
        title="Guestbook"
        description="Choose where visitors' extra birthday wishes should be sent when the guestbook is full. Leave this blank to use your account email."
        label="Guestbook recipient email"
        id="guestbook-email"
        value={guestbookEmail}
        onChange={(value) => {
          setGuestbookEmail(value);
          setSaveError("");
          setSaveStatus("Unsaved changes.");
        }}
        onBlur={handleGuestbookEmailBlur}
        type="email"
        maxLength={254}
        placeholder="recipient@example.com"
        disabled={isPending}
      />

      <PhotoManager websiteId={websiteId} />

      <p className="section-controls__notice" aria-live="polite">
        {saveError || saveStatus || "Your changes are saved automatically."}
      </p>
    </section>
  );
}

function EditorField({
  title,
  description,
  label,
  id,
  value,
  onChange,
  onBlur,
  multiline = false,
  rows = 3,
  maxLength,
  placeholder,
  type = "text",
  disabled = false,
}) {
  return (
    <div className="section-controls__content-editor">
      {title && <h3 className="section-controls__title">{title}</h3>}

      {description && (
        <p className="section-controls__description">{description}</p>
      )}

      <label className="section-controls__field-label" htmlFor={id}>
        {label}
      </label>

      {multiline ? (
        <textarea
          id={id}
          className="section-controls__textarea"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          maxLength={maxLength}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
        />
      ) : (
        <input
          id={id}
          className="section-controls__textarea"
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          maxLength={maxLength}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}

      {maxLength && (
        <p className="section-controls__character-count">
          {value.length}/{maxLength} characters
        </p>
      )}
    </div>
  );
}
