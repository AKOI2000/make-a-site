"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
} from "framer-motion";
import { finalPhotograph as defaultFinalPhotograph } from "@/app/lib/content";
import "./final-photography.scss";

const HOLD_DURATION = 1500;

function getObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

export default function FinalPhotograph({
  content,
  isPreview = false,
}) {
  const photoContent = {
    ...defaultFinalPhotograph,
    ...getObject(content),
  };

  const progress = useMotionValue(0);
  const smoothProgress = useSpring(progress, {
    stiffness: 90,
    damping: 22,
  });

  const blur = useTransform(smoothProgress, [0, 1], [18, 0]);
  const scale = useTransform(smoothProgress, [0, 1], [1.06, 1]);
  const brightness = useTransform(smoothProgress, [0, 1], [0.5, 1]);

  const filter = useTransform(
    [blur, brightness],
    ([b, br]) => `blur(${b}px) brightness(${br})`,
  );

  const textOpacity = useTransform(smoothProgress, [0.75, 1], [0, 1]);
  const textY = useTransform(smoothProgress, [0.75, 1], [14, 0]);
  const hintOpacity = useTransform(smoothProgress, [0, 0.15, 0.9], [1, 0.4, 0]);

  const [isHolding, setIsHolding] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const animRef = useRef(null);

  const startHold = useCallback(() => {
    if (isRevealed) return;

    setIsHolding(true);

    const remaining = 1 - progress.get();
    const duration = (HOLD_DURATION * remaining) / 1000;

    animRef.current = animate(progress, 1, {
      duration,
      ease: "linear",
      onComplete: () => setIsRevealed(true),
    });
  }, [isRevealed, progress]);

  const endHold = useCallback(() => {
    if (isRevealed) return;

    setIsHolding(false);

    if (animRef.current) {
      animRef.current.stop();
    }

    animRef.current = animate(progress, 0, {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    });
  }, [isRevealed, progress]);

  useEffect(() => {
    return () => {
      if (animRef.current) {
        animRef.current.stop();
      }
    };
  }, []);

  return (
    <section className="section" aria-label="Final photograph">
      <div className="stage">
        <motion.div
          className="frame"
          style={{ scale }}
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
          role="button"
          tabIndex={0}
          aria-label="Press and hold to reveal the photograph"
          aria-pressed={isRevealed}
          onKeyDown={(event) => {
            if ((event.key === "Enter" || event.key === " ") && !event.repeat) {
              event.preventDefault();
              startHold();
            }
          }}
          onKeyUp={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              endHold();
            }
          }}
        >
          <div className="border">
            <motion.div className="imageWrap" style={{ filter }}>
              <Image
                src={photoContent.image}
                alt={photoContent.altText || "A personal photograph"}
                width={400}
                height={500}
                sizes="(max-width: 600px) 80vw, 420px"
                className="image"
                priority={false}
                unoptimized={isPreview}
              />
            </motion.div>
          </div>

          <motion.div className="hint" style={{ opacity: hintOpacity }}>
            <span className="hintDot" data-holding={isHolding} />
            <span className="hintText">{photoContent.hint}</span>
          </motion.div>
        </motion.div>

        <motion.div className="copy" style={{ opacity: textOpacity, y: textY }}>
          <p className="line1">{photoContent.line1}</p>
          <p className="line2">{photoContent.line2}</p>
        </motion.div>
      </div>
    </section>
  );
}
