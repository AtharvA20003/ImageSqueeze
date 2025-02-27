import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Compressor from "./pages/Compressor";
import CompressorClaude from "./pages/Trial2";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ImageSqueeze - Free Online Image Compressor",
  description: "Compress JPEG, PNG, and WebP images online for free! No signup, no watermark, just fast and easy image compression.",
  keywords: "image compressor, JPEG compressor, PNG optimizer, WebP compression, free image reducer",
  robots: "index, follow",
  openGraph: {
    title: "ImageSqueeze - Free Online Image Compressor",
    description: "Optimize your images quickly and efficiently with ImageSqueeze. No watermarks, no signup—just fast and secure image compression.",
    type: "website",
    // url: "https://yourwebsite.com", // Update with your actual domain
  },
  
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <Compressor /> */}
        <CompressorClaude />
        {/* {children} */}
      </body>
    </html>
  );
}
