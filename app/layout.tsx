import type { Metadata } from "next";
import "@/styles/globals.css";
import { fonts } from "@/config/fonts";

export const metadata: Metadata = {
  title: "Agrumea Farm Recreation",
  description: "Agrumea Farm recreated by Samuel Kime",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fonts} antialiased`}>
      <body className="">{children}</body>
    </html>
  );
}
