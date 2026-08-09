import { generateKeyPairSync, randomBytes } from 'crypto';

export class WireGuardKeys {
  static generateKeyPair(): { privateKey: string; publicKey: string } {
    const { publicKey, privateKey } = generateKeyPairSync('x25519');
    const publicJwk = publicKey.export({ format: 'jwk' }) as JsonWebKey;
    const privateJwk = privateKey.export({ format: 'jwk' }) as JsonWebKey;
    return {
      privateKey: Buffer.from(privateJwk.d!, 'base64url').toString('base64'),
      publicKey: Buffer.from(publicJwk.x!, 'base64url').toString('base64'),
    };
  }

  static generatePresharedKey(): string {
    return randomBytes(32).toString('base64');
  }
}
