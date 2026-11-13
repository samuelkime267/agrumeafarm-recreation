"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import gsap from "gsap";
import type { StaticImageData } from "next/image";

export type BottleLabelHandle = {
  rotateTo: () => void;
};

type BottleLabelProps = {
  src: string | StaticImageData;
  coverageDegrees?: number;
  labelHeightRatio?: number;
  labelTopRatio?: number;
  radiusRatio?: number;
};

type LabelSlice = {
  sourceX: number;
  sourceWidth: number;
  x: number;
  width: number;
  depth: number;
};

const BottleLabel = forwardRef<BottleLabelHandle, BottleLabelProps>(
  function BottleLabel(
    {
      src,
      coverageDegrees = 300,
      labelHeightRatio = 0.3,
      labelTopRatio = 0.43,
      radiusRatio = 0.3,
    },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const rotationRef = useRef({ value: 0 });
    const tweenRef = useRef<gsap.core.Tween | null>(null);
    const drawRef = useRef<(() => void) | null>(null);

    const imageSrc = typeof src === "string" ? src : src.src;

    const draw = useCallback(() => {
      const canvas = canvasRef.current;
      const image = imageRef.current;

      if (!canvas || !image?.complete || !image.naturalWidth) return;

      const rect = canvas.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      const width = rect.width;
      const height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const radius = width * radiusRatio;

      const labelHeight = height * labelHeightRatio;
      const labelTop = height * labelTopRatio;

      const coverage = (coverageDegrees * Math.PI) / 180;
      const rotation = rotationRef.current.value;

      const sliceCount = 240;
      const sourceSliceWidth = image.naturalWidth / sliceCount;
      const anglePerSlice = coverage / sliceCount;

      const visibleSlices: LabelSlice[] = [];

      for (let i = 0; i < sliceCount; i++) {
        const originalAngle = -coverage / 2 + (i + 0.5) * anglePerSlice;

        const rawAngle = originalAngle + rotation;

        const angle = Math.atan2(Math.sin(rawAngle), Math.cos(rawAngle));

        const depth = Math.cos(angle);

        if (depth <= 0) continue;

        const projectedX = centerX + radius * Math.sin(angle);
        const projectedWidth = radius * depth * anglePerSlice;

        visibleSlices.push({
          sourceX: i * sourceSliceWidth,
          sourceWidth: sourceSliceWidth + 0.5,
          x: projectedX - projectedWidth / 2,
          width: projectedWidth + 0.8,
          depth,
        });
      }

      visibleSlices.sort((a, b) => a.x - b.x);

      for (const slice of visibleSlices) {
        ctx.drawImage(
          image,
          slice.sourceX,
          0,
          slice.sourceWidth,
          image.naturalHeight,
          slice.x,
          labelTop,
          slice.width,
          labelHeight,
        );

        const darkness = (1 - slice.depth) * 0.42;

        if (darkness > 0) {
          ctx.fillStyle = `rgba(0, 0, 0, ${darkness})`;
          ctx.fillRect(slice.x, labelTop, slice.width, labelHeight);
        }
      }
    }, [coverageDegrees, labelHeightRatio, labelTopRatio, radiusRatio]);

    // Each call adds another complete clockwise rotation.
    const rotateTo = useCallback(() => {
      // Don't interrupt an animation already in progress.
      if (tweenRef.current?.isActive()) return;

      const nextRotation = rotationRef.current.value + Math.PI * 2;

      tweenRef.current = gsap.to(rotationRef.current, {
        value: nextRotation,
        duration: 1.5,
        ease: "power3.inOut",
        onUpdate: () => drawRef.current?.(),
      });
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        rotateTo,
      }),
      [rotateTo],
    );

    useEffect(() => {
      drawRef.current = draw;

      const image = new window.Image();
      image.decoding = "async";
      image.src = imageSrc;

      image.onload = () => {
        imageRef.current = image;
        drawRef.current?.();
      };

      const canvas = canvasRef.current;

      const observer = canvas
        ? new ResizeObserver(() => drawRef.current?.())
        : null;

      if (canvas) observer?.observe(canvas);

      return () => {
        observer?.disconnect();
        image.onload = null;
        tweenRef.current?.kill();
        imageRef.current = null;
      };
    }, [imageSrc, draw]);

    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      />
    );
  },
);

BottleLabel.displayName = "BottleLabel";

export default BottleLabel;
