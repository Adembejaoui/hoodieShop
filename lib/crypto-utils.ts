/**
 * Encryption Utility for localStorage (Browser-Safe)
 * 
 * Provides encryption/decryption for sensitive data stored in localStorage.
 * Uses AES-GCM encryption with the Web Crypto API.
 * 
 * NOTE: This provides OBSCURITY, not true security.
 * Users can still decrypt if they determine the algorithm.
 * For true security, use server-side validation.
 */

const ENCRYPTION_KEY = 'hoodie-legends-cart-key-2024';

/**
 * Converts a string to an ArrayBuffer
 */
function stringToBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
}

/**
 * Converts an ArrayBuffer to a string
 */
function bufferToString(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder();
  return decoder.decode(new Uint8Array(buffer));
}

/**
 * Converts a Base64 string to an ArrayBuffer
 */
function base64ToBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Converts an ArrayBuffer to a Base64 string
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binaryString = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return btoa(binaryString);
}

/**
 * Generates an encryption key from a password
 */
async function deriveKey(password: string): Promise<CryptoKey> {
  const passwordBuffer = stringToBuffer(password);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Use a fixed salt for consistency
  const salt = stringToBuffer('hoodie-legends-salt');

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data for localStorage
 * @param data - Data to encrypt (will be JSON stringified)
 * @returns Encrypted string (base64 encoded)
 */
export async function encryptData(data: any): Promise<string> {
  try {
    const jsonString = JSON.stringify(data);
    const key = await deriveKey(ENCRYPTION_KEY);
    
    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      stringToBuffer(jsonString)
    );

    // Combine IV + Encrypted data
    const ivBase64 = bufferToBase64(iv.buffer);
    const encryptedBase64 = bufferToBase64(encrypted);
    
    return `${ivBase64}:${encryptedBase64}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    return '';
  }
}

/**
 * Decrypts data from localStorage
 * @param encryptedData - Encrypted string (base64 encoded)
 * @returns Decrypted data (parsed as JSON) or null if decryption fails
 */
export async function decryptData<T = any>(encryptedData: string): Promise<T | null> {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      console.error('Invalid encrypted data format');
      return null;
    }

    const [ivBase64, encryptedBase64] = parts;
    const iv = base64ToBuffer(ivBase64);
    const encrypted = base64ToBuffer(encryptedBase64);
    
    const key = await deriveKey(ENCRYPTION_KEY);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encrypted
    );

    const jsonString = bufferToString(decrypted);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}
