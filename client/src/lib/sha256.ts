// Utilitário de hash SHA-256 usando Web Crypto API (nativo e seguro no navegador)
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

// O hash SHA-256 correspondente à senha "MeGaDeTh3$" é:
// "401a37369e48a26a64608929b5d0bfd9bf356d57aa15906454e446d891c56429"
export const SENHA_HASH_ESPERADA = "401a37369e48a26a64608929b5d0bfd9bf356d57aa15906454e446d891c56429";
export const USUARIO_ESPERADO = "Jhonathan";
