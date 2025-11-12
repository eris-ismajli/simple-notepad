// utils/cryptoNote.js
const enc = new TextEncoder();
const dec = new TextDecoder();

function toBase64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function fromBase64(str) {
  const bin = atob(str);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr.buffer;
}

function randBytes(len = 16) {
  const b = new Uint8Array(len);
  crypto.getRandomValues(b);
  return b.buffer;
}

export async function deriveKey(password, saltBuffer, iterations = 200000) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  return key;
}

export async function encryptNote(password, plaintext) {
  const salt = randBytes(16);
  const iv = randBytes(12);
  const key = await deriveKey(password, salt);

  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    key,
    enc.encode(plaintext)
  );

  return {
    version: 1,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(cipherBuf),
    iterations: 200000,
  };
}

export async function decryptNote(password, stored) {
  const saltBuf = fromBase64(stored.salt);
  const ivBuf = fromBase64(stored.iv);
  const cipherBuf = fromBase64(stored.ciphertext);
  const iterations = stored.iterations || 200000;

  const key = await deriveKey(password, saltBuf, iterations);

  try {
    const plainBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(ivBuf) },
      key,
      cipherBuf
    );
    return dec.decode(plainBuf);
  } catch (e) {
    throw new Error("Decryption failed — wrong password or corrupted data.");
  }
}
