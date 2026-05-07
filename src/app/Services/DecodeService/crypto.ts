import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class Crypto {

  private masterKey = 'MDSHAIKHKEYFORAUCTIONPROJECT';

  // =========================
  // 🔑 KEY DERIVATION (SHA256)
  // =========================
  private deriveKey(dynamicPart: string): CryptoJS.lib.WordArray {
    const combined = `${this.masterKey}:${dynamicPart}`;
    return CryptoJS.SHA256(combined);
  }

  // =========================
  // 🔐 SINGLE ENCRYPT
  // =========================
  private encrypt(plainText: string, key: CryptoJS.lib.WordArray): string {

    const iv = CryptoJS.lib.WordArray.random(16);

    const encrypted = CryptoJS.AES.encrypt(
      plainText,
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );

    // 🔥 IMPORTANT: IV + CipherText
    const combined = iv.concat(encrypted.ciphertext);

    return CryptoJS.enc.Base64.stringify(combined);
  }

  // =========================
  // 🔓 SINGLE DECRYPT
  // =========================
  private decrypt(encryptedText: string, key: CryptoJS.lib.WordArray): string {

    const fullBytes = CryptoJS.enc.Base64.parse(encryptedText);

    // Extract IV (first 16 bytes = 4 words)
    const iv = CryptoJS.lib.WordArray.create(fullBytes.words.slice(0, 4), 16);

    const cipherText = CryptoJS.lib.WordArray.create(
      fullBytes.words.slice(4),
      fullBytes.sigBytes - 16
    );

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: cipherText } as any,
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  // =========================
  // 🔒🔒 DOUBLE ENCRYPT
  // =========================
  doubleEncrypt(data: any): string {

    const key1 = this.deriveKey('1');
    const key2 = this.deriveKey('2');

    const serialized = typeof data === 'string'
      ? data.replace(/^"|"$/g, '')
      : JSON.stringify(data);

    const first = this.encrypt(serialized, key1);
    const second = this.encrypt(first, key2);

    return second;
  }

  // =========================
  // 🔓🔓 DOUBLE DECRYPT
  // =========================
  doubleDecrypt<T>(encryptedText: string): T {

    const key1 = this.deriveKey('1');
    const key2 = this.deriveKey('2');

    const first = this.decrypt(encryptedText, key2);
    const second = this.decrypt(first, key1);

    if (second.startsWith('{') || second.startsWith('[')) {
      return JSON.parse(second);
    }

    return second as unknown as T;
  }

}
