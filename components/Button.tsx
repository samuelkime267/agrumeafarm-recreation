interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

const buttonVariants = {
  primary:
    "bg-[#E94E1B] text-white py-2 px-4 rounded-full hover:bg-[#7B2D38] duration-300 text-sm uppercase font-semibold",
  secondary:
    "border border-[#E94E1B] text-[#E94E1B] py-2 px-4 rounded-full hover:border-[#7B2D38] hover:text-[#7B2D38] duration-300 text-sm uppercase font-semibold",
};

export default function Button({ children, className, variant }: ButtonProps) {
  return (
    <button
      className={`cursor-pointer ${variant ? buttonVariants[variant] : ""} ${className}`}
    >
      {children}
    </button>
  );
}
