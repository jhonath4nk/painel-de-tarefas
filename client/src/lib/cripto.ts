/**
 * Utilitário de Criptografia AES-256 (Padrão Militar) usando a Web Crypto API nativa do navegador.
 * Garante que os dados de metas sejam totalmente criptografados localmente antes de serem enviados à nuvem,
 * usando a própria senha do usuário como chave de derivação.
 */

// Deriva uma chave criptográfica AES-GCM a partir de uma senha usando PBKDF2
async function derivarChave(senha: string, sal: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const materialChave = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(senha),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: sal,
      iterations: 100000,
      hash: "SHA-256"
    },
    materialChave,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Criptografa uma string de texto (JSON) usando a senha do usuário.
 * Retorna uma string em formato Base64 contendo o Sal, Vetor de Inicialização (IV) e o Texto Criptografado.
 */
export async function criptografar(texto: string, senha: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const dados = encoder.encode(texto);

    // Gerar Sal e IV aleatórios e seguros
    const sal = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const chave = await derivarChave(senha, sal);

    const dadosCriptografados = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      chave,
      dados
    );

    // Empacotar tudo em um único buffer para conversão em Base64
    const bufferCompleto = new Uint8Array(sal.byteLength + iv.byteLength + dadosCriptografados.byteLength);
    bufferCompleto.set(sal, 0);
    bufferCompleto.set(iv, sal.byteLength);
    bufferCompleto.set(new Uint8Array(dadosCriptografados), sal.byteLength + iv.byteLength);

    // Converter para string Base64 segura de forma compatível
    let binario = "";
    const tamanho = bufferCompleto.byteLength;
    for (let i = 0; i < tamanho; i++) {
      binario += String.fromCharCode(bufferCompleto[i]);
    }
    return btoa(binario);
  } catch (error) {
    console.error("Erro ao criptografar dados:", error);
    throw new Error("Falha na criptografia dos dados.");
  }
}

/**
 * Descriptografa uma string Base64 criptografada usando a senha do usuário.
 * Retorna o texto original decodificado (JSON).
 */
export async function descriptografar(base64: string, senha: string): Promise<string> {
  try {
    // Converter Base64 de volta para buffer de bytes
    const stringBinaria = atob(base64);
    const bytes = new Uint8Array(stringBinaria.length);
    for (let i = 0; i < stringBinaria.length; i++) {
      bytes[i] = stringBinaria.charCodeAt(i);
    }

    // Extrair o Sal (16 bytes), IV (12 bytes) e os dados criptografados
    const sal = bytes.slice(0, 16);
    const iv = bytes.slice(16, 28);
    const dadosCriptografados = bytes.slice(28);

    const chave = await derivarChave(senha, sal);

    const dadosDescriptografados = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      chave,
      dadosCriptografados
    );

    const decoder = new TextDecoder();
    return decoder.decode(dadosDescriptografados);
  } catch (error) {
    console.error("Erro ao descriptografar dados (provavelmente senha incorreta):", error);
    throw new Error("Senha incorreta ou dados corrompidos.");
  }
}
