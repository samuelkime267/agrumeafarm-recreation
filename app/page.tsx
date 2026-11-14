import InfiniteHorizontalScroll from "@/components/InfiniteHorizontalScroll";
// import InfiniteScroll from "@/components/InfiniteScroll";
import ProductContainer from "@/components/ProductContainer";
import { products } from "@/data/products.data";

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
    </>
  );
}
