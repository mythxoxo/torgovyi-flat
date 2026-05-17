import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Image src="/brand/img_10.jpg" alt="404" width={180} height={180} className="mb-6 rounded-3xl opacity-80" />
      <h1 className="mb-2 font-display text-4xl font-bold text-white">404</h1>
      <p className="mb-6 text-[#8ba3c1]">Эта страница улетела на Луну 🌕</p>
      <Link href="/" className="rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00c896] px-6 py-3 font-bold text-black">На главную</Link>
    </div>
  );
}
