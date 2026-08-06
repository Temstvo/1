import Link from 'next/link';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="APPI VPN" className="w-8 h-8" />
            <span className="font-bold text-lg tracking-tight">APPI·VPN</span>
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">← На главную</Link>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-4 md:px-6 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Возврат средств</h1>

        <div className="space-y-8 text-gray-300 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">7 дней без вопросов</h2>
            <p>
              В течение семи дней с момента оплаты вы можете вернуть деньги — без объяснения причин.
              Средства вернутся тем же способом, которым была произведена оплата.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Как запросить возврат</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Напишите в поддержку через Telegram-бота (раздел «Поддержка 24/7»).</li>
              <li>Укажите email или номер заказа, по которому была оплата.</li>
              <li>Ожидайте обработку запроса — обычно 1–2 дня.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Как это работает</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Сначала отменяется автопродление, чтобы не было новых списаний.</li>
              <li>Запрос на возврат уходит специалисту.</li>
              <li>Если одобрят — деньги вернутся на ту же карту за 3–5 рабочих дней (иногда до 10 — зависит от вашего банка).</li>
              <li>Криптовалютные платежи возвращаются тем же активом в той же сети.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Когда возврат невозможен</h2>
            <p>
              Возврат не производится после семи дней с момента оплаты, а также за пробный период
              (3 дня за 10 ₽) после его полного использования.
            </p>
          </section>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <p className="text-sm text-gray-400">
              Не нужно идти в банк или оспаривать платёж — все вопросы решаем мы.
              Поддержка отвечает в течение часа.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-8 px-4 md:px-6 text-center text-xs text-gray-600">
        <span>© 2026 APPI VPN</span>
      </footer>
    </div>
  );
}
