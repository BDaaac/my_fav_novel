"use client";

import React from "react";
import type { VolumeSymbolId } from "@/data/lotm/types";

export function VolumeSymbol({ symbol, className }: { symbol: VolumeSymbolId; className?: string }) {
  switch (symbol) {
    case "hat":
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <circle cx="18" cy="18" r="15.5" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
          <path d="M9.5 23.5h17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M12.5 23.5 13.8 11.5h8.4l1.3 12" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M13.2 19.5h9.6" stroke="#d9534f" strokeWidth="1.3" />
        </svg>
      );
    case "mask":
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <circle cx="18" cy="18" r="15.5" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
          <path
            d="M9.5 16c2.5-2.5 5.5-2.5 8.5-.6 3-1.9 6-1.9 8.5.6-.4 4.8-3.4 7.5-8.5 5.8-5.1 1.7-8.1-1-8.5-5.8Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <ellipse cx="14.2" cy="17.4" rx="1.9" ry="1.1" fill="currentColor" />
          <ellipse cx="21.8" cy="17.4" rx="1.9" ry="1.1" fill="currentColor" />
        </svg>
      );
    case "ship":
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <circle cx="18" cy="18" r="15.5" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
          <path d="M18 9v13M18 10.5l6.5 9.5H18M18 12l-5.5 8H18" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
          <path d="M10.5 22.5h15l-2.3 3.2h-10.4l-2.3-3.2Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        </svg>
      );
    case "infinity":
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <circle cx="18" cy="18" r="15.5" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
          <path
            d="M12.6 14.5c2.2 0 4 2 5.4 3.5 1.4 1.5 3.2 3.5 5.4 3.5a3.5 3.5 0 1 0 0-7c-2.2 0-4 2-5.4 3.5-1.4 1.5-3.2 3.5-5.4 3.5a3.5 3.5 0 1 1 0-7Z"
            stroke="currentColor"
            strokeWidth="1.35"
          />
        </svg>
      );
    case "flame":
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <circle cx="18" cy="18" r="15.5" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
          <path
            d="M18.4 9.5c2.5 3.6 5.6 6.2 5.6 10.2a6 6 0 1 1-12 0c0-2.6 1.5-4.8 2.9-6.6.4 1.6 1.2 2.4 2 2.6-.2-2.4.5-4.4 1.5-6.2Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "sun":
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <circle cx="18" cy="18" r="15.5" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
          <circle cx="18" cy="18" r="4.2" stroke="currentColor" strokeWidth="1.3" />
          <path
            d="M18 9.2v2.6M18 24.2v2.6M9.2 18h2.6M24.2 18h2.6M11.8 11.8l1.9 1.9M22.3 22.3l1.9 1.9M24.2 11.8l-1.9 1.9M13.7 22.3l-1.9 1.9"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      );
    case "gallows":
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <circle cx="18" cy="18" r="15.5" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
          <path d="M11 11.5h14M18 11.5v13.5M14 20.5l4-3.5 4 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="18" cy="25.5" r="1.4" fill="currentColor" />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <circle cx="18" cy="18" r="15.5" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
          <path
            d="M18 8.5 20.4 15.6 27.5 18 20.4 20.4 18 27.5 15.6 20.4 8.5 18 15.6 15.6 18 8.5Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="18" r="1.5" fill="#d9534f" />
        </svg>
      );
  }
}
