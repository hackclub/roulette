import { Righteous } from "next/font/google";
import "./globals.css";

const righteous = Righteous({
  variable: "--font-righteous",
  subsets: ["latin"],
  weight: "400"
});


export const metadata = {
  title: "Gamedev Roulette",
  description: "Spin wheels. Make games. Get prizes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <title>Gamedev Roulette</title>
      <meta name="description" content="Spin Wheels. Make games. Get prizes." />

      <meta property="og:url" content="https://roulette.hackclub.com" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="/opengraph-image.png" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:domain" content="roulette.hackclub.com" />
      <meta property="twitter:url" content="https://roulette.hackclub.com" />
      <meta name="twitter:title" content="Gamedev Roulette" />
      <meta name="twitter:description" contents="Spin Wheels. Make games. Get prizes." />
      <meta name="twitter:image" content="/opengraph-image.png" />

      <meta name="theme-color" content="#FF698A" />

      <link rel="canonical" href="https://roulette.hackclub.com" />
    </head>
      <body className={`${righteous.variable}`}>
        {children}
      </body>
    </html>
  );
}
