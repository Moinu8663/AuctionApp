import { TestBed } from '@angular/core/testing';
import { Crypto } from './crypto';

describe('Crypto Service', () => {
  let service: Crypto;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [Crypto] });
    service = TestBed.inject(Crypto);
  });

  // ===== CREATION =====
  it('should be created', () => expect(service).toBeTruthy());

  // ===== doubleEncrypt =====
  it('should return a non-empty string from doubleEncrypt', () => {
    const result = service.doubleEncrypt({ name: 'test' });
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return a base64 string from doubleEncrypt', () => {
    const result = service.doubleEncrypt({ key: 'value' });
    expect(() => atob(result)).not.toThrow();
  });

  it('should encrypt a plain object', () => {
    const result = service.doubleEncrypt({ email: 'test@test.com', role: 'Admin' });
    expect(result).not.toContain('test@test.com');
    expect(result).not.toContain('Admin');
  });

  it('should encrypt a string value', () => {
    const result = service.doubleEncrypt('hello world');
    expect(result).not.toBe('hello world');
    expect(typeof result).toBe('string');
  });

  it('should encrypt a number', () => {
    const result = service.doubleEncrypt(42);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should encrypt an array', () => {
    const result = service.doubleEncrypt([1, 2, 3]);
    expect(typeof result).toBe('string');
    expect(result).not.toContain('[1,2,3]');
  });

  it('should produce different ciphertext for same input on each call (random IV)', () => {
    const result1 = service.doubleEncrypt({ name: 'test' });
    const result2 = service.doubleEncrypt({ name: 'test' });
    expect(result1).not.toBe(result2);
  });

  it('should produce different ciphertext for different inputs', () => {
    const result1 = service.doubleEncrypt({ name: 'Alice' });
    const result2 = service.doubleEncrypt({ name: 'Bob' });
    expect(result1).not.toBe(result2);
  });

  // ===== doubleDecrypt =====
  it('should decrypt back to original object', () => {
    const original = { email: 'test@test.com', role: 'Admin' };
    const encrypted = service.doubleEncrypt(original);
    const decrypted = service.doubleDecrypt<typeof original>(encrypted);
    expect(decrypted).toEqual(original);
  });

  it('should decrypt back to original string', () => {
    const original = 'hello world';
    const encrypted = service.doubleEncrypt(original);
    const decrypted = service.doubleDecrypt<string>(encrypted);
    expect(decrypted).toBe(original);
  });

  it('should decrypt back to original number', () => {
    const original = 12345;
    const encrypted = service.doubleEncrypt(original);
    const decrypted = service.doubleDecrypt<string>(encrypted);
    expect(String(decrypted)).toBe(String(original));
  });

  it('should decrypt back to original array', () => {
    const original = [1, 2, 3];
    const encrypted = service.doubleEncrypt(original);
    const decrypted = service.doubleDecrypt<number[]>(encrypted);
    expect(decrypted).toEqual(original);
  });

  it('should decrypt nested object correctly', () => {
    const original = { user: { name: 'Virat', age: 35 }, role: 'Admin' };
    const encrypted = service.doubleEncrypt(original);
    const decrypted = service.doubleDecrypt<typeof original>(encrypted);
    expect(decrypted).toEqual(original);
  });

  it('should decrypt object with special characters', () => {
    const original = { name: 'Test & User <admin>', email: 'test+1@test.com' };
    const encrypted = service.doubleEncrypt(original);
    const decrypted = service.doubleDecrypt<typeof original>(encrypted);
    expect(decrypted).toEqual(original);
  });

  it('should decrypt object with numeric values', () => {
    const original = { id: 1, basePrice: 2000000, auctionId: 5 };
    const encrypted = service.doubleEncrypt(original);
    const decrypted = service.doubleDecrypt<typeof original>(encrypted);
    expect(decrypted).toEqual(original);
  });

  it('should decrypt empty object', () => {
    const original = {};
    const encrypted = service.doubleEncrypt(original);
    const decrypted = service.doubleDecrypt<object>(encrypted);
    expect(decrypted).toEqual(original);
  });

  // ===== ROUND-TRIP =====
  it('should round-trip encrypt and decrypt player payload', () => {
    const payload = {
      playerName: 'Virat Kohli', age: 35, mobile: '9876543210',
      email: 'virat@test.com', country: 'India', role: 'Batsman',
      basePrice: 2000000, auctionId: 1
    };
    const encrypted = service.doubleEncrypt(payload);
    const decrypted = service.doubleDecrypt<typeof payload>(encrypted);
    expect(decrypted).toEqual(payload);
  });

  it('should round-trip encrypt and decrypt team payload', () => {
    const payload = { teamName: 'Mumbai Indians', ownerName: 'Mukesh Ambani', purse: 10000000, auctionId: 1 };
    const encrypted = service.doubleEncrypt(payload);
    const decrypted = service.doubleDecrypt<typeof payload>(encrypted);
    expect(decrypted).toEqual(payload);
  });

  it('should round-trip encrypt and decrypt login payload', () => {
    const payload = { email: 'admin@auction.com', password: 'SecurePass@123' };
    const encrypted = service.doubleEncrypt(payload);
    const decrypted = service.doubleDecrypt<typeof payload>(encrypted);
    expect(decrypted).toEqual(payload);
  });

  // ===== SECURITY =====
  it('should not expose original data in encrypted output', () => {
    const payload = { email: 'secret@test.com', password: 'mypassword' };
    const encrypted = service.doubleEncrypt(payload);
    expect(encrypted).not.toContain('secret@test.com');
    expect(encrypted).not.toContain('mypassword');
  });

  it('should return empty string when decrypting invalid input', () => {
    const result = service.doubleDecrypt<string>('not-valid-base64-encrypted-data');
    expect(result).toBe('');
  });
});
