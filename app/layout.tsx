import "./globals.css";
import type { ReactNode } from "react";
import Header from "../components/Header";

export const metadata = {
  title: "Prediction Marketplace",
  description: "Create & trade on prediction markets"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-slate-900">
        <Header />
        <main className="max-w-5xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
