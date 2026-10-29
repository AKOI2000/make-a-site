import { author, britney } from "@/app/fonts";

export const metadata = {
  title: "A Little Gift for You || dashboard",
  description: "A personal gift website made with love.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${author.variable} ${britney.variable}`}>
      <main>{children}</main>
    </html>
  );
}
