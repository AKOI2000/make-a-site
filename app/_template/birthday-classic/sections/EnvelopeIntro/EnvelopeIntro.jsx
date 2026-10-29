
"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { envelope } from "@/app/lib/content";

import "./envelope-intro.scss";

export default function EnvelopeIntro({ content }) {
  const sectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const letter = {
    ...envelope,
    ...content,
    paragraphs: Array.isArray(content?.paragraphs)
      ? content.paragraphs
      : envelope.paragraphs,
  };

  // console.log(letter);
  

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth <= 600);
    }

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 42,
    mass: 0.5,
  });

  const flapRotate = useTransform(smooth, [0, 0.22], [0, 175]);
  const flapOpacity = useTransform(smooth, [0.24, 0.32], [1, 0]);

  const paperY = useTransform(
    smooth,
    [0, 0.2, 0.4, 1],
    ["0%", "2%", "0%", "0%"],
  );

  const envelopeOpacity = useTransform(smooth, [0.28, 0.38], [1, 0]);
  const paperBorderRadius = useTransform(smooth, [0.7, 0.94], [3, 0]);
  const initialTextOpacity = useTransform(smooth, [0, 0.06], [1, 0]);
  const scrollHintOpacity = useTransform(smooth, [0, 0.05], [1, 0]);
  const paperContentOpacity = useTransform(smooth, [0.7, 0.75], [0, 1]);
  const paperContentY = useTransform(smooth, [0.5, 0.7], [15, 0]);

  return (
    <section
      ref={sectionRef}
      className="envelope-wrapper"
      aria-label="Opening"
    >
      <div className="envelope-sticky">
        <motion.div className="envelope-scene">
          <motion.p
            className="envelope-label"
            style={{ opacity: initialTextOpacity }}
          >
            {letter.recipient}
          </motion.p>

          <motion.div
            className="scene"
            style={{
              y: paperY,
              borderRadius: paperBorderRadius,
            }}
          >
            <motion.div
              className="paperContent"
              style={{ opacity: paperContentOpacity, y: paperContentY }}
            >
              <span className="paperEyebrow">{letter.heading}</span>
              <p className="paperWord">{letter.greeting}</p>

              {letter.paragraphs.map((paragraph, index) => (
                <p className="paperWord" key={index}>
                  {paragraph}
                </p>
              ))}

              <p className="paperWord">
                {letter.closing}
                <br />
                {letter.signature}
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            className="envelopeStage"
            style={{ opacity: envelopeOpacity }}
          >
            <div className="envelopePocket" />
            <div className="envelopeOutline" />

            <motion.div
              className="flap"
              style={{ rotateX: flapRotate, opacity: flapOpacity }}
            />
          </motion.div>

          <motion.div className="hint" style={{ opacity: scrollHintOpacity }}>
            <span className="hintLine" />
            <span className="hintText">{letter.hint}</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
