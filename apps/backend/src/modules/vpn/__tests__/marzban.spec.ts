import { ConfigService } from '@nestjs/config';
import { MarzbanService, validateLinks } from '../marzban.service';
const link =
  'vless://12345678-1234-1234-1234-123456789abc@vpn.example.test:443?security=reality&sni=example.test&pbk=' +
  'A'.repeat(43) +
  '&sid=abcd&type=tcp&encryption=none';
describe('Marzban adapter contract', () => {
  afterEach(() => jest.restoreAllMocks());
  it('rejects fabricated/incomplete and insecure configurations', () => {
    expect(validateLinks([link])).toEqual([link]);
    for (const invalid of [
      link.replace('reality', 'none'),
      link + '&allowInsecure=1',
      link.replace('pbk=', 'bad='),
      'vless://fake@localhost:443',
    ])
      expect(() => validateLinks([invalid])).toThrow();
  });
  it('creates a missing account with a finite expiry and disables it explicitly', async () => {
    const responses = [
      { access_token: 'test-token' },
      null,
      {
        username: 'appi_contract',
        status: 'active',
        expire: 2000000000,
        data_limit: 1000000,
        links: [link],
        subscription_url: '/sub/contract',
      },
      { status: 'active' },
      { status: 'disabled' },
    ];
    const fetcher = jest.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      const data = responses.shift();
      return new Response(JSON.stringify(data), { status: data === null ? 404 : 200 });
    });
    const service = new MarzbanService(
      new ConfigService({
        MARZBAN_URL: 'https://vpn.example.test',
        MARZBAN_USERNAME: 'test',
        MARZBAN_PASSWORD: 'test',
        MARZBAN_INBOUND_TAG: 'reality',
      }),
    );
    const access = {
      username: 'appi_contract',
      expiresAt: new Date(2000000000000),
      trafficLimit: 1000000n,
    } as any;
    expect((await service.sync(access, true))?.links).toEqual([link]);
    const create = fetcher.mock.calls[2];
    expect(create[0]).toBe('https://vpn.example.test/api/user');
    expect(JSON.parse(create[1]?.body as string)).toMatchObject({
      username: 'appi_contract',
      expire: 2000000000,
      data_limit: 1000000,
      status: 'active',
    });
    expect(await service.sync(access, false)).toBeNull();
    expect(JSON.parse(fetcher.mock.calls[4][1]?.body as string)).toEqual({ status: 'disabled' });
  });
});
