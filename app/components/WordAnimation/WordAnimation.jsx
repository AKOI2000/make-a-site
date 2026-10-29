"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import "./word-animation.scss";

function WordAnimation({ value, centre }) {
  const words = value.split(" ");
  const ref = useRef();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.5", "start 0.1"],
  });
  return (
    <p ref={ref} className={`word-animation ${centre ? "centre" : null}`}>
      {words?.map((word, index) => {
        const start = index / words.length;
        const end = start + 1 / words.length;

        return (
          <Word
            word={word}
            key={index}
            progress={scrollYProgress}
            range={[start, end]}
          />
        );
      })}
    </p>
  );
}

function Word({ word, range, progress }) {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="word">
      <span className="shadow">{word}</span>
      <motion.span style={{ opacity }}>{word}</motion.span>
    </span>
  );
}

export default WordAnimation;
