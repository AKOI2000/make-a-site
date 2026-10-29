
"use client";

import { motion, useTransform } from "framer-motion";
import { UserRound } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import WishPopup from "../WishPopup/WishPopup";

function WishCard({ index, card, range, targetScale, progress }) {
  const scale = useTransform(progress, range, [1, targetScale]);
  const textRef = useRef(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const el = textRef.current;

    if (el) {
      setHasOverflow(el.scrollHeight > el.clientHeight + 2);
    }
  }, [card.message]);

  return (
    <>
      <motion.div className="wishes-wrapper" style={{ scale }}>
        <div className={`wish-card ${card.url ? "" : "wish-card-no-photo"}`}>
          <div className="wish-card-photo">
            {card.url ? (
              <>
                <Image
                  src={card.url}
                  alt={card.name}
                  fill
                  sizes="(max-width: 700px) 100vw, 38vw"
                  className="wish-card-photo-img"
                  priority={index === 0}
                />
                <div className="wish-card-photo-overlay" />
              </>
            ) : (
              <div className="wish-card-avatar" aria-hidden="true">
                <UserRound size={40} strokeWidth={1.3} />
              </div>
            )}

            <div className="wish-card-photo-text">
              <h3>{card.name}</h3>
              {card.relation && <p>{card.relation}</p>}
            </div>
          </div>

          <div className="wish-card-content">
            <div className="wish-card-body">
              <p ref={textRef} className="wish-card-message">
                {card.message}
              </p>

              {hasOverflow && (
                <button
                  type="button"
                  className="wish-card-seemore"
                  onClick={() => setIsOpen(true)}
                >
                  See more
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <WishPopup
        card={card}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

export default WishCard;
