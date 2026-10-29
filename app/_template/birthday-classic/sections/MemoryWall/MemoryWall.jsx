
"use client";

import { motion, useTransform, useScroll } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { memories as defaultMemories } from "@/app/lib/content";
import "./memovies.scss";

export default function MemoryWall({ content, isPreview = false }) {
  const memories = Array.isArray(content?.memories)
    ? content.memories
    : defaultMemories;

  return (
    <div className="memories-section">
      <HorizontalScrollCarousel
        memories={memories}
        isPreview={isPreview}
      />
    </div>
  );
}

function HorizontalScrollCarousel({ memories, isPreview }) {
  const targetRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0.01, 1], ["1%", "-101%"]);
  const containerHeight = `${memories.length * 100}vh`;

  return (
    <section
      ref={targetRef}
      className="memories-container"
      style={{ height: containerHeight }}
    >
      <div className="memories-wrapper">
        <motion.div
          style={{ x }}
          className="memories-wrapper-wheel"
        >
          {memories.map((card, index) => (
            <Card
              card={card}
              key={card.id ?? index}
              isPreview={isPreview}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Card({ card, isPreview }) {
  return (
    <div className="memory-card">
      <div className="memory-card-image">
        <Image
          src={card.imagelink}
          alt={card.imageAlt || card.caption || "A birthday memory"}
          unoptimized={isPreview}
          height={900}
          width={1600}
        />
      </div>

      {card.caption && (
        <p className="memory-card-caption">{card.caption}</p>
      )}
    </div>
  );
}
