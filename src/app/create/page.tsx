import { CreateTokenForm } from "../../components/create-token-form";

export default function CreatePage() {
  return (
    <div className="space-y-4 pb-24 pt-4">
      <section className="px-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[#8ba3c1]">Create</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-white">Launch meme token</h2>
        <p className="mt-2 text-sm text-[#8ba3c1]">1 TON fee · Testnet · TON Connect</p>
      </section>
      <CreateTokenForm />
    </div>
  );
}
