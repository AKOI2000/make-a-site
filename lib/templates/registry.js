import birthdayClassic from "@/app/_template/birthday-classic/config";

export const templates = [birthdayClassic];

export function getTemplateById(templateId) {
  return templates.find((template) => template.id === templateId) ?? null;
}