"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { frame, cancelFrame } from "framer-motion";

const LenisContext = createContext(null);

/**
 * Grab the live Lenis instance from anywhere in the tree, e.g:
 *   const lenis = useLenis();
 *   lenis?.scrollTo("#memory-wall");
 */
export function useLenis() {
  return useContext(LenisContext);
}

export default function LenisProvider({ children }) {
  const lenisRef = useRef(null);
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenisRef.current = instance;
    setLenis(instance);

    // Drive Lenis off Framer Motion's own frame loop instead of a second
    // requestAnimationFrame loop — this is what keeps the pinned memory-wall
    // scroll-jack section (which reads scrollYProgress every frame) in sync
    // with the smoothed scroll position instead of fighting it.
    function update(data) {
      instance.raf(data.timestamp);
    }
    frame.update(update, true);

    return () => {
      cancelFrame(update);
      instance.destroy();
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
