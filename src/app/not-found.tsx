import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Image src="/brand/img_10.png" alt="404" width={160} height={160} className="mb-6 opacity-80" />
      <h1 className="mb-2 font-display text-4xl font-bold text-white">404</h1>
      <p className="mb-6 text-[#8ba3c1]">Эта страница улетела на Луну 🌕</p>
      <Link href="/" className="btn-primary">На главную</Link>
    </div>
  );
}
