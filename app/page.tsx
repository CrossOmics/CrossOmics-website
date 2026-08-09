import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Hero from "@/components/Hero";
import SectionCards from "@/components/SectionCards";
import Highlights from "@/components/Highlights";

export default function Page() {
  return (
    <div className="page">
      <SiteHeader />
      <main className="page-main-home">
        <Hero />
        <SectionCards />
        <Highlights />
      </main>
      <SiteFooter />
    </div>
  );
}
