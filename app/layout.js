
import { Suspense } from "react";
import LenisProvider from "@/app/_context/LenisProvider";
import "@/styles/globals.scss";
import { author, britney } from "@/app/fonts";

export const metadata = {
  title: "A Little Gift for You || base",
  description: "A personal gift website made with love.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={author.variable}>
      <body>
        <Suspense fallback={children}>
          <LenisProvider>{children}</LenisProvider>
        </Suspense>
      </body>
    </html>
  );
}
