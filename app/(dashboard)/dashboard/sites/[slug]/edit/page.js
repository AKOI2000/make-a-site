import { notFound, redirect } from "next/navigation";
import { getSession } from "@/app/lib/auth-sessions";
import { getUserWebsiteBySlug } from "@/lib/data/websites";
import { getTemplateById } from "@/lib/templates/registry";
import EditorHeader from "./sections/EditorHeader/EditorHeader";
import EditorWorkspace from "./sections/EditorWorkspace/EditorWorkspace";
import "./edit.scss";

export default async function EditWebsitePage({ params }) {
  const session = await getSession();
  const id = session?.user?.id;
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const { slug } = await params;

  const website = await getUserWebsiteBySlug(id, slug);

  if (!website) {
    notFound();
  }

  const template = getTemplateById(website.templateId);

  if (!template) {
    notFound();
  }

  return (
    <div className="website-editor">
      <EditorHeader website={website} />

      <EditorWorkspace website={website} />
    </div>
  );
}