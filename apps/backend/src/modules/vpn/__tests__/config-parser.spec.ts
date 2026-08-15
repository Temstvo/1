import {
  parseConfigUri,
  validateSecurity,
  splitServer,
  isPrivateHost,
  buildConfigId,
} from '../config-parser';

describe('config-parser', () => {
  describe('parseConfigUri', () => {
    it('should parse a valid vless config', () => {
      const cfg = parseConfigUri(
        'vless://uuid@185.234.72.1:443?encryption=none&security=reality#🇩🇪 Germany VLESS',
        'black',
      );

      expect(cfg).not.toBeNull();
      expect(cfg!.protocol).toBe('vless');
      expect(cfg!.host).toBe('185.234.72.1');
      expect(cfg!.port).toBe(443);
      expect(cfg!.country).toBe('Germany');
      expect(cfg!.countryCode).toBe('DE');
      expect(cfg!.listType).toBe('black');
    });

    it('should normalize ss protocol to shadowsocks', () => {
      const cfg = parseConfigUri('ss://YWVzLTI1Ni1nY206cGFzcw@45.11.5.2:8388#🇳🇱 NL', 'black');
      expect(cfg!.protocol).toBe('shadowsocks');
    });

    it('should reject unsupported protocols', () => {
      expect(parseConfigUri('wireguard://x@1.2.3.4:51820#test', 'black')).toBeNull();
      expect(parseConfigUri('not-a-uri', 'black')).toBeNull();
    });

    it('should mark missing endpoint as unknown', () => {
      const cfg = parseConfigUri('trojan://pass@#label', 'white');
      expect(cfg!.host).toBe('unknown');
    });

    it('should produce deterministic ids ignoring labels', () => {
      const a = parseConfigUri('vless://x@1.2.3.4:443#A', 'black');
      const b = parseConfigUri('vless://x@1.2.3.4:443#B', 'black');
      const c = parseConfigUri('vless://x@1.2.3.4:443?security=reality#B', 'black');
      expect(a!.id).toBe(b!.id);
      expect(a!.id).not.toBe(c!.id);
    });
  });

  describe('splitServer', () => {
    it('should split host and port', () => {
      expect(splitServer('185.234.72.1:8388')).toEqual({ host: '185.234.72.1', port: 8388 });
    });

    it('should default port to 443', () => {
      expect(splitServer('example.com')).toEqual({ host: 'example.com', port: 443 });
    });

    it('should lowercase host', () => {
      expect(splitServer('Example.COM:8443').host).toBe('example.com');
    });
  });

  describe('isPrivateHost', () => {
    it.each([
      '10.0.0.1',
      '192.168.1.1',
      '127.0.0.1',
      '172.16.0.1',
      '172.31.255.255',
      '169.254.1.1',
      '0.0.0.0',
      'localhost',
      '::1',
      '999.1.1.1',
    ])('should detect %s as private/invalid', (host) => {
      expect(isPrivateHost(host)).toBe(true);
    });

    it.each(['8.8.8.8', '185.234.72.1', 'example.com', '45.11.5.2'])(
      'should treat %s as public',
      (host) => {
        expect(isPrivateHost(host)).toBe(false);
      },
    );
  });

  describe('validateSecurity', () => {
    it('should accept a public config', () => {
      const cfg = parseConfigUri('vless://x@185.234.72.1:443#DE', 'black')!;
      expect(validateSecurity(cfg)).toEqual({ ok: true, reason: null });
    });

    it('should reject private hosts', () => {
      const cfg = parseConfigUri('vless://x@10.0.0.5:443#x', 'black')!;
      expect(validateSecurity(cfg)).toEqual({ ok: false, reason: 'private host' });
    });

    it('should reject missing endpoints', () => {
      const cfg = parseConfigUri('trojan://pass@#label', 'white')!;
      expect(validateSecurity(cfg).ok).toBe(false);
      expect(validateSecurity(cfg).reason).toBe('no endpoint');
    });

    it('should reject control characters in uri', () => {
      const cfg = parseConfigUri('vless://x@185.234.72.1:443#ok', 'black')!;
      cfg.uri = 'vless://x@185.234.72.1:443#a\u0000b';
      expect(validateSecurity(cfg).ok).toBe(false);
    });

    it('should reject oversized uris', () => {
      const cfg = parseConfigUri('vless://x@185.234.72.1:443#ok', 'black')!;
      cfg.uri = 'vless://' + 'a'.repeat(2500);
      expect(validateSecurity(cfg).reason).toBe('uri too long');
    });
  });

  describe('buildConfigId', () => {
    it('should be deterministic and differ for different uris', () => {
      expect(buildConfigId('a')).toBe(buildConfigId('a'));
      expect(buildConfigId('a')).not.toBe(buildConfigId('b'));
    });
  });
});
