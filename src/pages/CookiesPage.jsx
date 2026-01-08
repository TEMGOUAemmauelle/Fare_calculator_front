import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import { useAppNavigate } from '../hooks/useAppNavigate';

const CookiesPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useAppNavigate();
  const isFr = i18n.language.startsWith('fr');

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#141414] text-[#111827] dark:text-[#E5E7EB] transition-colors duration-300 font-sans">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#f3cd08] transition-colors mb-10 group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          {t('common.back')}
        </button>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {isFr ? <CookiesFr /> : <CookiesEn />}
        </div>
      </div>
    </div>
  );
};

const CookiesEn = () => (
  <div className="space-y-8">
    <header className="border-b border-gray-200 dark:border-gray-800 pb-8 mb-10">
      <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
        Cookies & Ads Notice
      </h1>
      <p className="text-gray-500 dark:text-gray-400">
        Last updated: January 5, 2026
      </p>
    </header>

    <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 mb-8">
      <p className="font-medium">
        <strong>Summary:</strong> FarCal uses cookies and similar technologies (including local storage and SDK identifiers) to operate the Service, remember preferences, measure usage (analytics), improve reliability, and deliver/measure advertising. Where required by law, we ask for your consent for non-essential cookies and for personalized advertising.
      </p>
    </div>

    <section className="space-y-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">1. What this notice covers</h2>
      <p>
        This Cookies & Ads Notice explains how FarCal uses cookies and similar technologies in our web app, mobile experience, and PWA to provide the Service, understand usage, and deliver and measure advertising. This notice should be read together with our Privacy Notice and Terms of Service.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">2. Who we are</h2>
      <p>
        FarCal is provided by Yowyob Inc. Ltd ("Yowyob", "we", "us"). For questions, please contact us via <a href="https://yowyob.com/contact" className="text-[#f3cd08] hover:underline" target="_blank" rel="noopener noreferrer">yowyob.com/contact</a>.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">3. What are cookies and similar technologies?</h2>
      <p>
        Cookies are small text files placed on your device by websites you visit. Similar technologies include local storage, session storage, web beacons/pixels, SDK identifiers, and device identifiers. These technologies help recognize your device, store preferences, keep you signed in (if applicable), and measure performance and advertising effectiveness.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">4. Technologies we may use in FarCal</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Cookies (first-party and, where applicable, third-party).</li>
        <li>Local storage / session storage (including PWA caches and service worker storage).</li>
        <li>Pixels and tags (for example, for analytics or conversion measurement).</li>
        <li>SDK identifiers (for example, in mobile/PWA contexts) for analytics, crash reporting, and advertising measurement.</li>
        <li>Log data (for example IP address, timestamps, device and browser signals) for security and diagnostics.</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">5. Why we use cookies and similar technologies</h2>
      <p>We use these technologies for the following purposes:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Strictly necessary:</strong> to operate FarCal, maintain security, prevent fraud/abuse, and enable essential features.</li>
        <li><strong>Preferences:</strong> to remember your settings (for example language, consent choices, or display options).</li>
        <li><strong>Analytics & performance:</strong> to understand how users interact with FarCal, diagnose issues, and improve features and speed.</li>
        <li><strong>Advertising & measurement:</strong> to show ads from local businesses/partners, limit frequency, detect ad fraud, and measure performance (impressions, clicks, conversions).</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">6. Location signals and advertising</h2>
      <p>
        FarCal may use location-related signals to improve fare estimates and, where permitted, to improve advertising relevance. Location signals can include:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Precise geolocation (GPS) when you explicitly enable location permissions on your device.</li>
        <li>Approximate location inferred from IP address or device settings.</li>
        <li>Route context based on trip inputs (starting area and destination area).</li>
      </ul>
      <p>
        If you do not want FarCal to use precise location, you can disable location permissions in your device settings. Disabling location may reduce estimate accuracy and may limit certain features.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">7. Categories of cookies and examples</h2>
      <p>
        The table below describes typical categories used in FarCal. Actual cookies/identifiers may change over time as we improve the Service.
      </p>
      
      <div className="overflow-x-auto my-6">
        <table className="w-full text-left border-collapse border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-50 dark:bg-white/5">
            <tr>
              <th className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold">Category</th>
              <th className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold">Purpose</th>
              <th className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold">Examples (non-exhaustive)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr>
              <td className="p-4 align-top font-medium">Strictly necessary</td>
              <td className="p-4 align-top">Operate the Service, security, fraud prevention, load balancing, consent framework.</td>
              <td className="p-4 align-top text-sm">Session identifiers; security tokens; consent-state cookie.</td>
            </tr>
            <tr>
              <td className="p-4 align-top font-medium">Preferences</td>
              <td className="p-4 align-top">Remember settings and choices.</td>
              <td className="p-4 align-top text-sm">Language preference; UI preference; consent settings.</td>
            </tr>
            <tr>
              <td className="p-4 align-top font-medium">Analytics & performance</td>
              <td className="p-4 align-top">Understand usage, improve reliability, measure feature adoption.</td>
              <td className="p-4 align-top text-sm">Page view events; error and crash diagnostics; performance metrics.</td>
            </tr>
            <tr>
              <td className="p-4 align-top font-medium">Advertising & measurement</td>
              <td className="p-4 align-top">Deliver ads and measure effectiveness, frequency capping, fraud detection.</td>
              <td className="p-4 align-top text-sm">Ad impression/click identifiers; conversion events; frequency caps.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">8. Third-party advertising and analytics partners</h2>
      <p>
        We may use third-party providers to help us deliver advertising and analytics. These providers may set their own cookies or use similar identifiers. Their processing is subject to their own policies and settings.
      </p>
      <p>
        Where required by law, we will request your consent before enabling non-essential third-party technologies.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">9. Your choices and controls</h2>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">9.1 Cookie consent controls</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Consent banner / preferences: where provided, you can accept, reject, or customize non-essential cookies.</li>
        <li>You can change your choices at any time in FarCal’s privacy or cookie settings (if available).</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">9.2 Browser controls</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Most browsers let you delete or block cookies and manage site data.</li>
        <li>If you block all cookies, some Service features may not work correctly (for example preference retention or session continuity).</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">9.3 Device controls (mobile/PWA)</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>You can reset advertising identifiers or limit ad tracking where your operating system provides such controls.</li>
        <li>You can disable location permissions to prevent use of precise geolocation.</li>
        <li>You can clear site data and cached storage (including PWA caches) from your browser/device settings.</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">9.4 Personalized advertising opt-out</h3>
      <p>
        Where FarCal offers personalized advertising and where permitted by law, you may opt out via in-app ad preferences or via applicable device/platform settings. If you opt out, you may still see ads, but they may be less relevant.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">10. Do Not Track (DNT) and similar signals</h2>
      <p>
        Some browsers offer a “Do Not Track” signal. There is no uniform industry standard for DNT. Where required by law, we honor consent and preference controls provided in FarCal regardless of DNT signals.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">11. Data retention</h2>
      <p>
        Cookie lifetimes vary. Some cookies are session-based and expire when you close your browser. Others persist for a defined period. Advertising and analytics identifiers are retained as needed for measurement, security, and auditability, and in line with our Privacy Notice.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">12. Updates to this notice</h2>
      <p>
        We may update this Cookies & Ads Notice as our technologies and partners evolve. We will post the updated version and update the “Last updated” date. If changes are material, we will provide additional notice where appropriate.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">13. Contact</h2>
      <p>
        For questions about cookies, advertising, or your privacy choices, contact Yowyob Inc. Ltd via <a href="https://yowyob.com/contact" className="text-[#f3cd08] hover:underline" target="_blank" rel="noopener noreferrer">yowyob.com/contact</a>.
      </p>
    </section>
  </div>
);

const CookiesFr = () => (
  <div className="space-y-8">
    <header className="border-b border-gray-200 dark:border-gray-800 pb-8 mb-10">
      <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
        Notice Cookies & Publicité
      </h1>
      <p className="text-gray-500 dark:text-gray-400">
        Dernière mise à jour : 5 janvier 2026
      </p>
    </header>

    <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 mb-8">
      <p className="font-medium">
        <strong>Résumé :</strong> FarCal utilise des cookies et des technologies similaires (y compris le stockage local et les identifiants SDK) pour faire fonctionner le Service, mémoriser vos préférences, mesurer l'utilisation (analytique), améliorer la fiabilité et diffuser/mesurer la publicité. Lorsque la loi l'exige, nous demandons votre consentement pour les cookies non essentiels et pour la publicité personnalisée.
      </p>
    </div>

    <section className="space-y-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">1. Objet de cette notice</h2>
      <p>
        La présente Notice Cookies & Publicité explique comment FarCal utilise des cookies et des technologies similaires (stockage local, pixels, identifiants SDK, etc.) dans notre application web, mobile et PWA pour fournir le Service, comprendre les usages et diffuser/mesurer la publicité. Elle doit être lue conjointement avec notre Avis de confidentialité et nos Conditions d’utilisation.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">2. Qui sommes-nous</h2>
      <p>
        FarCal est fourni par Yowyob Inc. Ltd ("Yowyob", "nous"). Pour toute question, contactez-nous via <a href="https://yowyob.com/contact" className="text-[#f3cd08] hover:underline" target="_blank" rel="noopener noreferrer">yowyob.com/contact</a>.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">3. Que sont les cookies et technologies similaires ?</h2>
      <p>
        Les cookies sont de petits fichiers texte déposés sur votre appareil lors de la visite d’un site. Les technologies similaires comprennent notamment le stockage local, le stockage de session, les pixels/balises, les identifiants SDK et les identifiants d’appareil. Elles permettent de reconnaître votre appareil, mémoriser vos préférences, vous maintenir connecté (le cas échéant), et mesurer les performances et l’efficacité publicitaire.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">4. Technologies pouvant être utilisées par FarCal</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Cookies (provenant de FarCal et, le cas échéant, de partenaires).</li>
        <li>Stockage local / stockage de session (y compris caches PWA et stockage du service worker).</li>
        <li>Pixels et balises (par exemple pour l’analytique ou la mesure de conversion).</li>
        <li>Identifiants SDK (dans les contextes mobile/PWA) pour l’analytique, le reporting de crash et la mesure publicitaire.</li>
        <li>Données de journaux (adresse IP, horodatages, signaux navigateur/appareil) à des fins de sécurité et de diagnostic.</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">5. Pourquoi nous utilisons ces technologies</h2>
      <p>Nous les utilisons notamment pour :</p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Strictement nécessaires :</strong> exploitation de FarCal, sécurité, prévention de la fraude/abus, fonctionnalités essentielles.</li>
        <li><strong>Préférences :</strong> mémoriser vos paramètres (langue, choix de consentement, options d’affichage).</li>
        <li><strong>Analytique & performance :</strong> comprendre l’usage, diagnostiquer les incidents, améliorer les fonctionnalités et la vitesse.</li>
        <li><strong>Publicité & mesure :</strong> afficher des annonces d’entreprises/partenaires locaux, limiter la fréquence, détecter la fraude publicitaire, mesurer la performance (impressions, clics, conversions).</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">6. Signaux de localisation et publicité</h2>
      <p>
        FarCal peut utiliser des signaux liés à la localisation pour améliorer les estimations et, lorsque cela est permis, pour améliorer la pertinence des annonces. Ces signaux peuvent inclure :
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Géolocalisation précise (GPS) si vous activez explicitement l’autorisation de localisation sur votre appareil.</li>
        <li>Localisation approximative déduite de l’adresse IP ou des réglages de l’appareil.</li>
        <li>Contexte d’itinéraire basé sur les paramètres de trajet (zone de départ et d’arrivée).</li>
      </ul>
      <p>
        Si vous ne souhaitez pas l’utilisation de la localisation précise, vous pouvez désactiver la permission dans les réglages de votre appareil. La désactivation peut réduire la précision des estimations et limiter certaines fonctionnalités.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">7. Catégories de cookies et exemples</h2>
      <p>
        Le tableau ci-dessous présente des catégories typiques utilisées dans FarCal. Les cookies/identifiants réels peuvent évoluer.
      </p>
      
      <div className="overflow-x-auto my-6">
        <table className="w-full text-left border-collapse border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-50 dark:bg-white/5">
            <tr>
              <th className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold">Catégorie</th>
              <th className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold">Finalité</th>
              <th className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold">Exemples (non exhaustifs)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr>
              <td className="p-4 align-top font-medium">Strictement nécessaires</td>
              <td className="p-4 align-top">Exploiter le service, sécurité, prévention de fraude, équilibrage de charge, gestion du consentement.</td>
              <td className="p-4 align-top text-sm">Identifiants de session ; jetons de sécurité ; cookie d’état de consentement.</td>
            </tr>
            <tr>
              <td className="p-4 align-top font-medium">Préférences</td>
              <td className="p-4 align-top">Mémoriser vos réglages et choix.</td>
              <td className="p-4 align-top text-sm">Langue ; préférences UI ; choix de consentement.</td>
            </tr>
            <tr>
              <td className="p-4 align-top font-medium">Analytique & performance</td>
              <td className="p-4 align-top">Comprendre l’usage, améliorer la fiabilité, mesurer l’adoption des fonctionnalités.</td>
              <td className="p-4 align-top text-sm">Événements de consultation ; diagnostics ; métriques de performance.</td>
            </tr>
            <tr>
              <td className="p-4 align-top font-medium">Publicité & mesure</td>
              <td className="p-4 align-top">Diffuser des annonces et mesurer l’efficacité, limitation de fréquence, détection de fraude.</td>
              <td className="p-4 align-top text-sm">Identifiants impression/clic ; événements de conversion ; limitation de fréquence.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">8. Partenaires tiers (publicité et analytique)</h2>
      <p>
        Nous pouvons recourir à des prestataires/partenaires tiers pour nous aider à diffuser la publicité et réaliser l’analytique. Ces partenaires peuvent déposer leurs propres cookies ou utiliser des identifiants similaires. Leur traitement est régi par leurs politiques et paramètres.
      </p>
      <p>
        Lorsque requis par la loi, nous demanderons votre consentement avant d’activer des technologies non essentielles de tiers.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">9. Vos choix et contrôles</h2>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">9.1 Contrôles de consentement</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Bannière / préférences : lorsque disponible, vous pouvez accepter, refuser ou personnaliser les cookies non essentiels.</li>
        <li>Vous pouvez modifier vos choix à tout moment via les paramètres de confidentialité/cookies de FarCal (si disponibles).</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">9.2 Réglages du navigateur</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>La plupart des navigateurs permettent de supprimer ou bloquer les cookies et de gérer les données de site.</li>
        <li>Le blocage complet des cookies peut empêcher certaines fonctionnalités (mémorisation des préférences, continuité de session).</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">9.3 Réglages appareil (mobile/PWA)</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Vous pouvez réinitialiser l’identifiant publicitaire ou limiter le suivi publicitaire lorsque votre système le permet.</li>
        <li>Vous pouvez désactiver les permissions de localisation pour empêcher la géolocalisation précise.</li>
        <li>Vous pouvez effacer les données de site et caches (y compris caches PWA) via les réglages du navigateur/appareil.</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">9.4 Refus de la publicité personnalisée</h3>
      <p>
        Lorsque FarCal propose la publicité personnalisée et lorsque cela est permis, vous pouvez la refuser via les préférences publicitaires intégrées ou via les réglages de votre appareil/plateforme. Vous pourrez toujours voir des annonces, mais potentiellement moins pertinentes.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">10. Do Not Track (DNT) et signaux similaires</h2>
      <p>
        Certains navigateurs proposent un signal « Do Not Track ». Il n’existe pas de norme uniforme sur le DNT. Lorsque requis, nous respectons les contrôles de consentement et préférences fournis dans FarCal, indépendamment des signaux DNT.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">11. Durées de conservation</h2>
      <p>
        La durée de vie des cookies varie : certains expirent à la fermeture du navigateur (cookies de session), d’autres persistent pendant une période définie. Les identifiants publicitaires et d’analytique sont conservés selon les besoins de mesure, sécurité et auditabilité, conformément à notre Avis de confidentialité.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">12. Mises à jour</h2>
      <p>
        Nous pouvons mettre à jour cette Notice Cookies & Publicité. Nous publierons la version mise à jour et modifierons la date « Dernière mise à jour ». Si les changements sont importants, nous fournirons un avis complémentaire lorsque cela est approprié.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">13. Contact</h2>
      <p>
        Pour toute question sur les cookies, la publicité ou vos choix de confidentialité, contactez Yowyob Inc. Ltd via <a href="https://yowyob.com/contact" className="text-[#f3cd08] hover:underline" target="_blank" rel="noopener noreferrer">yowyob.com/contact</a>.
      </p>
    </section>
  </div>
);

export default CookiesPage;
