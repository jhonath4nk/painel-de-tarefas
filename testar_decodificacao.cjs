const crypto = require("crypto").webcrypto;

const NAMESPACE = "jhonathan-metas-dashboard";
const API_URL = `https://mantledb.sh/v2/${NAMESPACE}/metas_data`;
const SENHA_CRIPTO = "MeGaDeTh3$";

async function obterChave(senha) {
  const enc = new TextEncoder();
  const senhaBytes = enc.encode(senha);
  const hash = await crypto.subtle.digest("SHA-256", senhaBytes);
  return await crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

async function descriptografar(dadosCriptografados, senha) {
  const parts = dadosCriptografados.split(":");
  if (parts.length !== 2) {
    throw new Error("Formato de criptografia inválido: não contém o caractere de divisão ':'");
  }
  const iv = new Uint8Array(Buffer.from(parts[0], "base64"));
  const ciphertext = new Uint8Array(Buffer.from(parts[1], "base64"));
  const key = await obterChave(senha);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
}

async function main() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      console.error("Erro ao buscar dados do banco:", response.statusText);
      return;
    }
    const data = await response.json();
    if (!data || !data.payload) {
      console.error("Payload não encontrado no JSON retornado.");
      return;
    }
    
    console.log("Tentando descriptografar o payload atual...");
    const jsonStr = await descriptografar(data.payload, SENHA_CRIPTO);
    const parsed = JSON.parse(jsonStr);
    console.log("Sucesso absoluto na descriptografia!");
    console.log("Número de objetivos cadastrados:", parsed.objetivos ? parsed.objetivos.length : 0);
    console.log("Dados do Desafio de 100 Dias presentes?", !!parsed.desafioDias);
  } catch (error) {
    console.error("ERRO DETECTADO NA DECODIFICAÇÃO:", error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

main();
