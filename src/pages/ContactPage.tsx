import { FormEvent, useState } from "react";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

function ContactPage() {
  useDocumentMeta("Contact", "Contacte l'équipe Solimouv’ pour une question sur une séance ou un partenariat.");

  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="space-y-5 pb-3 md:grid md:grid-cols-12 md:gap-8 md:space-y-0">
      <section className="md:col-span-5 md:pt-6">
        <h1 className="text-6xl font-black leading-[0.9] text-[#0f1218] md:text-[74px]">Contact</h1>
        <p className="mt-3 max-w-[340px] text-lg leading-snug text-[#7f828b]">
          Une question sur un événement ou une demande de partenariat ? Écris-nous.
        </p>
      </section>

      <section className="rounded-3xl bg-[#ededf1] p-4 md:col-span-7 md:p-8">
        <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-[#171a20]" htmlFor="name">Nom</label>
          <input id="name" required className="h-12 w-full rounded-2xl border border-[#d2d5dc] bg-white px-4 text-sm" />

          <label className="block text-sm font-semibold text-[#171a20]" htmlFor="email">Email</label>
          <input id="email" type="email" required className="h-12 w-full rounded-2xl border border-[#d2d5dc] bg-white px-4 text-sm" />

          <label className="block text-sm font-semibold text-[#171a20]" htmlFor="message">Message</label>
          <textarea id="message" required rows={5} className="w-full rounded-2xl border border-[#d2d5dc] bg-white px-4 py-3 text-sm" />

          <button type="submit" className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
            Envoyer
          </button>
        </form>

        {submitted ? (
          <p className="mt-3 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">Message bien envoyé.</p>
        ) : null}
      </section>
    </div>
  );
}

export default ContactPage;
