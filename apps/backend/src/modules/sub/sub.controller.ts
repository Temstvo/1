import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Res,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { SubService } from './sub.service';

@ApiTags('sub')
@Controller()
export class SubController {
  constructor(private readonly subService: SubService) {}

  @Post('sub-links')
  @ApiOperation({ summary: 'Get or create personal subscription link for Telegram user' })
  async createLink(@Body() body: { telegramId: string; username?: string }) {
    if (!body?.telegramId) throw new HttpException('telegramId required', HttpStatus.BAD_REQUEST);
    const link = await this.subService.getOrCreate(String(body.telegramId));
    const base =
      process.env.SUB_LINK_BASE_URL || process.env.BACKEND_URL || 'http://localhost:3000';
    const url = `${base.replace(/\/$/, '')}/sub/${link.token}`;
    return {
      token: link.token,
      url,
      label: link.label,
      expiresAt: link.expiresAt,
      trafficUsed: link.trafficUsed.toString(),
    };
  }

  @Get('sub/free')
  @ApiOperation({ summary: 'Public evergreen subscription (no token, for personal use)' })
  async getFreeSub(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const ua = (req.headers['user-agent'] || '').toLowerCase();
    const accept = (req.headers['accept'] || '').toLowerCase();
    const isBrowser =
      accept.includes('text/html') &&
      !ua.includes('clash') &&
      !ua.includes('happ') &&
      !ua.includes('sing-box') &&
      !ua.includes('v2ray') &&
      !ua.includes('shadowrocket');
    const lines = await this.subService.getActiveConfigLines();
    if (isBrowser) {
      const subUrl = `${(process.env.SUB_LINK_BASE_URL || process.env.BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '')}/sub/free`;
      const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>APPI VPN — FREE</title><link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2242%22 fill=%22%237c3aed%22/><text x=%2250%22 y=%2268%22 font-size=%2248%22 text-anchor=%22middle%22 fill=%22white%22 font-family=%22sans-serif%22 font-weight=%22bold%22>A</text></svg>">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
*{box-sizing:border-box}html,body{height:100%}
body{margin:0;font-family:Inter,system-ui,-apple-system,'Segoe UI',Roboto,Arial;background:#0a0a0a;color:#f5f5f5;min-height:100vh;overflow-x:hidden}
body:before{content:"";position:fixed;inset:0;z-index:-1;background:radial-gradient(800px 420px at 50% -8%,rgba(124,58,237,.28),transparent 60%),radial-gradient(600px 380px at 90% 100%,rgba(124,58,237,.10),transparent 60%)}
a{color:#a78bfa;text-decoration:none}
.wrap{max-width:720px;margin:0 auto;padding:20px 16px 40px}
.nav{display:flex;align-items:center;justify-content:space-between;padding:14px 4px;margin-bottom:14px}
.brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:17px;letter-spacing:.2px}
.brand .mark{width:34px;height:34px;border-radius:12px;background:linear-gradient(135deg,#7c3aed,#a78bfa);display:grid;place-items:center;font-size:19px;font-weight:800;color:#fff;box-shadow:0 6px 20px rgba(124,58,237,.45)}
.status{display:inline-flex;align-items:center;gap:7px;background:rgba(124,58,237,.12);border:1px solid rgba(124,58,237,.45);color:#c4b5fd;border-radius:999px;padding:7px 14px;font-size:13px;font-weight:600}
.status .dot{width:8px;height:8px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px #4ade80;animation:blink 2s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
.hero{background:#141416;border:1px solid rgba(255,255,255,.08);border-radius:24px;padding:28px 24px;text-align:center;margin-bottom:14px;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.hero .tag{display:inline-block;background:rgba(124,58,237,.15);border:1px solid rgba(124,58,237,.4);color:#c4b5fd;border-radius:999px;padding:5px 14px;font-size:12px;font-weight:600;margin-bottom:14px}
.hero h1{margin:0;font-size:30px;font-weight:800;letter-spacing:-.5px}
.hero h1 span{background:linear-gradient(90deg,#a78bfa,#7c3aed);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero p{margin:10px 0 0 0;color:#9ca3af;font-size:14px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}
.stat{background:#141416;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:14px 12px;text-align:center}
.stat .k{font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px}
.stat .v{font-weight:800;font-size:14px;word-break:break-all}
.card{background:#141416;border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:22px;margin-bottom:14px}
.card h2{margin:0 0 6px 0;font-size:17px;font-weight:800}
.card .sub{color:#9ca3af;font-size:13px;margin-bottom:14px}
.urlbox{background:#0a0a0a;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:13px;font-family:ui-monospace,Menlo,monospace;font-size:12px;color:#a78bfa;word-break:break-all;margin:12px 0}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:999px;font-weight:700;cursor:pointer;transition:.15s;border:none;font-size:14px}
.btn-primary{background:#7c3aed;color:#fff;padding:13px 28px;box-shadow:0 8px 24px rgba(124,58,237,.4)}
.btn-primary:hover{background:#8b5cf6;transform:translateY(-1px)}
.btn-ghost{background:transparent;border:1px solid rgba(255,255,255,.15);color:#fff;padding:10px 20px}
.btn-ghost:hover{background:rgba(255,255,255,.06)}
.btn-block{width:100%}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
.chip{padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;border:1px solid rgba(255,255,255,.12);color:#9ca3af;cursor:pointer;background:transparent}
.chip.active{background:#7c3aed;border-color:#7c3aed;color:#fff}
.step{display:flex;gap:14px;padding:14px 0;border-top:1px solid rgba(255,255,255,.06)}
.step:first-of-type{border-top:none}
.step .num{flex:0 0 36px;height:36px;border-radius:12px;background:rgba(124,58,237,.15);border:1px solid rgba(124,58,237,.35);color:#c4b5fd;display:grid;place-items:center;font-weight:800;font-size:14px}
.step .t{font-weight:700;font-size:14px}
.step .d{color:#9ca3af;font-size:13px;margin-top:4px}
.dlbtns{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.footer{text-align:center;color:#6b7280;font-size:12px;margin-top:6px}
.toast{display:none;position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#7c3aed;color:#fff;padding:12px 24px;border-radius:999px;font-weight:600;font-size:14px;box-shadow:0 10px 30px rgba(124,58,237,.5);z-index:99}
@media(max-width:560px){.stats{grid-template-columns:1fr 1fr}.hero h1{font-size:24px}.wrap{padding:14px 12px 32px}}
</style>
</head><body>
<div class="wrap">
  <div class="nav"><div class="brand"><span class="mark">A</span>APPI·VPN</div><span class="status"><span class="dot"></span>Активна ∞</span></div>
  <div class="hero">
    <span class="tag">FREE SUBSCRIPTION · БЕЗ ТОКЕНА</span>
    <h1>Твой VPN <span>готов</span></h1>
    <p>50 живых серверов · пинг до 50 мс · обновление каждый час</p>
  </div>
  <div class="stats">
    <div class="stat"><div class="k">Профиль</div><div class="v">FREE</div></div>
    <div class="stat"><div class="k">Срок</div><div class="v">∞ навсегда</div></div>
    <div class="stat"><div class="k">Трафик</div><div class="v">0 / ∞</div></div>
  </div>
  <div class="card">
    <h2>Подключить за минуту</h2>
    <div class="sub">Скопируй ссылку и вставь в Happ: Профили → + → Из буфера</div>
    <div class="urlbox" id="urlCode">${subUrl}</div>
    <button class="btn btn-primary btn-block" onclick="copyUrl()">Скопировать подписку</button>
  </div>
  <div class="card">
    <h2>Приложение Happ</h2>
    <div class="sub">Выбери платформу и установи</div>
    <div class="chips" id="chips"></div>
    <div class="dlbtns" id="installBtns"></div>
    <div class="step"><div class="num">01</div><div><div class="t">Установи Happ</div><div class="d">Кнопка выше — официальный сайт и сторы</div></div></div>
    <div class="step"><div class="num">02</div><div><div class="t">Добавь подписку</div><div class="d">Профили → + → Из буфера → вставь ссылку</div></div></div>
    <div class="step"><div class="num">03</div><div><div class="t">Подключись</div><div class="d">Нажми большую кнопку в Happ. Не зашло — смени сервер в списке</div></div></div>
  </div>
  <div class="footer">APPI VPN · <a href="https://t.me/AppiVPNBot">Бот @AppiVPNBot</a> · <a href="${subUrl}">Прямая ссылка</a></div>
</div>
<div class="toast" id="toast">Скопировано!</div>
<script>
var subUrl='${subUrl}';
var dl={Windows:[['https://www.happ.su/main','Windows']],macOS:[['https://www.happ.su/main','macOS']],Linux:[['https://www.happ.su/main','Linux']],Android:[['https://play.google.com/store/apps/details?id=com.happproxy','Android']],iOS:[['https://apps.apple.com/us/app/happ-proxy-utility/id6504287215','iOS']]};
function setPlatform(p){var box=document.getElementById('installBtns');box.innerHTML='';var arr=dl[p]||dl['Windows'];for(var i=0;i<arr.length;i++){var a=document.createElement('a');a.className='btn btn-ghost';a.href=arr[i][0];a.target='_blank';a.rel='noopener';a.textContent='Скачать '+arr[i][1];box.appendChild(a);}var chips=document.getElementById('chips').children;for(var j=0;j<chips.length;j++){chips[j].className='chip'+(chips[j].textContent===p?' active':'');}}
function copyUrl(){navigator.clipboard.writeText(subUrl).then(function(){var el=document.getElementById('toast');el.style.display='block';setTimeout(function(){el.style.display='none';},2000);});}
(function(){var box=document.getElementById('chips');Object.keys(dl).forEach(function(p,i){var b=document.createElement('button');b.className='chip'+(i===0?' active':'');b.textContent=p;b.onclick=function(){setPlatform(p);};box.appendChild(b);});setPlatform('Windows');})();
</script>
</body></html>`;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return html;
    }
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Profile-Title', 'APPI VPN FREE');
    res.setHeader('Profile-Update-Interval', '1');
    res.setHeader('Subscription-User-Info', 'upload=0; download=0; total=0; expire=4102444800');
    return lines.join('\n');
  }

  @Get('sub/:token')
  @ApiOperation({ summary: 'Personal subscription (Happ/Clash) or browser HTML like AllCrash' })
  async getSub(
    @Param('token') token: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const link = await this.subService.findByToken(token);
    if (!link) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

    const ua = (req.headers['user-agent'] || '').toLowerCase();
    const accept = (req.headers['accept'] || '').toLowerCase();
    const isBrowser =
      accept.includes('text/html') &&
      !ua.includes('clash') &&
      !ua.includes('happ') &&
      !ua.includes('sing-box') &&
      !ua.includes('v2ray') &&
      !ua.includes('shadowrocket');

    if (isBrowser) {
      // Вечная подписка — показываем «∞» в UI
      const traffic = (Number(link.trafficUsed) / 1024 / 1024 / 1024).toFixed(2);
      const subUrl = `${(process.env.SUB_LINK_BASE_URL || process.env.BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '')}/sub/${link.token}`;
      const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>APPI VPN — ${link.label}</title><link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2242%22 fill=%22%237c3aed%22/><text x=%2250%22 y=%2268%22 font-size=%2248%22 text-anchor=%22middle%22 fill=%22white%22 font-family=%22sans-serif%22 font-weight=%22bold%22>A</text></svg>">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
*{box-sizing:border-box}html,body{height:100%}
body{margin:0;font-family:Inter,system-ui,-apple-system,'Segoe UI',Roboto,Arial;background:#0a0a0a;color:#f5f5f5;min-height:100vh;overflow-x:hidden}
body:before{content:"";position:fixed;inset:0;z-index:-1;background:radial-gradient(800px 420px at 50% -8%,rgba(124,58,237,.28),transparent 60%),radial-gradient(600px 380px at 90% 100%,rgba(124,58,237,.10),transparent 60%)}
a{color:#a78bfa;text-decoration:none}
.wrap{max-width:720px;margin:0 auto;padding:20px 16px 40px}
.nav{display:flex;align-items:center;justify-content:space-between;padding:14px 4px;margin-bottom:14px}
.brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:17px;letter-spacing:.2px}
.brand .mark{width:34px;height:34px;border-radius:12px;background:linear-gradient(135deg,#7c3aed,#a78bfa);display:grid;place-items:center;font-size:19px;font-weight:800;color:#fff;box-shadow:0 6px 20px rgba(124,58,237,.45)}
.status{display:inline-flex;align-items:center;gap:7px;background:rgba(124,58,237,.12);border:1px solid rgba(124,58,237,.45);color:#c4b5fd;border-radius:999px;padding:7px 14px;font-size:13px;font-weight:600}
.status .dot{width:8px;height:8px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px #4ade80;animation:blink 2s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
.hero{background:#141416;border:1px solid rgba(255,255,255,.08);border-radius:24px;padding:28px 24px;text-align:center;margin-bottom:14px;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.hero .tag{display:inline-block;background:rgba(124,58,237,.15);border:1px solid rgba(124,58,237,.4);color:#c4b5fd;border-radius:999px;padding:5px 14px;font-size:12px;font-weight:600;margin-bottom:14px}
.hero h1{margin:0;font-size:30px;font-weight:800;letter-spacing:-.5px}
.hero h1 span{background:linear-gradient(90deg,#a78bfa,#7c3aed);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero p{margin:10px 0 0 0;color:#9ca3af;font-size:14px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}
.stat{background:#141416;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:14px 12px;text-align:center}
.stat .k{font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px}
.stat .v{font-weight:800;font-size:14px;word-break:break-all}
.card{background:#141416;border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:22px;margin-bottom:14px}
.card h2{margin:0 0 6px 0;font-size:17px;font-weight:800}
.card .sub{color:#9ca3af;font-size:13px;margin-bottom:14px}
.urlbox{background:#0a0a0a;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:13px;font-family:ui-monospace,Menlo,monospace;font-size:12px;color:#a78bfa;word-break:break-all;margin:12px 0}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:999px;font-weight:700;cursor:pointer;transition:.15s;border:none;font-size:14px}
.btn-primary{background:#7c3aed;color:#fff;padding:13px 28px;box-shadow:0 8px 24px rgba(124,58,237,.4)}
.btn-primary:hover{background:#8b5cf6;transform:translateY(-1px)}
.btn-ghost{background:transparent;border:1px solid rgba(255,255,255,.15);color:#fff;padding:10px 20px}
.btn-ghost:hover{background:rgba(255,255,255,.06)}
.btn-block{width:100%}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
.chip{padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;border:1px solid rgba(255,255,255,.12);color:#9ca3af;cursor:pointer;background:transparent}
.chip.active{background:#7c3aed;border-color:#7c3aed;color:#fff}
.step{display:flex;gap:14px;padding:14px 0;border-top:1px solid rgba(255,255,255,.06)}
.step:first-of-type{border-top:none}
.step .num{flex:0 0 36px;height:36px;border-radius:12px;background:rgba(124,58,237,.15);border:1px solid rgba(124,58,237,.35);color:#c4b5fd;display:grid;place-items:center;font-weight:800;font-size:14px}
.step .t{font-weight:700;font-size:14px}
.step .d{color:#9ca3af;font-size:13px;margin-top:4px}
.dlbtns{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.footer{text-align:center;color:#6b7280;font-size:12px;margin-top:6px}
.toast{display:none;position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#7c3aed;color:#fff;padding:12px 24px;border-radius:999px;font-weight:600;font-size:14px;box-shadow:0 10px 30px rgba(124,58,237,.5);z-index:99}
@media(max-width:560px){.stats{grid-template-columns:1fr 1fr}.hero h1{font-size:24px}.wrap{padding:14px 12px 32px}}
</style>
</head><body>
<div class="wrap">
  <div class="nav"><div class="brand"><span class="mark">A</span>APPI·VPN</div><span class="status"><span class="dot"></span>Активна ∞</span></div>
  <div class="hero">
    <span class="tag">PERSONAL SUBSCRIPTION · БЕЗ ТОКЕНА</span>
    <h1>Твой VPN <span>готов</span></h1>
    <p>50 живых серверов · пинг до 50 мс · обновление каждый час</p>
  </div>
  <div class="stats">
    <div class="stat"><div class="k">Профиль</div><div class="v">${link.label}</div></div>
    <div class="stat"><div class="k">Срок</div><div class="v">∞ навсегда</div></div>
    <div class="stat"><div class="k">Трафик</div><div class="v">${traffic} / ∞</div></div>
  </div>
  <div class="card">
    <h2>Подключить за минуту</h2>
    <div class="sub">Скопируй ссылку и вставь в Happ: Профили → + → Из буфера</div>
    <div class="urlbox" id="urlCode">${subUrl}</div>
    <button class="btn btn-primary btn-block" onclick="copyUrl()">Скопировать подписку</button>
  </div>
  <div class="card">
    <h2>Приложение Happ</h2>
    <div class="sub">Выбери платформу и установи</div>
    <div class="chips" id="chips"></div>
    <div class="dlbtns" id="installBtns"></div>
    <div class="step"><div class="num">01</div><div><div class="t">Установи Happ</div><div class="d">Кнопка выше — официальный сайт и сторы</div></div></div>
    <div class="step"><div class="num">02</div><div><div class="t">Добавь подписку</div><div class="d">Профили → + → Из буфера → вставь ссылку</div></div></div>
    <div class="step"><div class="num">03</div><div><div class="t">Подключись</div><div class="d">Нажми большую кнопку в Happ. Не зашло — смени сервер в списке</div></div></div>
  </div>
  <div class="footer">APPI VPN · <a href="https://t.me/AppiVPNBot">Бот @AppiVPNBot</a> · <a href="${subUrl}">Прямая ссылка</a></div>
</div>
<div class="toast" id="toast">Скопировано!</div>
<script>
var subUrl='${subUrl}';
var dl={Windows:[['https://www.happ.su/main','Windows']],macOS:[['https://www.happ.su/main','macOS']],Linux:[['https://www.happ.su/main','Linux']],Android:[['https://play.google.com/store/apps/details?id=com.happproxy','Android']],iOS:[['https://apps.apple.com/us/app/happ-proxy-utility/id6504287215','iOS']]};
function setPlatform(p){var box=document.getElementById('installBtns');box.innerHTML='';var arr=dl[p]||dl['Windows'];for(var i=0;i<arr.length;i++){var a=document.createElement('a');a.className='btn btn-ghost';a.href=arr[i][0];a.target='_blank';a.rel='noopener';a.textContent='Скачать '+arr[i][1];box.appendChild(a);}var chips=document.getElementById('chips').children;for(var j=0;j<chips.length;j++){chips[j].className='chip'+(chips[j].textContent===p?' active':'');}}
function copyUrl(){navigator.clipboard.writeText(subUrl).then(function(){var el=document.getElementById('toast');el.style.display='block';setTimeout(function(){el.style.display='none';},2000);});}
(function(){var box=document.getElementById('chips');Object.keys(dl).forEach(function(p,i){var b=document.createElement('button');b.className='chip'+(i===0?' active':'');b.textContent=p;b.onclick=function(){setPlatform(p);};box.appendChild(b);});setPlatform('Windows');})();
</script>
</body></html>`;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return html;
    }

    // VPN-клиент — отдаём plain text с заголовками как у AllCrash
    const lines = await this.subService.getActiveConfigLines();
    // Вечная подписка: клиенту отдаём expire=2099, чтобы Happ не показывал «истекла»
    const traffic = link.trafficUsed.toString();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${link.label}.txt"`);
    res.setHeader('Profile-Title', 'APPI VPN');
    res.setHeader('Profile-Update-Interval', '1');
    res.setHeader(
      'Subscription-User-Info',
      `upload=0; download=${traffic}; total=0; expire=4102444800`,
    );
    res.setHeader('Support-Url', 'https://t.me/AppiVPNBot');
    res.setHeader(
      'Profile-Web-Url',
      `${(process.env.SUB_LINK_BASE_URL || process.env.BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '')}/sub/${link.token}`,
    );
    return lines.join('\n');
  }

  @Get('sub/miku/:token')
  @ApiOperation({ summary: 'Legacy alias to main' })
  async getMikuSub(
    @Param('token') token: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Одна подписка на всё — редиректим на основную, чтобы не плодить две ссылки
    return this.getSub(token, req, res);
  }
}
