import CryptoJS from 'crypto-js';

// Encrypt text
export function encryptText(text: string, secretKey: string): string {
  return CryptoJS.AES.encrypt(text, secretKey).toString();
}

// Decrypt text
export function decryptText(encryptedText: string, secretKey: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}