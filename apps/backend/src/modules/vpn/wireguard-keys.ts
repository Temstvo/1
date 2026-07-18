import * as crypto from 'crypto';

export class WireGuardKeys {
  static generateKeyPair(): { privateKey: string; publicKey: string } {
    const privateKey = crypto.randomBytes(32);
    const publicKey = this.curve25519ScalarMultBase(privateKey);
    return {
      privateKey: privateKey.toString('base64'),
      publicKey: publicKey.toString('base64'),
    };
  }

  static generatePresharedKey(): string {
    return crypto.randomBytes(32).toString('base64');
  }

  private static curve25519ScalarMultBase(scalar: Buffer): Buffer {
    const ECDH = crypto.createECDH('curve25519');
    ECDH.setPrivateKey(scalar);
    return ECDH.getPublicKey();
  }
}
