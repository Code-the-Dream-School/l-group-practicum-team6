import Footer from '../components/Footer';
import NavBar from '../components/NavBar';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-void text-text-primary">
      <NavBar />

      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center px-6 py-16">
        <section className="w-full rounded-2xl border border-red-400/30 bg-red-500/10 p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-200">Error 403</p>
          <h1 className="mt-4 text-3xl font-bold">Forbidden</h1>
          <p className="mt-3 text-text-secondary">
            You are logged in, but your account does not have admin access to this page.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
