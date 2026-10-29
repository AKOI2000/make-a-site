import { signIn, signOut } from "@/auth";

export default function SignInPage() {
  return (
    <main>
      <h1>Sign in to create your gift website</h1>
      <p>Create a personalised website for someone special.</p>

      <form
        action={async () => {
          "use server";
          await signIn("google", {
            redirectTo: "/dashboard",
          });
        }}
      >
        <button type="submit">Continue with Google</button>
      </form>
    </main>
  );
}
