import { signIn } from "@/auth";
import "./signin.scss";

export default function SignInPage() {
  return (
    <main className="signin">
      <section className="signin__content">
        <a href="/" className="signin__brand">
          Make-A-Site
        </a>

        <div className="signin__body">
          <span className="signin__eyebrow">A little something special</span>

          <h1>Make something they’ll never forget.</h1>

          <p className="signin__description">
            Create a personalised website for someone special and turn your
            favourite memories into a gift they can revisit anytime.
          </p>

          <form
            className="signin__form"
            action={async () => {
              "use server";

              await signIn("google", {
                redirectTo: "/dashboard",
              });
            }}
          >
            <button className="signin__button" type="submit">
              <svg
                className="signin__google-icon"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.99 46.98 31.88 46.98 24.55Z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.93 23.93 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 43.62 14.62 48 24 48Z"
                />
              </svg>

              Continue with Google
            </button>
          </form>

          <p className="signin__note">
            Simple to create. Meaningful to receive.
          </p>
        </div>

        <footer className="signin__footer">
          Made for the people who matter.
        </footer>
      </section>

      <aside className="signin__visual" aria-label="A gift made with love">
        <div className="signin__visual-overlay" />

        <div className="signin__visual-content">
          <span className="signin__visual-label">More than a website</span>
          <p>
            Some feelings deserve
            <br />
            more than a message.
          </p>
          <span className="signin__visual-caption">
            Give them a place to remember.
          </span>
        </div>
      </aside>
    </main>
  );
}