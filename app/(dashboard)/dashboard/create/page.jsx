import CreateWebsiteForm from "./sections/createWebsiteForm/CreateWorkForm";
import "./createpage.scss"

export default function CreateWebsitePage() {
  return (
    <div className="create-page">
      <header className="create-page__header">
        <p className="create-page__eyebrow">MAKE IT PERSONAL</p>

        <h1 className="create-page__title">Create a gift website</h1>

        <p className="create-page__description">
          Create something special for someone you love.
        </p>
      </header>

      <CreateWebsiteForm />
    </div>
  );
}
