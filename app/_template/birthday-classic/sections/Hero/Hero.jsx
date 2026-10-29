"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef } from "react";
import "./hero.scss"

function Hero() {
  const containerRef = useRef();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end 15%"],
  });

  const containerHeight = useTransform(
    scrollYProgress,
    [0.35, 0.9],
    ["100dvh", "0dvh"],
  );

  // const textOpacity = useTransform(scrollYProgress, [0.3, 0.65], [1, 0]);

  // useEffect(() => {
  //   return containerHeight.on("change", (v) => {
  //     console.log(v);
  //   });

  //   // console.log(scrollYProgress);
  // }, [containerHeight]);
  return (
    <section className="hero" ref={containerRef}>
      <motion.div className="hero-inner" style={{ height: containerHeight }}>
        <Image
          src={"/hero-bg.jpeg"}
          alt="Happy birthday"
          width={2600}
          height={1900}
          quality={100}
          loading="eager"
        />
        {/* <div className="hero-overlay"></div> */}
        {/* <p>to my love,</p> */}
        {/* <div className="hero-text">
          <motion.h1 style={{ opacity: textOpacity }}>
            You make <br /> ordinary moments unforgettable
          </motion.h1>
        </div> */}
      </motion.div>
    </section>
  );
}

export default Hero;
