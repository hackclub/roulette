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
  openGraph: {
    title: "Gamedev Roulette",
    description: "Spin wheels. Make games. Get prizes.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <body className={`${righteous.variable}`}>
        {children}
      </body>
    </html>
  );
}
