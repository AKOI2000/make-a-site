"use client";

import Image from "next/image";
// import styles from "./Memory.module.scss";

export default function Memory({ item, sizeClass }) {
  return (
    <figure className={`${"memory"} ${sizeClass}`}>
      <div className={"frame"}>
        <Image
          src={item.image}
          alt={item.caption}
          fill
          sizes="(max-width: 600px) 80vw, 40vw"
          className={"image"}
        />
      </div>
      <figcaption className={"caption"}>{item.caption}</figcaption>
    </figure>
  );
}
