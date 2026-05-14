import PageShell from "@/components/PageShell";

const SEGMENTS = [
  { num: "01", title: "Wedding Production", sub: "Bespoke ceremonies", desc: "End-to-end planning, venue, design, and day-of operation for couples seeking a wedding that reflects who they actually are.", image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80" },
  { num: "02", title: "Hotel Operations", sub: "Boutique stays", desc: "A small portfolio of design-led hotels operated under our own management, each tied to a place rather than a template.", image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80" },
  { num: "03", title: "Restaurant & Catering", sub: "Seasonal kitchens", desc: "Restaurants, private dining, and catering operations built around seasonality and a tight relationship with regional growers.", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80" },
  { num: "04", title: "Venue Development", sub: "Architecture & design", desc: "We design, build, and renovate the spaces in which our work happens — chapels, ballrooms, banquet halls, and gardens.", image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1200&q=80" },
  { num: "05", title: "Consulting", sub: "For hospitality groups", desc: "Advisory work for hotel groups, wedding operators, and resorts looking to modernize service design and brand positioning.", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80" },
  { num: "06", title: "Casual Wedding", sub: "Approachable formats", desc: "A more flexible, accessible wedding line for couples who want the craft of a traditional ceremony without the format.", image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80" },
  { num: "07", title: "Apparel & Bridal", sub: "In-house atelier", desc: "An in-house bridal atelier producing dresses and accessories for our ceremonies and select wholesale partners.", image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=80" },
  { num: "08", title: "Memorial Services", sub: "End-of-life ceremonies", desc: "Memorial and farewell ceremonies designed with the same care as any other gathering we host.", image: "https://images.unsplash.com/photo-1454944338482-a69bb95894af?auto=format&fit=crop&w=1200&q=80" },
  { num: "09", title: "Digital Platform", sub: "Tools for couples", desc: "A digital platform that helps couples plan, decide, and stay sane during the months leading up to their day.", image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=80" }
];

export default function BusinessPage() {
  return (
    <PageShell title="BUSINESS" subtitle="Our business lines" breadcrumb="Business">
      {SEGMENTS.map((s) => (
        <article key={s.num} className="biz-segment">
          <div className="biz-image" style={{ backgroundImage: `url(${s.image})` }} />
          <div>
            <div className="biz-num">— {s.num}</div>
            <h2 className="biz-title">{s.title}</h2>
            <div className="biz-sub">{s.sub}</div>
            <p className="biz-desc">{s.desc}</p>
          </div>
        </article>
      ))}
    </PageShell>
  );
}
