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

export default function InfiniteHorizontalScroll({
  items,
  speed = 1,
  smoothing = 0.12,
  gap = 40,
  className = "",
}: InfiniteHorizontalScrollProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Always render at least 3 sequences:
  // one to the left, one in the middle, and one to the right.
  const [copies, setCopies] = useState(3);

  useGSAP(
    () => {
      const viewport = viewportRef.current;

      const elements = itemRefs.current.filter(
        (element): element is HTMLDivElement => !!element,
      );

      if (!viewport || !elements.length || !items.length) return;

      let itemWidths: number[] = [];
      let itemPositions: number[] = [];

      let cycleWidth = 0;

      let current = 0;
      let target = 0;

      const measure = () => {
        // The first sequence contains the original items.
        const originals = elements.slice(0, items.length);

        if (originals.length !== items.length) return;

        itemWidths = originals.map(
          (element) => element.getBoundingClientRect().width,
        );

        if (itemWidths.some((width) => width <= 0)) return;

        // Calculate the complete width of one sequence.
        // The final gap is intentional: it separates the last
        // item of one sequence from the first item of the next.
        cycleWidth = itemWidths.reduce(
          (total, width) => total + width + gap,
          0,
        );

        if (!cycleWidth) return;

        // Make sure there are enough sequences to cover
        // the viewport, including space for both edges.
        const requiredCopies = Math.max(
          3,
          Math.ceil(viewport.clientWidth / cycleWidth) + 3,
        );

        if (requiredCopies !== copies) {
          setCopies(requiredCopies);
          return;
        }

        // Calculate each item's position in the complete track.
        itemPositions = [];

        for (let copyIndex = 0; copyIndex < copies; copyIndex++) {
          // The first sequence starts one cycle before zero.
          const sequenceOffset = (copyIndex - 1) * cycleWidth;

          let position = sequenceOffset;

          for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            itemPositions.push(position);

            position += itemWidths[itemIndex] + gap;
          }
        }

        updatePositions();
      };

      const updatePositions = () => {
        if (!cycleWidth || !itemPositions.length) return;

        // Keep the offset within one complete sequence.
        // This makes the reset visually seamless because
        // an identical sequence is already beside it.
        const offset = ((current % cycleWidth) + cycleWidth) % cycleWidth;

        elements.forEach((element, index) => {
          const x = itemPositions[index] - offset;

          gsap.set(element, {
            x,
            yPercent: -50,
          });
        });
      };

      // Mouse wheel and touch interaction.
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

      // Keyboard interaction.
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

      // Recalculate positions when the viewport or items resize.
      const resizeObserver = new ResizeObserver(measure);

      resizeObserver.observe(viewport);

      elements.forEach((element) => {
        resizeObserver.observe(element);
      });

      measure();

      // Smooth scrolling.
      const update = (_time: number, deltaTime: number) => {
        const alpha = 1 - Math.pow(1 - smoothing, deltaTime / 16.667);

        current += (target - current) * alpha;

        updatePositions();
      };

      gsap.ticker.add(update);

      viewport.addEventListener("keydown", handleKeyDown);

      return () => {
        observer.kill();
        resizeObserver.disconnect();
        gsap.ticker.remove(update);

        viewport.removeEventListener("keydown", handleKeyDown);
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
      {/* Repeated horizontal sequences */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        {Array.from({ length: copies }).map((_, copyIndex) =>
          items.map((item, itemIndex) => {
            const index = copyIndex * items.length + itemIndex;

            return (
              <div
                key={`${copyIndex}-${itemIndex}`}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                className="absolute left-0 top-1/2 w-max will-change-transform"
              >
                {item}
              </div>
            );
          }),
        )}
      </div>

      {/* Stationary center element */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <main className="flex h-dvh flex-col items-center justify-center lg:h-screen">
          <div className="relative mt-auto overflow-hidden">
            <BackSliderHome className="h-auto w-[76vw]" />

            <CircleText className="absolute left-1/2 top-[18%] h-auto w-[85%] -translate-x-1/2" />
          </div>
        </main>
      </div>
    </main>
  );
}
