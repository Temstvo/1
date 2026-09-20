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
      const exp = new Date(link.expiresAt);
      const now = new Date();
      const daysLeft = Math.max(
        0,
        Math.ceil((exp.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
      );
      const traffic = (Number(link.trafficUsed) / 1024 / 1024 / 1024).toFixed(2);
      const subUrl = `${(process.env.SUB_LINK_BASE_URL || process.env.BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '')}/sub/${link.token}`;
      const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>APPI VPN — ${link.label}</title><link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛡️</text></svg>">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
*{box-sizing:border-box}html,body{height:100%}body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial;background:#070b14;color:#d6e1ff;min-height:100vh;position:relative;overflow-x:hidden}
body:before{content:"";position:fixed;inset:0;z-index:-1;background:radial-gradient(900px 500px at 50% -10%, rgba(59,130,246,.20), transparent 60%), radial-gradient(700px 400px at 95% 95%, rgba(34,211,238,.12), transparent 60%), linear-gradient(180deg,#070b14,#0a1020)}
a{color:#38bdf8;text-decoration:none}
.wrap{max-width:780px;margin:0 auto;padding:24px 16px}
.hero{position:relative;overflow:hidden;border-radius:20px;padding:22px;border:1px solid rgba(59,130,246,.25);background:linear-gradient(135deg,rgba(17,28,51,.98) 0%, rgba(11,20,40,.98) 55%, rgba(14,42,26,.9) 100%);box-shadow:0 16px 50px rgba(0,0,0,.5);margin-bottom:16px}
.hero:before{content:"";position:absolute;inset:-1px;border-radius:20px;background:linear-gradient(90deg,rgba(59,130,246,.35),rgba(34,211,238,.18),transparent);opacity:.6;z-index:-1}
.hero h1{margin:0;font-size:22px;font-weight:800;letter-spacing:.3px;background:linear-gradient(90deg,#60a5fa,#22d3ee);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero p{margin:8px 0 0 0;color:#93a4c1;font-size:13px}
.header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.logo{color:#60a5fa;font-weight:800;letter-spacing:.4px;display:flex;gap:10px;align-items:center;font-size:15px}
.logo i{width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#3b82ff 0%,#06b6d4 100%);display:inline-block;box-shadow:0 4px 12px rgba(59,130,246,.4)}
.actions{display:flex;gap:10px}
.iconbtn{width:38px;height:38px;border-radius:12px;background:rgba(14,26,46,.9);border:1px solid rgba(30,52,102,.9);display:grid;place-items:center;color:#93a4c1;cursor:pointer;backdrop-filter:blur(8px);transition:.15s}
.iconbtn:hover{border-color:#38bdf8;color:#e6efff;transform:translateY(-1px)}
.card{background:linear-gradient(180deg,rgba(17,28,51,.96),rgba(11,20,40,.98));border:1px solid rgba(27,46,85,.9);border-radius:20px;padding:20px;margin-bottom:16px;box-shadow:0 12px 40px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.04);backdrop-filter:blur(12px)}
.title{font-weight:800;margin:0 0 14px 0;display:flex;align-items:center;gap:10px;font-size:15px;letter-spacing:.2px}
.badge{display:inline-flex;align-items:center;gap:8px;background:rgba(14,42,26,.9);border:1px solid #1a7a3a;color:#4ade80;border-radius:999px;padding:7px 12px;font-size:13px;font-weight:600}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.pill{background:rgba(13,26,51,.9);border:1px solid rgba(30,52,102,.85);border-radius:16px;padding:16px;position:relative;overflow:hidden}
.pill:before{content:"";position:absolute;inset:0;border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.03),transparent);pointer-events:none}
.pill.green{background:linear-gradient(180deg,rgba(14,42,26,.95),rgba(10,30,20,.9));border-color:rgba(26,122,58,.9)}
.pill.red{background:linear-gradient(180deg,rgba(42,18,32,.9),rgba(32,14,24,.9));border-color:rgba(107,26,26,.9)}
.pill.gold{background:linear-gradient(180deg,rgba(42,35,14,.9),rgba(32,26,10,.9));border-color:rgba(107,90,26,.9)}
.pill .k{font-size:11px;letter-spacing:.7px;color:#8aa0c6;text-transform:uppercase;margin-bottom:8px;display:flex;gap:6px;align-items:center;font-weight:600}
.pill .v{font-weight:800;color:#f0f6ff;word-break:break-all;font-size:14px}
.tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
.tab{background:rgba(13,26,51,.9);border:1px solid rgba(30,52,102,.85);border-radius:12px;padding:9px 14px;color:#8aa0c6;cursor:pointer;font-size:13px;font-weight:600;display:flex;gap:8px;align-items:center;transition:.15s}
.tab:hover{border-color:#38bdf8;color:#e6efff}
.tab.active{background:linear-gradient(180deg,rgba(14,42,26,.95),rgba(16,48,30,.9));border-color:#1a7a3a;color:#dcfce7;box-shadow:0 4px 12px rgba(34,197,94,.15)}
.step{display:flex;gap:14px;background:rgba(13,26,51,.85);border:1px solid rgba(30,52,102,.8);border-radius:16px;padding:16px;margin-top:12px;transition:.15s}
.step:hover{border-color:rgba(56,189,248,.4);background:rgba(13,26,51,.95)}
.step .ic{width:40px;height:40px;border-radius:12px;background:linear-gradient(180deg,#0e1a2e,#0a1224);border:1px solid rgba(27,46,85,.9);display:grid;place-items:center;flex:0 0 40px;font-size:18px;box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}
.btn{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(180deg,#0e2a1a,#0c2215);border:1px solid #1a7a3a;color:#bbf7d0;border-radius:12px;padding:9px 14px;font-size:13px;font-weight:600;cursor:pointer;transition:.15s;box-shadow:0 4px 12px rgba(34,197,94,.12)}
.btn:hover{transform:translateY(-1px);border-color:#22c55e;box-shadow:0 6px 16px rgba(34,197,94,.2)}
.btn.primary{background:linear-gradient(180deg,#12301a,#0f2815)}
code.url{word-break:break-all;background:rgba(13,26,51,.9);border:1px solid rgba(30,52,102,.85);padding:12px;border-radius:12px;display:block;margin:12px 0;color:#93c5fd;font-family:ui-monospace, SFMono-Regular, Menlo, monospace;font-size:12px;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}
@media(max-width:640px){.grid{grid-template-columns:1fr} .wrap{padding:20px 12px}}
</style>
</head><body>
<div class="wrap">
  <div class="hero"><h1>APPI VPN & MikuVPN</h1><p>Одна ссылка — 243 сервера. Включая 8 MikuVPN как на скрине. Без оплат и лимитов.</p></div>
  <div class="header"><div class="logo"><i></i> Subscription — ${link.label}</div><div class="actions"><button class="iconbtn" onclick="navigator.clipboard.writeText('${subUrl}')" title="Копировать ссылку">🔗</button><a class="iconbtn" href="https://t.me/AppiVPNBot" title="Чат">💬</a></div></div>

  <div class="card">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><div style="width:28px;height:28px;border-radius:50%;background:#12301a;border:1px solid #1a7a3a;display:grid;place-items:center;color:#5ee17b">✓</div><div><div style="font-weight:800">${link.label}</div><div style="font-size:12px;color:#5ee17b">Истекает через ${daysLeft} дн.</div></div></div>
    <div class="grid">
      <div class="pill"><div class="k">👤 Имя пользователя</div><div class="v">${link.label}</div></div>
      <div class="pill green"><div class="k">✓ Статус</div><div class="v">Активна</div></div>
      <div class="pill red"><div class="k">📅 Истекает</div><div class="v">${exp.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
      <div class="pill gold"><div class="k">⇅ Трафик</div><div class="v">${traffic} GiB / ∞</div></div>
    </div>
  </div>

   <div class="card" id="installCard">
    <div class="title">Установка — Happ
      <span style="margin-left:auto;display:flex;gap:8px">
        <select id="platform" onchange="setPlatform(this.value)" style="background:#0d1a33;border:1px solid #1e3466;color:#cfe0ff;border-radius:10px;padding:6px 10px;font-size:13px">
          <option value="Windows" selected>Windows</option><option value="macOS">macOS</option><option value="Linux">Linux</option><option value="Android">Android</option><option value="iOS">iOS</option>
        </select>
      </span>
    </div>

    <div class="step" id="stepInstall"><div class="ic">⬇️</div><div><div style="font-weight:700">Установка приложения</div><div id="installDesc" style="color:#8aa0c6;font-size:13px;margin:6px 0">Выберите подходящую версию для вашего устройства, нажмите на кнопку ниже и установите приложение.</div><div id="installBtns" style="display:flex;gap:8px;flex-wrap:wrap"></div></div></div>

    <div class="step"><div class="ic">☁️</div><div><div style="font-weight:700">Добавление подписки</div><div style="color:#8aa0c6;font-size:13px;margin:6px 0">Нажмите кнопку ниже, чтобы скопировать ссылку, затем в Happ: Профили → + → Из буфера</div><button class="btn primary" onclick="copyUrl()">＋ Скопировать подписку</button><code class="url" id="urlCode">${subUrl}</code></div></div>

    <div class="step"><div class="ic">⚙️</div><div><div style="font-weight:700">Если подписка не добавилась</div><div style="color:#8aa0c6;font-size:13px">В Happ перейдите в Профили, нажмите +, выберите «Добавить из буфера», вставьте скопированную ссылку и нажмите Добавить.</div></div></div>

    <div class="step"><div class="ic">✓</div><div><div style="font-weight:700">Подключение и использование</div><div style="color:#8aa0c6;font-size:13px">Выберите добавленный профиль, нажмите кнопку подключения. В разделе Прокси можно сменить сервер.</div></div></div>
  </div>

  <div style="text-align:center;color:#6b7a9a;font-size:12px;margin:12px 0">APPI VPN • <a href="https://t.me/AppiVPNBot">Открыть бота @AppiVPNBot</a> • <a href="${subUrl}">Прямая ссылка</a> • <span id="toast" style="display:none;background:#12301a;border:1px solid #1a7a3a;color:#4ade80;padding:6px 10px;border-radius:8px;margin-left:8px">Скопировано!</span></div>
</div>
<script>
const subUrl='${subUrl}';
const dl={
  Windows:[['https://www.happ.su/main','Windows (Установщик)']],
  macOS:[['https://www.happ.su/main','macOS']],
  Linux:[['https://www.happ.su/main','Linux']],
  Android:[['https://play.google.com/store/apps/details?id=com.happproxy','Android (Google Play)']],
  iOS:[['https://apps.apple.com/us/app/happ-proxy-utility/id6504287215','iOS (App Store)']]
};
function setPlatform(p){
  const box=document.getElementById('installBtns'); box.innerHTML='';
  for(const [href,text] of (dl[p]||dl['Windows'])){ const a=document.createElement('a'); a.className='btn'; a.href=href; a.target='_blank'; a.rel='noopener'; a.textContent=text; box.appendChild(a); }
}
function copyUrl(){ navigator.clipboard.writeText(subUrl).then(()=>showToast('Скопировано!')); }
function showToast(t){ const el=document.getElementById('toast'); el.textContent=t; el.style.display='inline-block'; setTimeout(()=>el.style.display='none',2000); }
setPlatform('Windows');
</script>
</body></html>`;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return html;
    }

    // VPN-клиент — отдаём plain text с заголовками как у AllCrash
    const lines = await this.subService.getActiveConfigLines();
    const expireTs = Math.floor(new Date(link.expiresAt).getTime() / 1000);
    const traffic = link.trafficUsed.toString();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${link.label}.txt"`);
    res.setHeader('Profile-Title', 'APPI VPN');
    res.setHeader('Profile-Update-Interval', '1');
    res.setHeader(
      'Subscription-User-Info',
      `upload=0; download=${traffic}; total=0; expire=${expireTs}`,
    );
    res.setHeader('Support-Url', 'https://t.me/AppiVPNBot');
    res.setHeader(
      'Profile-Web-Url',
      `${(process.env.SUB_LINK_BASE_URL || process.env.BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '')}/sub/${link.token}`,
    );
    return lines.join('\n');
  }

  @Get('sub/miku/:token')
  @ApiOperation({ summary: 'MikuVPN — alias to main (одна ссылка на всё)' })
  async getMikuSub(
    @Param('token') token: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Одна подписка на всё — редиректим на основную, чтобы не плодить две ссылки
    return this.getSub(token, req, res);
  }
}
