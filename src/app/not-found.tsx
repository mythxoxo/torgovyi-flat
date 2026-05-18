import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="glass-card relative mb-6 w-full max-w-md overflow-hidden rounded-[28px] p-8">
        <div className="absolute inset-0">
          <Image src="/brand/img_10.jpg" alt="404" fill className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,12,24,0.72),rgba(6,12,24,0.94))]" />
        </div>
        <div className="relative">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7dd3fc]">Lost in orbit</div>
          <h1 className="mt-3 mb-2 font-display text-5xl font-bold text-white">404</h1>
          <p className="mb-1 text-lg font-semibold text-white">Эта страница улетела на Луну 🌕</p>
          <p className="text-sm text-[#c4d7ef]">Ракета развалилась, робот в ахуе, маршрута больше нет.</p>
        </div>
      </div>
      <Link href="/" className="btn-primary">На главную</Link>
    </div>
  );
}
