import React from "react";
import Button from "./Button";
import Logo from "./svgs/icons/logo";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full flex items-start justify-between p-8 z-20">
      <Button
        variant="primary"
        className="aspect-square py-1! px-2.5!  h-auto w-auto"
      >
        EN
      </Button>

      <Logo className="w-28 h-auto" />

      <Button variant="secondary" className="border-[#762431]! text-[#762431]!">
        Menu
      </Button>
    </nav>
  );
}
