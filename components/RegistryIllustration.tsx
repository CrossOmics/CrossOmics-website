/** A conceptual illustration, not a chart of registered tools or performance. */
export default function RegistryIllustration() {
  return <svg className="community-diagram" viewBox="0 0 440 300" fill="none" aria-hidden="true">
    <defs>
      <filter id="registry-paper-shadow" x="0" y="0" width="300" height="300" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feDropShadow dx="0" dy="9" stdDeviation="13" floodColor="#31588c" floodOpacity=".08" />
      </filter>
    </defs>

    {/* Quiet contour lines frame a family of repositories. */}
    <path d="M66 48H355C378 48 396 66 396 89V211C396 234 378 252 355 252H66" stroke="#d6e2f2" strokeDasharray="3 7" strokeLinecap="round" />

    {/* Two independent paths grow from the original source. */}
    <path d="M216 150H232C252 150 248 93 273 93H337" stroke="#b9cce5" strokeWidth="2" strokeLinecap="round" />
    <path d="M216 150H232C252 150 248 207 273 207H337" stroke="#b9cce5" strokeWidth="2" strokeLinecap="round" />
    <path d="M216 150H232C252 150 248 93 273 93H300" stroke="#0b57d0" strokeWidth="2" strokeLinecap="round" />
    <path d="M216 150H232C252 150 248 207 273 207H300" stroke="#218969" strokeWidth="2" strokeLinecap="round" />
    <circle cx="277" cy="93" r="4" fill="#eff5fc" stroke="#0b57d0" strokeWidth="2" />
    <circle cx="277" cy="207" r="4" fill="#eff5fc" stroke="#218969" strokeWidth="2" />

    {/* A small repository window anchors the composition. */}
    <g filter="url(#registry-paper-shadow)">
      <rect x="34" y="75" width="184" height="150" rx="15" fill="white" stroke="#d2dff0" />
    </g>
    <path d="M34 116H218" stroke="#e5ecf6" />
    <g stroke="#6b84a5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="51" y="90" width="13" height="13" rx="2" />
      <path d="M55 90V103M59 94H61M59 98H61" />
    </g>
    <text x="75" y="100" fill="#193657" fontFamily="inherit" fontSize="12" fontWeight="600">Original repository</text>
    <circle cx="200" cy="96" r="2" fill="#b9cce5" />
    <g strokeWidth="5" strokeLinecap="round">
      <path d="M54 138H74" stroke="#0b57d0" />
      <path d="M84 138H116" stroke="#b8cbe2" />
      <path d="M65 152H101" stroke="#b8cbe2" />
      <path d="M111 152H161" stroke="#dce7f4" />
      <path d="M65 166H89" stroke="#218969" />
      <path d="M99 166H139" stroke="#dce7f4" />
      <path d="M54 180H74" stroke="#0b57d0" />
      <path d="M84 180H111" stroke="#b8cbe2" />
    </g>
    <path d="M51 204H199" stroke="#edf2f8" />
    <circle cx="56" cy="212" r="2.5" fill="#218969" />
    <path d="M66 212H103" stroke="#c4d3e7" strokeWidth="3" strokeLinecap="round" />
    <circle cx="218" cy="150" r="5" fill="#0b57d0" stroke="white" strokeWidth="3" />

    {/* Implementation nodes use code and branch symbols, without status claims. */}
    <circle cx="337" cy="93" r="28" fill="#e7effc" />
    <circle cx="337" cy="93" r="20" fill="white" stroke="#b8ceef" />
    <path d="M331 87L325 93L331 99M343 87L349 93L343 99M339 85L335 101" stroke="#0b57d0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <text x="337" y="142" textAnchor="middle" fill="#365576" fontFamily="inherit" fontSize="11" fontWeight="500">New implementation</text>

    <circle cx="337" cy="207" r="28" fill="#e0f0eb" />
    <circle cx="337" cy="207" r="20" fill="white" stroke="#a9d2c4" />
    <g stroke="#218969" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M332 201V214M342 201V204C342 210 332 206 332 212" />
      <circle cx="332" cy="198" r="3" fill="white" />
      <circle cx="342" cy="198" r="3" fill="white" />
      <circle cx="332" cy="217" r="3" fill="white" />
    </g>
    <text x="337" y="256" textAnchor="middle" fill="#365576" fontFamily="inherit" fontSize="11" fontWeight="500">Upstream improvement</text>

    {/* Shared work is expressed by a small group, rather than another flow box. */}
    <g transform="translate(66 247)">
      <circle cx="0" cy="0" r="13" fill="#e1ebfa" stroke="#eff5fc" strokeWidth="3" />
      <circle cx="20" cy="0" r="13" fill="#d9ede6" stroke="#eff5fc" strokeWidth="3" />
      <circle cx="40" cy="0" r="13" fill="#d9e6f8" stroke="#eff5fc" strokeWidth="3" />
      <g stroke="#7089aa" strokeWidth="1.3" strokeLinecap="round">
        <circle cx="0" cy="-3" r="2.5" /><path d="M-4 5C-4 0 4 0 4 5" />
        <circle cx="40" cy="-3" r="2.5" /><path d="M36 5C36 0 44 0 44 5" />
      </g>
      <g stroke="#48856f" strokeWidth="1.3" strokeLinecap="round"><circle cx="20" cy="-3" r="2.5" /><path d="M16 5C16 0 24 0 24 5" /></g>
      <text x="62" y="4" fill="#6b84a5" fontFamily="inherit" fontSize="10">Built together</text>
    </g>
  </svg>;
}
