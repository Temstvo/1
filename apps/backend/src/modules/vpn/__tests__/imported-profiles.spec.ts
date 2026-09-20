import { parseImportedDocument, loadImportedProfiles } from '../imported-profiles';
import { ImportedProfilesService } from '../imported-profiles.service';
import { ConfigService } from '@nestjs/config';
import { mkdtemp, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
const uuid = '12345678-1234-1234-1234-123456789abc';
const flat = {
  name: 'Test UK',
  country: 'United Kingdom',
  host: 'vpn.example.test',
  port: 443,
  uuid,
  type: 'xhttp',
  security: 'tls',
  sni: 'example.test',
  path: '/tunnel',
  mode: 'stream-up',
  alpn: 'h2,http/1.1',
  fingerprint: 'firefox',
};
describe('Imported operator profiles', () => {
  it('converts flat profiles without losing TLS and xHTTP options; metadata has no credentials', () => {
    const result = parseImportedDocument(flat, 'test')[0];
    expect(result.summary).toMatchObject({
      countryCode: 'GB',
      nodeCount: 1,
      transports: ['xhttp'],
      security: ['tls'],
    });
    expect(JSON.stringify(result.summary)).not.toContain(uuid);
    expect(JSON.stringify(result.summary)).not.toContain(flat.host);
    const outbound = result.document.outbounds[0];
    expect(outbound.settings.vnext[0].users[0].id).toBe(uuid);
    expect(outbound.streamSettings.xhttpSettings).toEqual({ path: '/tunnel', mode: 'stream-up' });
    expect(outbound.streamSettings.tlsSettings).toMatchObject({
      serverName: 'example.test',
      fingerprint: 'firefox',
      alpn: ['h2', 'http/1.1'],
      allowInsecure: false,
    });
  });
  it('preserves composite routing and proxy topology while restricting local listeners', () => {
    const doc = parseImportedDocument(flat, 'test')[0].document;
    doc.inbounds[0].listen = '0.0.0.0';
    doc.routing = {
      balancers: [{ tag: 'balance', selector: ['proxy'] }],
      rules: [{ type: 'field', balancerTag: 'balance', network: 'tcp,udp' }],
    };
    doc.dns = { servers: ['1.1.1.1'] };
    const result = parseImportedDocument(doc, 'test')[0];
    expect(result.document.routing).toEqual(doc.routing);
    expect(result.document.dns).toEqual(doc.dns);
    expect(result.document.outbounds).toEqual(doc.outbounds);
    expect(result.document.inbounds[0].listen).toBe('127.0.0.1');
    expect(doc.inbounds[0].listen).toBe('0.0.0.0');
  });
  it('rejects insecure or incomplete profiles instead of claiming they are usable', () => {
    expect(() => parseImportedDocument({ ...flat, uuid: 'invalid' }, 'test')).toThrow();
    expect(() => parseImportedDocument({ ...flat, security: 'none' }, 'test')).toThrow();
    const doc = parseImportedDocument(flat, 'test')[0].document;
    doc.outbounds[0].streamSettings.tlsSettings.allowInsecure = true;
    expect(() => parseImportedDocument(doc, 'test')).toThrow();
  });
  it('deduplicates repeated files and rejects malformed JSON without logging secrets', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'appi-profiles-'));
    try {
      await writeFile(join(dir, 'one.json'), JSON.stringify(flat));
      await writeFile(join(dir, 'two.json'), JSON.stringify({ ...flat, name: 'Different label' }));
      await writeFile(join(dir, 'invalid.json'), '{' + uuid);
      const data = await loadImportedProfiles(dir);
      expect(data.profiles.size).toBe(1);
      expect(data.duplicates).toBe(1);
      expect(data.rejected).toHaveLength(1);
      expect(JSON.stringify(data.rejected)).not.toContain(uuid);
      const config = new ConfigService({ SERV_CONFIGS_DIR: dir });
      const service = new ImportedProfilesService(config);
      await service.onModuleInit();
      expect(service.list().downloadEnabled).toBe(false);
      const id = service.list().profiles[0].id;
      expect(() => service.download(id)).toThrow('отключён');
      config.set('ENABLE_IMPORTED_VPN_ACCESS', 'true');
      expect(service.download(id).config.outbounds[0].settings.vnext[0].users[0].id).toBe(uuid);
      expect(() => service.download('../../private')).toThrow();
    } finally {
      if (!dir.startsWith(join(tmpdir(), 'appi-profiles-')))
        throw new Error('Unexpected cleanup path');
      await rm(dir, { recursive: true, force: true });
    }
  });
});
