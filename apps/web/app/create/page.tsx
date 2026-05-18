import { CreateTokenForm } from "../../components/create-token-form";
import { TokenBackButton } from "../../components/token-back-button";

export default function CreatePage() {
  return (
    <div className="space-y-4 pb-24">
      <TokenBackButton />
      <section className="px-4 pt-4">
        <h1 className="font-syne text-2xl font-bold text-white">Запуск токена</h1>
        <p className="mt-1 text-sm text-[#8ba3c1]">Создай мем-токен для TONK.MEM</p>
      </section>
      <CreateTokenForm />
    </div>
  );
}
