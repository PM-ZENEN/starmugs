import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/impressum")({
  head: () => ({
    meta: [
      { title: "Impressum — Sternbecher" },
      { name: "description", content: "Impressum und gesetzliche Angaben." },
    ],
    links: [{ rel: "canonical", href: "/impressum" }],
  }),
  component: Impressum,
});

function Impressum() {
  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f]">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-black/5">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between text-sm">
          <Link to="/" className="font-medium">★ Sternbecher</Link>
          <Link to="/" className="text-[#06c] hover:underline text-[13px]">‹ Zurück</Link>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl mx-auto px-6 py-24"
      >
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">Impressum</h1>
        <p className="mt-4 text-[#86868b]">Angaben gemäß § 5 TMG</p>

        <section className="mt-12 space-y-2 text-lg">
          <p className="font-medium">Pietro Merico</p>
          <p>Rue de Conflans 3</p>
          <p>78700 Conflans-Sainte-Honorine</p>
          <p>Frankreich</p>
        </section>

        <section className="mt-10 space-y-2 text-lg">
          <p className="font-medium">Kontakt</p>
          <p>E-Mail: pietro.merico@sternbecher.de</p>
        </section>

        <section className="mt-10 space-y-2 text-lg">
          <p className="font-medium">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</p>
          <p>Pietro Merico</p>
        </section>

        <section className="mt-10 text-sm text-[#86868b] leading-relaxed">
          <h2 className="text-base font-medium text-[#1d1d1f]">Haftung für Inhalte</h2>
          <p className="mt-2">
            Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
            Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.
          </p>
        </section>
      </motion.main>

      <footer className="border-t border-black/10 py-8 text-center text-sm text-[#86868b]">
        © 2026 Sternbecher · Pietro Merico
      </footer>
    </div>
  );
}
