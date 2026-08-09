"use client";

import { useState } from "react";
import PartDesktop from "./PartDesktop";
import PartRemote from "./PartRemote";
import SetupIndex from "./SetupIndex";
import { DESKTOP_INDEX_ITEMS, TOPOLOGIES, remoteIndexItems, type TopologyKey } from "./data";

export default function SetupGuide() {
  const [topology, setTopology] = useState<TopologyKey>("slurm");
  const selected = TOPOLOGIES.find((t) => t.key === topology)!;

  // Topologies differ in length, so a switch from deep inside Part II would otherwise
  // leave the reader wherever the browser clamps the scroll. Re-anchor on the chooser.
  // Done here rather than in an effect: an effect also fires on mount (twice, under
  // StrictMode), which would hijack an incoming #hash jump.
  const chooseTopology = (key: TopologyKey) => {
    if (key === topology) return;
    setTopology(key);
    requestAnimationFrame(() => document.getElementById("part-remote")?.scrollIntoView());
  };

  return (
    <div className="setup-layout">
      <SetupIndex
        groups={[
          { title: "Part I — Desktop", sectionId: "part-desktop", items: DESKTOP_INDEX_ITEMS },
          {
            title: `Part II — ${selected.label}`,
            sectionId: "part-remote",
            items: remoteIndexItems(topology)
          }
        ]}
      />

      <div className="setup-content">
        <PartDesktop />
        <PartRemote topology={topology} onChange={chooseTopology} />

        <div className="setup-end">
          <p>
            These steps track the guides in the{" "}
            <a
              className="setup-inline-link"
              href="https://github.com/CrossOmics/Gardener-Agent"
              target="_blank"
              rel="noopener noreferrer"
            >
              Gardener repository
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
