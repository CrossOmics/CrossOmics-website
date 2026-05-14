import PageShell from "@/components/PageShell";

const PILLARS = [
  {
    num: "01",
    title: "Privacy",
    sub: "Your data stays yours",
    desc: "Raw expression matrices never leave your machine. Cloud LLMs only ever receive sanitized structural metadata — names of columns, shapes of matrices, summary statistics — never the values themselves. Privacy is the default, not a setting.",
    image:
      "https://images.unsplash.com/photo-1454425064867-83bc48b40c4d?auto=format&fit=crop&w=1200&q=80"
  },
  {
    num: "02",
    title: "Reproducibility",
    sub: "Every step is recorded",
    desc: "Each analysis step is captured as a versioned snapshot of the underlying state. Months later, replay the lineage to reproduce a figure exactly, branch from any intermediate point, or compare two runs side by side. No more orphaned notebooks.",
    image:
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80"
  },
  {
    num: "03",
    title: "Scalability",
    sub: "Local laptop to institutional HPC",
    desc: "Iterate on a laptop, then push the same workflow to your institution's HPC for jobs that don't fit in local memory. The interface and lineage stay identical — only the compute backend changes.",
    image:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80"
  }
];

export default function ValuePage() {
  return (
    <PageShell title="VALUE" subtitle="What we stand for" breadcrumb="Value">
      <section className="section">
        <div className="section-body">
          <p>
            Three principles shape every design decision in Gardener-Agent.
            They are the things we will not trade away for convenience.
          </p>
        </div>
      </section>

      {PILLARS.map((p) => (
        <article key={p.num} className="biz-segment">
          <div className="biz-image" style={{ backgroundImage: `url(${p.image})` }} />
          <div>
            <div className="biz-num">— {p.num}</div>
            <h2 className="biz-title">{p.title}</h2>
            <div className="biz-sub">{p.sub}</div>
            <p className="biz-desc">{p.desc}</p>
          </div>
        </article>
      ))}
    </PageShell>
  );
}
