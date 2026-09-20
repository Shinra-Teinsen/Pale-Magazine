import React, { useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';

interface ContactPageProps {
  showToast: (msg: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ showToast }) => {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Message envoyé avec succès ! Nous vous répondrons rapidement.');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      
      <div className="text-center space-y-3">
        <h1 className="font-editorial text-4xl font-black text-neutral-950 dark:text-white">Contactez la rédaction</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Une question, une suggestion ou une proposition d'article ? Écrivez-nous.</p>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-8 rounded-3xl text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-200">Message bien reçu !</h3>
          <p className="text-xs text-emerald-700 dark:text-emerald-300">Merci de votre intérêt pour PALE. Notre équipe prendra contact avec vous dans les plus brefs délais.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Votre e-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Votre message</label>
            <textarea
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Exprimez-vous ici..."
              className="w-full p-4 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl resize-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <span>Envoyer le message</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}

    </div>
  );
};
