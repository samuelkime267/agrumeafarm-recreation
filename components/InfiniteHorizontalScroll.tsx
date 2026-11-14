"use client";

import { ReactNode, useRef, useState } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { useGSAP } from "@gsap/react";

import BackSliderHome from "./svgs/back-slider-home";
import CircleText from "./svgs/circle-text";

gsap.registerPlugin(Observer, useGSAP);

interface InfiniteHorizontalScrollProps {
  items: ReactNode[];
  speed?: number;
  smoothing?: number;
  gap?: number;
  className?: string;
}

/**
 * Smoothly interpolates between rotation keyframes.
 */
const getRotation = (progress: number) => {
  const keyframes = [
    { position: -1, rotation: 0 },
    { position: -0.5, rotation: -30 },
    { position: 0, rotation: 20 },
    { position: 0.5, rotation: -15 },
    { position: 1, rotation: 0 },
  ];

  const index = keyframes.findIndex((frame) => frame.position >= progress);

  if (index === -1) {
    return keyframes[keyframes.length - 1].rotation;
  }

  if (index === 0) {
    return keyframes[0].rotation;
  }

  const previous = keyframes[index - 1];
  const next = keyframes[index];

  let localProgress =
    (progress - previous.position) / (next.position - previous.position);

  localProgress = localProgress * localProgress * (3 - 2 * localProgress);

  return (
    previous.rotation + (next.rotation - previous.rotation) * localProgress
  );
};

export default function InfiniteHorizontalScroll({
  items,
  speed = 1,
  smoothing = 0.12,
  gap = 40,
  className = "",
}: InfiniteHorizontalScrollProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const motionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const circleTextRef = useRef<HTMLDivElement>(null);

  const [copies, setCopies] = useState(3);

  useGSAP(
    () => {
      const viewport = viewportRef.current;
      const circleText = circleTextRef.current;

      const elements = itemRefs.current.filter(
        (element): element is HTMLDivElement => !!element,
      );

      if (!viewport || !circleText || !elements.length || !items.length) {
        return;
      }

      let itemWidths: number[] = [];
      let itemPositions: number[] = [];
      let cycleWidth = 0;

      let current = 0;
      let target = 0;

      // CircleText rotation state.
      let previousCurrent = 0;
      let circleRotation = 0;

      const rotationFactor = 0.005;

      // Mouse displacement settings.
      const maxMouseDisplacement = 10;
      const mouseSmoothing = 0.1;

      // Adjust the maximum mouse-driven product rotation here.
      const maxMouseRotation = 10;

      let targetMouseX = 0;
      let targetMouseY = 0;

      let currentMouseX = 0;
      let currentMouseY = 0;

      const handlePointerMove = (event: PointerEvent) => {
        const rect = viewport.getBoundingClientRect();

        const normalizedX =
          (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);

        const normalizedY =
          (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);

        targetMouseX =
          gsap.utils.clamp(-1, 1, normalizedX) * maxMouseDisplacement;

        targetMouseY =
          gsap.utils.clamp(-1, 1, normalizedY) * maxMouseDisplacement;
      };

      const handlePointerLeave = () => {
        targetMouseX = 0;
        targetMouseY = 0;
      };

      const updatePositions = () => {
        if (!cycleWidth || !itemPositions.length) return;

        const offset = ((current % cycleWidth) + cycleWidth) % cycleWidth;

        const viewportWidth = viewport.clientWidth;
        const viewportCenter = viewportWidth / 2;

        const mouseInfluence = gsap.utils.clamp(
          -1,
          1,
          currentMouseX / maxMouseDisplacement,
        );

        // Same mouse rotation for every product.
        const mouseRotation = gsap.utils.clamp(
          -maxMouseRotation,
          maxMouseRotation,
          mouseInfluence * maxMouseRotation,
        );

        elements.forEach((element, index) => {
          const motionElement = motionRefs.current[index];

          if (!motionElement) return;

          const itemIndex = index % items.length;
          const width = itemWidths[itemIndex];

          const x = itemPositions[index] - offset;

          // Outer container: infinite scroll positioning.
          gsap.set(element, {
            x,
            yPercent: -50,
          });

          const itemCenter = x + width / 2;
          const distanceFromCenter = itemCenter - viewportCenter;

          const progress = gsap.utils.clamp(
            -1,
            1,
            distanceFromCenter / (viewportWidth / 2),
          );

          const distance = Math.abs(progress);

          const isVisible = x + width > 0 && x < viewportWidth;

          const scale = 1 - distance * 0.6;

          const verticalOffset =
            progress < 0 ? -progress * -150 : -progress * -150;

          const rotation = getRotation(progress);

          const blur = distance * 4;

          // Inner container: mouse movement and rotation.
          gsap.set(motionElement, {
            x: currentMouseX,
            y: currentMouseY,
            rotation: mouseRotation,
          });

          motionElement.style.setProperty("--scroll-y", `${verticalOffset}px`);

          motionElement.style.setProperty(
            "--scroll-progress",
            progress.toString(),
          );

          motionElement.style.setProperty(
            "--scroll-distance",
            distance.toString(),
          );

          motionElement.style.setProperty(
            "--scroll-visible",
            isVisible ? "1" : "0",
          );

          motionElement.style.setProperty("--scroll-scale", scale.toString());

          motionElement.style.setProperty(
            "--scroll-rotation",
            `${rotation}deg`,
          );

          motionElement.style.setProperty("--scroll-blur", `${blur}px`);
        });
      };

      const measure = () => {
        const originals = elements.slice(0, items.length);

        if (originals.length !== items.length) return;

        itemWidths = originals.map(
          (element) => element.getBoundingClientRect().width,
        );

        if (itemWidths.some((width) => width <= 0)) return;

        cycleWidth = itemWidths.reduce(
          (total, width) => total + width + gap,
          0,
        );

        if (!cycleWidth) return;

        const requiredCopies = Math.max(
          3,
          Math.ceil(viewport.clientWidth / cycleWidth) + 3,
        );

        if (requiredCopies !== copies) {
          setCopies(requiredCopies);
          return;
        }

        itemPositions = [];

        for (let copyIndex = 0; copyIndex < copies; copyIndex++) {
          const sequenceOffset = (copyIndex - 1) * cycleWidth;
          let position = sequenceOffset;

          for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            itemPositions.push(position);
            position += itemWidths[itemIndex] + gap;
          }
        }

        updatePositions();
      };

      const observer = Observer.create({
        target: viewport,
        type: "wheel,touch",
        tolerance: 0,
        preventDefault: true,

        onChange: (self) => {
          const delta =
            self.event.type === "wheel"
              ? self.deltaY || self.deltaX
              : self.deltaX || self.deltaY;

          target += delta * speed;
        },
      });

      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.target instanceof HTMLElement &&
          (event.target.isContentEditable ||
            event.target.closest("input, textarea, select, button, a"))
        ) {
          return;
        }

        if (["ArrowRight", "ArrowDown", "PageDown"].includes(event.key)) {
          event.preventDefault();
          target += 150 * speed;
        }

        if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) {
          event.preventDefault();
          target -= 150 * speed;
        }
      };

      const resizeObserver = new ResizeObserver(measure);

      resizeObserver.observe(viewport);
      elements.forEach((element) => resizeObserver.observe(element));

      measure();

      /**
       * Shared GSAP ticker.
       */
      const update = (_time: number, deltaTime: number) => {
        const alpha = 1 - Math.pow(1 - smoothing, deltaTime / 16.667);

        current += (target - current) * alpha;

        // Smooth mouse displacement.
        const mouseAlpha = 1 - Math.pow(1 - mouseSmoothing, deltaTime / 16.667);

        currentMouseX += (targetMouseX - currentMouseX) * mouseAlpha;

        currentMouseY += (targetMouseY - currentMouseY) * mouseAlpha;

        // CircleText rotation follows scroll direction.
        const scrollDelta = current - previousCurrent;

        circleRotation += scrollDelta * rotationFactor;

        // CircleText moves opposite to the mouse.
        gsap.set(circleText, {
          x: -currentMouseX,
          y: -currentMouseY,
          rotation: circleRotation,
        });

        previousCurrent = current;

        updatePositions();
      };

      gsap.ticker.add(update);

      viewport.addEventListener("keydown", handleKeyDown);
      viewport.addEventListener("pointermove", handlePointerMove);
      viewport.addEventListener("pointerleave", handlePointerLeave);

      return () => {
        observer.kill();
        resizeObserver.disconnect();

        gsap.ticker.remove(update);

        viewport.removeEventListener("keydown", handleKeyDown);
        viewport.removeEventListener("pointermove", handlePointerMove);
        viewport.removeEventListener("pointerleave", handlePointerLeave);
      };
    },
    {
      scope: viewportRef,
      dependencies: [items, copies, gap, speed, smoothing],
      revertOnUpdate: true,
    },
  );

  return (
    <main
      ref={viewportRef}
      tabIndex={0}
      className={`relative isolate h-dvh w-full overflow-hidden touch-none outline-none ${className}`}
    >
      {/* Moving product sequence */}
      <div
        data-scroll-viewport
        className="absolute inset-0 z-10 overflow-hidden"
      >
        {Array.from({ length: copies }).map((_, copyIndex) =>
          items.map((item, itemIndex) => {
            const index = copyIndex * items.length + itemIndex;

            return (
              <div
                key={`${copyIndex}-${itemIndex}`}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                className="absolute left-0 top-1/2 w-max"
              >
                {/* Mouse motion layer */}
                <div
                  ref={(element) => {
                    motionRefs.current[index] = element;
                  }}
                  className="will-change-transform"
                >
                  {item}
                </div>
              </div>
            );
          }),
        )}
      </div>

      {/* Stationary centre design */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <main className="flex h-dvh flex-col items-center justify-center lg:h-screen">
          <div className="relative mt-auto overflow-hidden">
            <BackSliderHome className="h-auto w-[76vw]" />

            {/* CircleText positioning wrapper */}
            <div className="absolute left-1/2 top-[18%] h-auto w-[85%] -translate-x-1/2">
              <div ref={circleTextRef} className="will-change-transform">
                <CircleText className="h-auto w-full" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </main>
  );
}
