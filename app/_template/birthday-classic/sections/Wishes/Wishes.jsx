
"use client";

import { useScroll } from "framer-motion";
import { useRef } from "react";
import WishCard from "@/app/components/WishCard/WishCard";
import "./wishes.scss";

export default function Wishes({ content }) {
  const ref = useRef(null);
  const guestbook = content?.guestbook;
  const wishes = guestbook?.wishes ?? [];

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  if (wishes.length === 0) {
    return null;
  }

  return (
    <div ref={ref} className="wishes">
      {wishes.map((wish, index) => {
        const targetScale = 1 - (wishes.length - index) * 0.09;

        return (
          <WishCard
            key={wish.id}
            index={index}
            card={{
              id: wish.id,
              name: wish.guestName,
              message: wish.message,
              relation: null,
              url: wish.photoUrl || null,
            }}
            range={[(index * (100 / wishes.length)) / 100, 1]}
            targetScale={targetScale}
            progress={scrollYProgress}
          />
        );
      })}
    </div>
  );
}
