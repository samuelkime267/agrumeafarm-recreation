import Button from "@/components/Button";
import InfiniteHorizontalScroll from "@/components/InfiniteHorizontalScroll";
// import InfiniteScroll from "@/components/InfiniteScroll";
import ProductContainer from "@/components/ProductContainer";
import { products } from "@/data/products.data";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* <InfiniteScroll>
        <main className="h-dvh lg:h-screen flex items-center justify-center flex-col">
          <div className="relative mt-auto overflow-hidden">
            <BackSliderHome className="w-[76vw] h-auto" />
            <CircleText className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[85%] h-auto" />
          </div>
        </main>
      </InfiniteScroll> */}
      <InfiniteHorizontalScroll
        items={products.map(({ containerImg, labelImg, project }, i) => (
          <ProductContainer
            key={i}
            project={project}
            containerImg={containerImg}
            labelImg={labelImg}
          />
        ))}
        gap={110}
        speed={1.5}
        smoothing={0.025}
      />

      <div className="fixed bottom-0 left-0 w-full flex items-start justify-between p-8 z-20">
        <Button className="text-sm underline   opacity-70">
          Privacy & Cookies
        </Button>

        <p className="uppercase text-lg font-cor! text-white">
          Scroll to discover
        </p>
        <Link href={"https://samuelkime.netlify.app/"} target="_blank">
          <Button className="bg-background p-2 rounded-md relative">
            <p className="text-xs text-[#762431] absolute top-0 right-2 -translate-y-1/3 text-[8px]">
              Recreated By
            </p>
            <p className="text-xs text-[#762431]"> Samuel Kime</p>
          </Button>
        </Link>
      </div>
    </>
  );
}
