import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Đặt lịch makeup chuyên nghiệp tại Quảng Ngãi | Luna Makeup Studio",
  description:
    "Dịch vụ makeup cô dâu, dự tiệc, kỷ yếu, chụp ảnh và sự kiện. Đặt lịch nhanh, tư vấn miễn phí, hỗ trợ tại studio và tại nhà.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "Luna Makeup Studio - Đặt lịch makeup chuyên nghiệp",
    description:
      "Dịch vụ makeup cô dâu, dự tiệc, kỷ yếu, chụp ảnh và sự kiện tại Quảng Ngãi.",
    type: "website",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luna Makeup Studio",
    description: "Dịch vụ makeup chuyên nghiệp tại Quảng Ngãi",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
