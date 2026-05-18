const url = process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL || "https://torgovyi-flat.vercel.app/tonconnect-manifest.json";

async function main() {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Manifest check failed: ${response.status}`);
  }

  const json = await response.json();
  if (!json?.url || !json?.iconUrl) {
    throw new Error("Manifest missing required fields");
  }

  console.log(JSON.stringify({ ok: true, url, manifest: json }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
