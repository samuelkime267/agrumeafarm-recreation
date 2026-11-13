"use client";

import { useRef } from "react";
import Image, { StaticImageData } from "next/image";
import BottleLabel, { type BottleLabelHandle } from "./BottleLabel";

type ProductContainerProps = {
  project: string;
  containerImg: string | StaticImageData;
  labelImg: string | StaticImageData;
};

export default function ProductContainer({
  project,
  containerImg,
  labelImg,
}: ProductContainerProps) {
  const labelRef = useRef<BottleLabelHandle>(null);

  return (
    <div className="relative flex aspect-[1080/1737] h-auto w-[22vw]">
      <div
        className="relative h-full w-full will-change-transform"
        onPointerEnter={() => labelRef.current?.rotateTo()}
        onPointerLeave={() => {}}
        style={{
          transform: `
            translate3d(0, var(--scroll-y, 0px), 0)
            rotateZ(var(--scroll-rotation, 0deg))
            scale(var(--scroll-scale, 0.82))
          `,
          filter: "blur(var(--scroll-blur, 0px))",
        }}
      >
        <Image
          src={containerImg}
          alt={project}
          width={450}
          height={665}
          className="h-full w-full object-cover"
        />

        <BottleLabel
          ref={labelRef}
          src={labelImg}
          coverageDegrees={330}
          labelHeightRatio={0.6}
          labelTopRatio={0.28}
          radiusRatio={0.441}
        />
      </div>
    </div>
  );
}
