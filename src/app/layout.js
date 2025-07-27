// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Toast from "../components/Toast";
import Navbar from "../components/Navbar";
import { UserProvider } from "@/context/UserContext";
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "RealTalk Chat",
  description: "Chat in real-time or talk to Gemini AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-indigo-100 to-fuchsia-100`}
      >
        <UserProvider>
          <Navbar />
          {children}
          <Toast />
        </UserProvider>
      </body>
    </html>
  );
}