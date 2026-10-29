"use client";

import Image from "next/image";
import "./TemplateSelection.scss";

import { templates } from "@/lib/templates/registry";

export default function TemplateSelection({ selectedTemplate, onSelect }) {
  return (
    <section className="template-selection">
      <div className="template-selection__heading">
        <h2>Choose a template</h2>
        <p>Select the design you want to use for your gift website.</p>
      </div>

      <div className="template-selection__grid">
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id;

          return (
            <button
              className={`template-card ${
                isSelected ? "template-card--selected" : ""
              }`}
              type="button"
              key={template.id}
              onClick={() => onSelect(template.id)}
              aria-pressed={isSelected}
            >
              <div className="template-card__preview">
                <Image
                  src={template.previewImage}
                  alt={`${template.name} template preview`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="template-card__preview-image"
                />

                <span className="template-card__preview-label">Preview</span>
              </div>

              <div className="template-card__details">
                <div className="template-card__info">
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>
                </div>

                <span className="template-card__radio" aria-hidden="true">
                  {isSelected && <span className="template-card__radio-dot" />}
                </span>
              </div>

              <span className="template-card__status">
                {isSelected ? "Selected" : "Select template"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
