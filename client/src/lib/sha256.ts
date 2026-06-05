// Utilitário de hash SHA-256 usando Web Crypto API (nativo e seguro no navegador)
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

// O hash SHA-256 correspondente à senha "MeGaDeTh3$" é:
// "5124a91986f78e47083049100150f58022b64703b418a0026e6f987f654b9d03"
export const SENHA_HASH_ESPERADA = "5124a91986f78e47083049100150f58022b64703b418a0026e6f987f654b9d03";
export const USUARIO_ESPERADO = "Jhonathan";
