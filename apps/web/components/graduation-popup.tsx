"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function GraduationPopup({ progress, tokenName }: { progress: number; tokenName: string }) {
  const [showGrad, setShowGrad] = useState(false);

  useEffect(() => {
    const key = `graduation-shown:${tokenName}`;
    if (progress >= 100 && sessionStorage.getItem(key) !== "1") {
      setShowGrad(true);
      sessionStorage.setItem(key, "1");
      void import("@twa-dev/sdk").then(({ default: WebApp }) => {
        WebApp.HapticFeedback.notificationOccurred("success");
      });
    }
  }, [progress, tokenName]);

  if (!showGrad) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0f1a]/95 px-6 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,200,150,0.18),transparent_24%),radial-gradient(circle_at_70%_30%,rgba(0,136,204,0.18),transparent_24%)]" />
      <Image src="/brand/img_08.jpg" alt="Graduation" width={200} height={200} className="relative mb-6 rounded-2xl object-contain animate-bounce" />
      <h2 className="relative mb-2 font-syne text-3xl font-bold text-white">🎓 Токен выпустился!</h2>
      <p className="relative mb-1 text-[#8ba3c1]">{tokenName} мигрирует на STON.fi</p>
      <p className="relative mb-8 text-xs text-[#8ba3c1]">Собрано 8 888 TON · Ликвидность добавлена</p>
      <button
        onClick={() => setShowGrad(false)}
        className="relative rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00c896] px-8 py-3 font-bold text-black"
      >
        Отлично! 🚀
      </button>
    </div>
  );
}
