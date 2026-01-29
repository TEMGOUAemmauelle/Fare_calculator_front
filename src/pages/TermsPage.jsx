import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import { useAppNavigate } from '../hooks/useAppNavigate';

const TermsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useAppNavigate();
  const isFr = i18n.language.startsWith('fr');

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#141414] text-[#111827] dark:text-[#E5E7EB] transition-colors duration-300 font-sans">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#f39908] transition-colors mb-10 group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          {t('common.back')}
        </button>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {isFr ? <TermsFr /> : <TermsEn />}
        </div>
      </div>
    </div>
  );
};

const TermsEn = () => (
  <div className="space-y-8">
    <header className="border-b border-gray-200 dark:border-gray-800 pb-8 mb-10">
      <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
        General Terms of Service
      </h1>
      <p className="text-gray-500 dark:text-gray-400">
        Last updated: January 5, 2026
      </p>
    </header>

    <section className="space-y-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
      <p>
        These General Terms of Service (the “Terms”) govern your access to and use of FarCal, including any associated websites, APIs, features, and content (collectively, the “Service”). By accessing or using the Service, you agree to these Terms.
      </p>
      
      <div className="p-6 bg-[#f39908]/10 border border-[#f39908]/20 rounded-2xl">
        <p className="font-semibold text-[#B49200] dark:text-[#f39908]">
          If you do not agree to these Terms, do not use the Service.
        </p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">1. About these Terms</h2>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">1.1 What these Terms do</h3>
      <p>These Terms:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>define the relationship between you and Yowyob when you use FarCal;</li>
        <li>set out what you can expect from us and what we expect from you;</li>
        <li>describe how content, data, and intellectual property are handled; and</li>
        <li>explain what happens in case of problems or disagreements.</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">1.2 Additional terms and policies</h3>
      <p>
        Some features may be subject to additional terms, guidelines, or policies (“Additional Terms”), such as API or developer terms (if any), advertiser/business onboarding terms, promotions or beta features terms. If Additional Terms conflict with these Terms, the Additional Terms will govern for that feature.
      </p>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">1.3 Changes to the Service or Terms</h3>
      <p>
        We may modify the Service or these Terms to reflect changes in law, security requirements, or the evolution of features and business models. When changes materially affect your rights or obligations, we will provide reasonable notice (for example, within the Service, by email if you have an account, or by posting an updated “Last updated” date).
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">2. Age and eligibility</h2>
      <p>
        You must be able to form a legally binding contract in your jurisdiction to use the Service. If you are under the age required to do so, you may only use the Service with permission and supervision of a parent or legal guardian, who is responsible for your use.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">3. Your relationship with FarCal</h2>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">3.1 What FarCal provides</h3>
      <p>
        FarCal provides fare estimates for travel based on inputs and signals such as distance, route assumptions, vehicle type/category, time-of-day/night conditions, and (where available) weather and traffic signals. <strong>Important: FarCal provides informational estimates only.</strong>
      </p>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">3.2 Informal market context; negotiation and “passe”</h3>
      <p>
        You acknowledge that in many informal transport contexts (including Cameroon and parts of Sub-Saharan Africa), transport pricing may be negotiated (bargaining), may not be displayed, and may be proposed by the client (“passe”). FarCal does not set, impose, or enforce fares. Any final price and agreement remain solely between the parties to the transport transaction.
      </p>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">3.3 FarCal is not a transport operator</h3>
      <p>
        FarCal does not provide transportation services and is not a carrier, broker, or agent for drivers or operators. FarCal does not guarantee vehicle availability, driver conduct, or passenger outcomes.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">4. Using the Service</h2>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">4.1 License to use the Service</h3>
      <p>
        Subject to these Terms, we grant you a personal, non-exclusive, non-transferable, revocable license to access and use the Service for lawful purposes.
      </p>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">4.2 Your responsibilities</h3>
      <p>
        You agree to provide accurate information where required, use the Service lawfully and responsibly, maintain the confidentiality of any credentials (if accounts are enabled), and ensure your device and network access are secure.
      </p>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">4.3 Prohibited conduct (no misuse)</h3>
      <p>
        You must not misuse the Service. For example, you must not interfere with or disrupt the Service, attempt unauthorized access to systems or data, scrape or harvest data at scale without written permission, reverse engineer the Service except as permitted by law, transmit malware or spam, or misrepresent identity, location, or trip inputs to manipulate outcomes. We may suspend or terminate access for violations.
      </p>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">4.4 Safety and lawful use</h3>
      <p>
        Do not use the Service in ways that are unsafe (for example, while driving) and comply with applicable road safety laws and regulations.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">5. Mobile data and connectivity</h2>
      <p>
        Your mobile operator may charge you for data usage (including background data). You are responsible for all data costs, roaming fees, and connectivity charges.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">6. Location data and device permissions</h2>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">6.1 Location permissions</h3>
      <p>
        Some features require location access (precise or approximate) to estimate distance, detect context, or improve reliability. If you enable geolocation, you consent to the collection and processing of location data in accordance with these Terms and the applicable Privacy Notice. You can disable location permissions in your device settings, but some functionality may become unavailable or less accurate.
      </p>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">6.2 Accuracy limitations</h3>
      <p>
        Location and route estimates may be inaccurate due to GPS drift, network conditions, device constraints, mapping errors, or third-party data limitations. You are responsible for verifying critical information.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">7. Advertising and data-driven business model</h2>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">7.1 Free service funded by advertising and data use</h3>
      <p>
        FarCal may be offered free of charge and funded by advertisements from local businesses and partners, and by analytics and insights derived from Service usage (including aggregated/statistical outputs).
      </p>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">7.2 Ads personalization and measurement</h3>
      <p>
        We may show contextual ads and, where permitted by law and your preferences, personalized ads. We may measure ad performance (for example, impressions, clicks, and conversions) and share reports with advertisers. Reports are typically aggregated and do not identify you directly unless you have expressly consented or the law permits.
      </p>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">7.3 Third-party ad/analytics partners</h3>
      <p>
        We may use third-party tools and SDKs for advertising, analytics, crash reporting, and performance monitoring. These partners may use cookies or similar technologies subject to their own policies. Where required, we will request consent via a consent banner or settings.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">8. Privacy and data protection</h2>
      <p>
        Our handling of personal data (including location data) is described in a separate Privacy Notice (published within the Service). These Terms incorporate that Privacy Notice by reference.
      </p>
      <p>
        In general, FarCal may collect and process: device and technical data (device model, OS, identifiers, IP address), usage data (trip inputs, feature interactions), approximate or precise location (with your permission), contextual signals, and ad interaction data.
      </p>
      <p>
        We use this data to provide and improve the Service, maintain security and prevent fraud, develop new features, provide reporting and measurement for ads, and comply with legal obligations.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">9. Content in the Service</h2>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">9.1 Our content</h3>
      <p>
        The Service, including its design, logos, text, software, and other content, is owned by or licensed to Yowyob and is protected by intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of the Service unless you have our written permission.
      </p>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">9.2 Your content (if you submit any)</h3>
      <p>
        If you submit content (for example, feedback, suggestions, bug reports, or business listings), you grant Yowyob a worldwide, non-exclusive, royalty-free license to use, host, store, reproduce, modify (for formatting), create derivative works (for compatibility), communicate, and display that content solely to operate, improve, and promote the Service. You represent that you have the necessary rights to provide such content.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">10. Software and updates</h2>
      <p>
        The Service may automatically update to improve performance, security, and features. You agree to receive such updates. Some features may depend on installing PWA components or enabling browser capabilities.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">11. Third-party services and links</h2>
      <p>
        FarCal may rely on third-party data sources (for example, maps, weather, traffic). Those third parties may have their own terms and policies. We are not responsible for third-party services, their content, availability, or accuracy.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">12. Disclaimers (important)</h2>
      <p>
        To the fullest extent permitted by law, the Service is provided “as is” and “as available.” FarCal estimates are not guarantees, not legally binding offers, and may differ from real-world outcomes. We do not warrant uninterrupted operation, perfect accuracy, or fitness for a particular purpose. You assume all risk arising from reliance on estimates, including negotiation outcomes in informal contexts.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">13. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, Yowyob will not be liable for indirect, incidental, special, consequential, or punitive damages; loss of profits, revenue, business opportunities, goodwill, or data; disputes between users and transport providers; or inaccuracies from third-party data sources.
      </p>
      <p>
        If liability cannot be excluded, Yowyob’s total liability for any claim relating to the Service will be limited to the greater of (a) the amount you paid to use the Service in the 12 months preceding the claim (if any) or (b) the minimal statutory amount required by applicable law.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">14. Indemnity</h2>
      <p>
        If permitted by applicable law, you agree to indemnify and hold harmless Yowyob from claims, liabilities, damages, losses, and expenses arising from your misuse of the Service, violation of these Terms, or infringement of others’ rights.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">15. Suspension and termination</h2>
      <p>
        We may suspend or terminate your access if you violate these Terms, your use creates risk or legal exposure for us or others, or we are required to do so by law. You may stop using the Service at any time. If accounts are enabled, account deletion options may be provided in the Service.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">16. In case of problems or disagreements</h2>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">16.1 Informal resolution first</h3>
      <p>
        Before filing a formal claim, you agree to contact us to seek informal resolution.
      </p>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">16.2 Governing law and jurisdiction</h3>
      <p>
        Unless mandatory consumer protection rules provide otherwise, these Terms are governed by the laws applicable in the Republic of Cameroon, and disputes will be subject to the competent courts.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">17. Contact information</h2>
      <p>
        Support and inquiries: please use the contact page at <a href="https://yowyob.com/contact" className="text-[#f39908] hover:underline" target="_blank" rel="noopener noreferrer">yowyob.com/contact</a>.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">18. Miscellaneous</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Severability:</strong> If any provision is unenforceable, the rest remains in effect.</li>
        <li><strong>No waiver:</strong> Failure to enforce a provision is not a waiver.</li>
        <li><strong>Assignment:</strong> You may not assign these Terms without our consent; we may assign as part of a merger, acquisition, or asset transfer.</li>
        <li><strong>Entire agreement:</strong> These Terms and any Additional Terms constitute the entire agreement regarding the Service.</li>
      </ul>
    </section>
  </div>
);

const TermsFr = () => (
  <div className="space-y-8">
    <header className="border-b border-gray-200 dark:border-gray-800 pb-8 mb-10">
      <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
        Conditions Générales d'Utilisation
      </h1>
      <p className="text-gray-500 dark:text-gray-400">
        Dernière mise à jour : 5 janvier 2026
      </p>
    </header>

    <section className="space-y-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
      <p>
        Les présentes Conditions Générales d’Utilisation (les « Conditions ») régissent votre accès et votre utilisation de FarCal, y compris les sites web associés, APIs, fonctionnalités et contenus (collectivement, le « Service »). En accédant au Service ou en l’utilisant, vous acceptez les présentes Conditions.
      </p>
      
      <div className="p-6 bg-[#f39908]/10 border border-[#f39908]/20 rounded-2xl">
        <p className="font-semibold text-[#B49200] dark:text-[#f39908]">
          Si vous n’acceptez pas ces Conditions, n’utilisez pas le Service.
        </p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">1. À propos de ces Conditions</h2>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">1.1 Objet des Conditions</h3>
      <p>Ces Conditions :</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>définissent la relation entre vous et Yowyob lors de l’utilisation de FarCal ;</li>
        <li>précisent ce que vous pouvez attendre de nous et ce que nous attendons de vous ;</li>
        <li>décrivent la gestion des contenus, des données et de la propriété intellectuelle ; et</li>
        <li>expliquent ce qui se passe en cas de problèmes ou de désaccords.</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">1.2 Conditions et politiques additionnelles</h3>
      <p>
        Certaines fonctionnalités peuvent être soumises à des conditions, lignes directrices ou politiques additionnelles (« Conditions additionnelles »), par exemple des conditions API/développeur (le cas échéant), des conditions d’adhésion pour annonceurs/entreprises, ou des conditions de promotions et fonctionnalités bêta. En cas de conflit, les Conditions additionnelles prévalent pour la fonctionnalité concernée.
      </p>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">1.3 Modifications du Service ou des Conditions</h3>
      <p>
        Nous pouvons modifier le Service ou ces Conditions pour tenir compte des évolutions légales, des exigences de sécurité, ou de l’évolution des fonctionnalités et du modèle économique. Lorsque des changements affectent substantiellement vos droits ou obligations, nous fournirons un préavis raisonnable (par exemple dans le Service, par email si vous disposez d’un compte, ou en mettant à jour la date « Dernière mise à jour »).
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">2. Âge et éligibilité</h2>
      <p>
        Vous devez être en mesure de conclure un contrat juridiquement contraignant dans votre juridiction pour utiliser le Service. Si vous n’avez pas l’âge requis, vous ne pouvez utiliser le Service qu’avec l’autorisation et sous la supervision d’un parent ou tuteur légal, qui demeure responsable de votre utilisation.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">3. Votre relation avec FarCal</h2>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">3.1 Ce que fournit FarCal</h3>
      <p>
        FarCal fournit des estimations tarifaires de trajet sur la base d’entrées et de signaux tels que la distance, des hypothèses d’itinéraire, le type/catégorie de véhicule, les conditions jour/nuit, et (lorsqu’ils sont disponibles) des signaux météo et circulation. <strong>Important : FarCal fournit uniquement des estimations à titre informatif.</strong>
      </p>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">3.2 Contexte informel ; négociation et « passe »</h3>
      <p>
        Vous reconnaissez que, dans de nombreux contextes de transport informel (y compris au Cameroun et dans certaines régions d’Afrique subsaharienne), le prix du transport peut être négocié (marchandage), peut ne pas être affiché, et peut être proposé par le client (« passe »). FarCal ne fixe pas, n’impose pas et n’exécute pas les tarifs. Le prix final et l’accord restent exclusivement entre les parties à la transaction de transport.
      </p>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">3.3 FarCal n’est pas un opérateur de transport</h3>
      <p>
        FarCal ne fournit pas de services de transport et n’est ni transporteur, ni courtier, ni agent de chauffeurs ou d’opérateurs. FarCal ne garantit pas la disponibilité des véhicules, le comportement des chauffeurs, ni les résultats pour les passagers.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">4. Utilisation du Service</h2>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">4.1 Licence d’utilisation</h3>
      <p>
        Sous réserve du respect des présentes Conditions, nous vous accordons une licence personnelle, non exclusive, non transférable et révocable pour accéder au Service et l’utiliser à des fins licites.
      </p>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">4.2 Vos responsabilités</h3>
      <p>
        Vous vous engagez à fournir des informations exactes lorsque nécessaire, à utiliser le Service de manière licite et responsable, à préserver la confidentialité de vos identifiants (si des comptes sont activés), et à sécuriser votre appareil et votre accès réseau.
      </p>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">4.3 Conduites interdites (pas d’usage abusif)</h3>
      <p>
        Vous ne devez pas utiliser le Service de manière abusive. Par exemple, vous ne devez pas perturber le Service, tenter un accès non autorisé à des systèmes ou données, extraire des données à grande échelle sans autorisation écrite, désassembler ou tenter d’extraire le code source sauf dans la mesure permise par la loi, transmettre des logiciels malveillants ou du spam, ni falsifier votre identité, localisation ou paramètres de trajet pour manipuler les résultats. Nous pouvons suspendre ou résilier l’accès en cas de violation.
      </p>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">4.4 Sécurité et respect des lois</h3>
      <p>
        N’utilisez pas le Service d’une manière dangereuse (par exemple au volant) et respectez les lois et règles applicables en matière de sécurité routière.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">5. Données mobiles et connectivité</h2>
      <p>
        Votre opérateur mobile peut vous facturer l’utilisation de données (y compris en arrière-plan). Vous êtes responsable de tous les coûts de données, frais d’itinérance et frais de connectivité.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">6. Données de localisation et autorisations de l’appareil</h2>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">6.1 Autorisations de localisation</h3>
      <p>
        Certaines fonctionnalités nécessitent l’accès à la localisation (précise ou approximative) afin d’estimer la distance, détecter le contexte ou améliorer la fiabilité. Si vous activez la géolocalisation, vous consentez à la collecte et au traitement des données de localisation conformément aux présentes Conditions et à la Notice de confidentialité applicable. Vous pouvez désactiver la localisation dans les paramètres de votre appareil, mais certaines fonctionnalités peuvent devenir indisponibles ou moins précises.
      </p>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">6.2 Limites de précision</h3>
      <p>
        Les estimations de localisation et d’itinéraire peuvent être inexactes en raison de dérives GPS, conditions réseau, contraintes de l’appareil, erreurs cartographiques ou limitations des données tierces. Vous êtes responsable de vérifier les informations critiques.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">7. Publicité et modèle économique fondé sur les données</h2>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">7.1 Service gratuit financé par la publicité et l’usage des données</h3>
      <p>
        FarCal peut être proposé gratuitement et financé par la publicité d’entreprises locales et partenaires, ainsi que par des analyses et indicateurs dérivés de l’usage du Service (y compris des résultats agrégés/statistiques).
      </p>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">7.2 Personnalisation et mesure des annonces</h3>
      <p>
        Nous pouvons afficher des annonces contextuelles et, lorsque la loi et vos préférences le permettent, des annonces personnalisées. Nous pouvons mesurer la performance publicitaire (par exemple impressions, clics, conversions) et partager des rapports avec les annonceurs. Ces rapports sont généralement agrégés et ne vous identifient pas directement, sauf consentement explicite ou autorisation légale.
      </p>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">7.3 Partenaires publicitaires/analytics tiers</h3>
      <p>
        Nous pouvons utiliser des outils et SDK tiers pour la publicité, l’analyse, le suivi de stabilité et la performance. Ces partenaires peuvent utiliser des cookies ou technologies similaires selon leurs politiques. Lorsque requis, nous demanderons votre consentement via une bannière ou des paramètres.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">8. Vie privée et protection des données</h2>
      <p>
        Le traitement des données à caractère personnel (y compris la localisation) est décrit dans une Notice de confidentialité distincte (publiée dans le Service). Les présentes Conditions intègrent cette Notice par référence.
      </p>
      <p>
        À titre général, FarCal peut collecter et traiter : des données techniques (modèle d’appareil, OS, identifiants, adresse IP), des données d’usage (entrées de trajet, interactions), une localisation approximative ou précise (avec votre permission), des signaux contextuels, et des données d’interaction publicitaire.
      </p>
      <p>
        Nous utilisons ces données pour fournir et améliorer le Service, assurer la sécurité et prévenir la fraude, développer de nouvelles fonctionnalités, produire des rapports et mesures publicitaires, et respecter nos obligations légales.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">9. Contenu dans le Service</h2>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">9.1 Notre contenu</h3>
      <p>
        Le Service, y compris son design, logos, textes, logiciels et autres contenus, est la propriété de Yowyob ou concédé sous licence à Yowyob et est protégé par les lois sur la propriété intellectuelle. Vous ne pouvez pas copier, modifier, distribuer, vendre ou louer tout ou partie du Service sans autorisation écrite.
      </p>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">9.2 Votre contenu (si vous en soumettez)</h3>
      <p>
        Si vous soumettez du contenu (par exemple retours, suggestions, signalements de bugs, fiches d’entreprises), vous accordez à Yowyob une licence mondiale, non exclusive et gratuite pour utiliser, héberger, stocker, reproduire, modifier (mise en forme), créer des œuvres dérivées (compatibilité), communiquer et afficher ce contenu uniquement afin d’exploiter, améliorer et promouvoir le Service. Vous déclarez disposer des droits nécessaires pour fournir ce contenu.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">10. Logiciel et mises à jour</h2>
      <p>
        Le Service peut se mettre à jour automatiquement afin d’améliorer les performances, la sécurité et les fonctionnalités. Vous acceptez de recevoir ces mises à jour. Certaines fonctionnalités peuvent dépendre de l’installation de composants PWA ou de capacités du navigateur.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">11. Services et liens tiers</h2>
      <p>
        FarCal peut dépendre de sources de données tierces (par exemple cartographie, météo, trafic). Ces tiers peuvent avoir leurs propres conditions et politiques. Nous ne sommes pas responsables des services tiers, de leur contenu, disponibilité ou exactitude.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">12. Exclusions de garantie (important)</h2>
      <p>
        Dans la limite permise par la loi, le Service est fourni « en l’état » et « selon disponibilité ». Les estimations FarCal ne constituent pas des garanties, ni des offres juridiquement contraignantes, et peuvent différer des résultats réels. Nous ne garantissons pas une disponibilité continue, une exactitude parfaite ou une adéquation à un besoin particulier. Vous assumez les risques liés à l’utilisation des estimations, y compris les résultats des négociations en contexte informel.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">13. Limitation de responsabilité</h2>
      <p>
        Dans la limite permise par la loi, Yowyob ne saurait être tenue responsable des dommages indirects, accessoires, spéciaux, consécutifs ou punitifs ; des pertes de profits, revenus, opportunités, réputation ou données ; des litiges entre utilisateurs et prestataires de transport ; ou des inexactitudes provenant de données tierces.
      </p>
      <p>
        Si la responsabilité ne peut être exclue, la responsabilité totale de Yowyob pour toute réclamation liée au Service sera limitée au montant le plus élevé entre (a) les sommes éventuellement payées par vous pour le Service au cours des 12 mois précédant la réclamation, ou (b) le montant minimal prévu par la loi applicable.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">14. Indemnisation</h2>
      <p>
        Lorsque la loi l’autorise, vous acceptez d’indemniser et de tenir Yowyob indemne de toute réclamation, responsabilité, dommage, perte et dépense résultant de votre usage abusif du Service, de la violation des présentes Conditions, ou de l’atteinte aux droits d’autrui.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">15. Suspension et résiliation</h2>
      <p>
        Nous pouvons suspendre ou résilier votre accès si vous violez ces Conditions, si votre utilisation crée un risque ou une exposition juridique pour nous ou pour autrui, ou si la loi l’exige. Vous pouvez cesser d’utiliser le Service à tout moment. Si des comptes sont activés, des options de suppression de compte peuvent être proposées dans le Service.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">16. En cas de problèmes ou de désaccords</h2>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">16.1 Tentative de résolution amiable</h3>
      <p>
        Avant toute action formelle, vous acceptez de nous contacter afin de rechercher une résolution amiable.
      </p>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">16.2 Droit applicable et juridiction compétente</h3>
      <p>
        Sauf dispositions impératives de protection du consommateur, les présentes Conditions sont régies par les lois applicables en République du Cameroun, et les litiges relèvent des juridictions compétentes.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">17. Coordonnées de contact</h2>
      <p>
        Assistance et demandes : veuillez utiliser la page de contact <a href="https://yowyob.com/contact" className="text-[#f39908] hover:underline" target="_blank" rel="noopener noreferrer">yowyob.com/contact</a>.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">18. Dispositions diverses</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Divisibilité :</strong> si une disposition est inapplicable, le reste demeure en vigueur.</li>
        <li><strong>Absence de renonciation :</strong> le fait de ne pas appliquer une disposition ne constitue pas une renonciation.</li>
        <li><strong>Cession :</strong> vous ne pouvez pas céder ces Conditions sans notre accord ; nous pouvons céder dans le cadre d’une fusion, acquisition ou transfert d’actifs.</li>
        <li><strong>Intégralité :</strong> ces Conditions et les Conditions additionnelles constituent l’intégralité de l’accord relatif au Service.</li>
      </ul>
    </section>
  </div>
);

export default TermsPage;
