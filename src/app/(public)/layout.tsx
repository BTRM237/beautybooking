import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import FloatingContactWidget from "@/components/contact-widget/FloatingContactWidget";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">{children}</main>
      <Footer />
      <FloatingContactWidget />
    </>
  );
}
