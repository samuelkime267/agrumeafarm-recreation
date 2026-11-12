import Image, { StaticImageData } from "next/image";

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
  return (
    <div className="flex aspect-1080/1737 h-auto w-[22vw]">
      <Image
        src={containerImg}
        alt={project}
        width={450}
        height={665}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
