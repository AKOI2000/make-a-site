
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { UserRound } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { useLenis } from "../../_context/LenisProvider";

import "./wishPopup.scss";

function WishPopup({ card, isOpen, onClose }) {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    if (isOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }

    return () => {
      lenis.start();
    };
  }, [isOpen, lenis]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="wish-popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <button
            type="button"
            className="wish-popup-close"
            onClick={onClose}
            aria-label="Close wish"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <motion.div
            className="wish-popup"
            role="dialog"
            aria-modal="true"
            aria-label={`Birthday wish from ${card.name}`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={(event) => event.stopPropagation()}
            data-lenis-prevent
          >
            <div className="wish-popup-scroll">
              <div
                className={`wish-popup-image ${
                  card.url ? "" : "wish-popup-image-no-photo"
                }`}
              >
                {card.url ? (
                  <Image
                    src={card.url}
                    alt={`Photo shared by ${card.name}`}
                    width={1600}
                    height={900}
                    sizes="(max-width: 700px) 100vw, 90vw"
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    className="wish-popup-avatar"
                    aria-label={`No photo provided by ${card.name}`}
                    role="img"
                  >
                    <UserRound size={64} strokeWidth={1.2} />
                  </div>
                )}
              </div>

              <div className="wish-popup-text">
                <p>{card.message}</p>
                <h3>{card.name}</h3>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default WishPopup;
