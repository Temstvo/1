export default function Loading() {
  return (
    <main className="workspace" aria-busy="true" aria-label="Загрузка страницы">
      <p className="eyebrow" role="status">
        Открываем ваше пространство…
      </p>
      <div className="dashboard-grid">
        <div className="card skeleton" />
        <div className="card skeleton" />
      </div>
    </main>
  );
}
