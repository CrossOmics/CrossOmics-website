"use client";

import { useState } from "react";
import type { Video } from "./data";

/**
 * Facade player: renders a thumbnail until clicked, then swaps in the iframe.
 * Five live embeds would pull the YouTube player (and its cookies) on every page load.
 */
export default function VideoEmbed({ id, title, full, note }: Video & { note?: string }) {
  const [playing, setPlaying] = useState(false);
  const [thumb, setThumb] = useState(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`);

  return (
    <figure className="video-embed">
      <div className="video-frame">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={full}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="video-play"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${full}`}
          >
            <img
              src={thumb}
              alt=""
              loading="lazy"
              decoding="async"
              // maxresdefault only exists for HD uploads; hqdefault always does.
              onError={() => setThumb(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)}
            />
            <span className="video-play-btn" aria-hidden>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <figcaption>
        <span className="video-title">{title}</span>
        {note && <span className="video-note">{note}</span>}
        <a
          className="video-link"
          href={`https://youtu.be/${id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Watch on YouTube ↗
        </a>
      </figcaption>
    </figure>
  );
}
