import { CreateTokenForm } from "../components/create-token-form";

export default function CreatePage() {
  return (
    <div className="space-y-4">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Launch</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Create a meme token</h2>
        <p className="mt-1 text-sm text-mist">
          1 TON creation fee · testnet only · instant bonding curve
        </p>
      </section>
      <CreateTokenForm />
    </div>
  );
}
