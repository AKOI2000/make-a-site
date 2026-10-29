import "./loading.scss";

export default function Loading() {
  return (
    <main className="website-loading">
      <div className="website-loading__content">
        <div className="website-loading__spinner" aria-hidden="true" />

        <p>Loading website....</p>
      </div>
    </main>
  );
}
