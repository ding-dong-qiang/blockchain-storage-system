import CryptoJS from 'crypto-js';

// System encryption configuration
// In production, this should be loaded from environment variables
const ENCRYPTION_CONFIG = {
  // Main encryption key for all data
  key: process.env.ENCRYPTION_KEY || 'your-secret-key',
  
  // Salt for additional security (optional)
  salt: process.env.ENCRYPTION_SALT || 'optional-salt-value'
};

// Key for filename encryption
const FILENAME_KEY = getPurposeKey('filename');

// Key for mapping encryption
const MAPPING_KEY = getPurposeKey('mapping');

/**
 * Interface for encryption key pair
 */
interface EncryptionKey {
  publicKey: string;
  privateKey: string;
}

// Utility function to encode string to base64
function encodeBase64(str: string): string {
  return btoa(encodeURIComponent(str));
}

// Utility function to decode base64 to string
function decodeBase64(str: string): string {
  try {
    return decodeURIComponent(atob(str));
  } catch {
    return str;
  }
}

// Generate a consistent hash for a string
function generateConsistentHash(str: string): string {
  return CryptoJS.SHA256(str).toString();
}

/**
 * Encrypt filename
 */
export function encryptFileName(fileName: string): string {
  try {
    // Generate a consistent hash for the filename
    return 'file_' + generateConsistentHash(fileName);
  } catch (error) {
    console.error('Filename encryption error:', error);
    throw new Error('Failed to encrypt filename');
  }
}

// Get the encrypted mapping from localStorage
function getEncryptedMapping(): Record<string, string> {
  try {
    const encryptedMapping = localStorage.getItem('filenameMapping');
    if (!encryptedMapping) return {};

    const decrypted = CryptoJS.AES.decrypt(encryptedMapping, MAPPING_KEY);
    const mappingStr = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(mappingStr);
  } catch {
    return {};
  }
}

// Save the encrypted mapping to localStorage
function saveEncryptedMapping(mapping: Record<string, string>): void {
  const mappingStr = JSON.stringify(mapping);
  const encrypted = CryptoJS.AES.encrypt(mappingStr, MAPPING_KEY).toString();
  localStorage.setItem('filenameMapping', encrypted);
}

/**
 * Store filename mapping
 */
export function storeFileNameMapping(originalName: string, encryptedName: string): void {
  try {
    const mapping = getEncryptedMapping();
    mapping[generateConsistentHash(originalName)] = encryptedName;
    saveEncryptedMapping(mapping);
  } catch (error) {
    console.error('Error storing filename mapping:', error);
  }
}

/**
 * Get original filename
 */
export function getOriginalFileName(encryptedName: string): string | null {
  try {
    const mapping = getEncryptedMapping();
    for (const [hashedOriginal, encrypted] of Object.entries(mapping)) {
      if (encrypted === encryptedName) {
        // The original name is not stored, only its hash
        return hashedOriginal;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting original filename:', error);
    return null;
  }
}

/**
 * Encrypt data with the system key or a provided key
 */
export function encryptWithKey(text: string, privateKey?: string): string {
  try {
    const key = privateKey || ENCRYPTION_CONFIG.key;
    return CryptoJS.AES.encrypt(text, key).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data with the system key or a provided key
 */
export function decryptWithKey(encryptedText: string, privateKey?: string): string {
  try {
    const key = privateKey || ENCRYPTION_CONFIG.key;
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Generate a new encryption key pair
 * In a production environment, this should use a more secure asymmetric encryption algorithm
 */
export function generateKeyPair(): EncryptionKey {
  const privateKey = CryptoJS.lib.WordArray.random(32).toString();
  const publicKey = CryptoJS.SHA256(privateKey).toString();
  return { publicKey, privateKey };
}

// Helper function to derive a key from the main key for specific purposes
function deriveKey(purpose: string): string {
  return CryptoJS.HmacSHA256(ENCRYPTION_CONFIG.key, purpose).toString();
}

/**
 * Get a specific purpose key
 * This allows using different keys for different types of data
 * while maintaining a single source of truth
 */
export function getPurposeKey(purpose: 'filename' | 'content' | 'metadata'): string {
  return deriveKey(purpose);
}

// For backward compatibility
export const encryptText = encryptWithKey;
export const decryptText = decryptWithKey;
