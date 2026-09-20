import { Header, Footer } from '@/components/site';
import AppWorkspace from '@/components/vpn/app-workspace';
export default function AppPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="appi-shell">
        <AppWorkspace />
      </main>
      <Footer />
    </>
  );
}
