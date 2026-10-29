import localfont from "next/font/local";

export const britney = localfont({
  src: "../fonts/Britney-Variable.woff2",
  display: "swap",
  weight: "100 900", // the weight range your variable font supports
  variable: "--font-display",
});

export const author = localfont({
  src: "../fonts/Author-Variable.woff2",
  display: "swap",
  weight: "100 900", // the weight range your variable font supports
  variable: "--font-body",
});
