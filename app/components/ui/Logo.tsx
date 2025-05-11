import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export default function Logo({ size = "md" }: LogoProps) {
  const sizes = {
    sm: { width: 100, height: 40 },
    md: { width: 140, height: 56 },
    lg: { width: 180, height: 72 },
  };

  const { width, height } = sizes[size];

  return (
    <Link href="/">
      <Image
        src="/logo.svg"
        alt="Pukapuka Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </Link>
  );
}
