"use client";

import { ReactNode, useRef } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(Observer, useGSAP);

interface InfiniteScrollProps {
  children: ReactNode;
  speed?: number;
  smoothing?: number;
  className?: string;
}

export default function InfiniteScroll({
  children,
  speed = 1,
  smoothing = 0.12,
  className = "",
}: InfiniteScrollProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      const group = groupRef.current;

      if (!viewport || !track || !group) return;

      let cycleHeight = 0;
      let current = 0;
      let target = 0;

      const modulo = (value: number, range: number) =>
        ((value % range) + range) % range;

      // Measure one complete content cycle.
      const measure = () => {
        cycleHeight = group.getBoundingClientRect().height;

        if (cycleHeight > 0) {
          const offset = modulo(current, cycleHeight);

          gsap.set(track, {
            y: -cycleHeight - offset,
          });
        }
      };

      const resizeObserver = new ResizeObserver(measure);

      resizeObserver.observe(group);
      resizeObserver.observe(viewport);

      measure();

      // Mouse wheel and trackpad.
      const wheelObserver = Observer.create({
        target: viewport,
        type: "wheel",
        tolerance: 0,
        preventDefault: true,

        onChangeY: (self) => {
          target += self.deltaY * speed;
        },
      });

      // Touch swipe.
      const touchObserver = Observer.create({
        target: viewport,
        type: "touch",
        tolerance: 0,
        preventDefault: true,

        onChangeY: (self) => {
          target -= self.deltaY * speed;
        },
      });

      // Keyboard navigation.
      const handleKeyDown = (event: KeyboardEvent) => {
        const element = event.target;

        if (
          element instanceof HTMLElement &&
          (element.isContentEditable ||
            element.closest("input, textarea, select, button, a"))
        )
          return;

        const forward = ["ArrowDown", "PageDown", " "];

        const backward = ["ArrowUp", "PageUp"];

        if (forward.includes(event.key)) {
          event.preventDefault();
          target += 120 * speed;
        }

        if (backward.includes(event.key)) {
          event.preventDefault();
          target -= 120 * speed;
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      // Smooth animation loop.
      const update = (_time: number, deltaTime: number) => {
        if (!cycleHeight) return;

        const alpha = 1 - Math.pow(1 - smoothing, deltaTime / 16.667);

        current += (target - current) * alpha;

        // Avoid accumulating unnecessarily large numbers.
        if (Math.abs(current) > cycleHeight * 1000) {
          const cycles = Math.trunc(current / cycleHeight);

          current -= cycles * cycleHeight;
          target -= cycles * cycleHeight;
        }

        const offset = modulo(current, cycleHeight);

        gsap.set(track, {
          y: -cycleHeight - offset,
        });
      };

      gsap.ticker.add(update);

      return () => {
        wheelObserver.kill();
        touchObserver.kill();
        resizeObserver.disconnect();

        window.removeEventListener("keydown", handleKeyDown);

        gsap.ticker.remove(update);
      };
    },
    {
      scope: viewportRef,
    },
  );

  return (
    <main ref={viewportRef} className={`infinite-scroll ${className}`}>
      <div ref={trackRef} className="infinite-scroll__track">
        {/* Previous copy */}
        <div className="infinite-scroll__group" aria-hidden="true" inert>
          {children}
        </div>

        {/* Main copy */}
        <div ref={groupRef} className="infinite-scroll__group">
          {children}
        </div>

        {/* Next copy */}
        <div className="infinite-scroll__group" aria-hidden="true" inert>
          {children}
        </div>
      </div>
    </main>
  );
}
