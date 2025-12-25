
/**
 * @fileoverview HomePage - Version Ultra-Polished
 * 
 * - Gestion explicite de la géolocalisation au chargement
 * - Splash screen informatif
 * - Fallback élégant si refusé
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '../hooks/useAppNavigate';
import { Search, MapPin, BarChart2, Globe, PlusCircle, ArrowRight } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import SplashScreen from '../components/SplashScreen';
import ServiceAds from '../components/ServiceAds';
import geolocationService from '../services/geolocationService';
import { reverseSearch } from '../services/nominatimService';

const HERO_IMAGE = "https://media.istockphoto.com/id/519870714/fr/photo/en-taxi.jpg?s=612x612&w=0&k=20&c=r4tdiKcJZMDfpuOCJlVZQNFYegp2YNnVCTGn-tM4rOE=";

const POPULAR_DESTINATIONS = [
  { id: 1, name: "Aéroport de Nsimalen", address: "Centre, Mefou-et-Afamba", time: "35 min", coords: [11.5533, 3.7225] },
  { id: 2, name: "Playce Carrefour", address: "Warda, Yaoundé", time: "15 min", coords: [11.5135, 3.8660] },
  { id: 3, name: "Carrefour Bastos", address: "Nkol Eton, Yaoundé", time: "1 hr", coords: [11.5130, 3.8930] }
];

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [splashStatus, setSplashStatus] = useState('loading');
  const [splashMessage, setSplashMessage] = useState("Démarrage...");
  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState("Localisation...");

  const initGeolocation = async () => {
    setSplashStatus('loading');
    setSplashMessage(t('home.locating'));
    try {
        const pos = await geolocationService.getCurrentPosition();
        setUserLocation(pos);
        if (pos) {
            setSplashMessage(t('home.addr_calc'));
            const addr = await reverseSearch(pos.coords.latitude, pos.coords.longitude);
            setUserAddress(addr);
        } else {
            setUserAddress("Yaoundé, Cameroun");
        }
        setShowSplash(false);
    } catch (e) {
        console.warn("Geolocation failure on HomePage", e);
        setSplashStatus('error');
        setSplashMessage(t('home.geoloc_needed'));
    }
  };

  useEffect(() => {
    initGeolocation();
  }, []);

  const handleStartSearch = (dest = null) => {
    navigate('/estimate', { 
      state: { 
        focusDestination: !dest,
        prefilledStart: userLocation ? { 
            label: userAddress,
            coords: [userLocation.coords.longitude, userLocation.coords.latitude]
        } : null,
        targetDestination: dest 
      } 
    });
  };

  return (
    <>
      <SplashScreen 
        isVisible={showSplash} 
        status={splashStatus} 
        message={splashMessage} 
        onRetry={initGeolocation}
        onSkip={() => setShowSplash(false)}
      />

      <style>
        {`
          @keyframes blink {
            50% { opacity: 0; }
          }
          .cursor-blink {
            animation: blink 1s step-end infinite;
          }
        `}
      </style>

      <div className="min-h-screen bg-white text-[#141414] font-sans antialiased">
        <header className="px-6 pt-12 pb-6 flex items-center justify-between">
           <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter uppercase leading-none italic">
                FARE<span className="text-[#f3cd08]">CALC</span>
              </h1>
              <div className="h-1 w-8 bg-[#f3cd08] mt-1 rounded-full" />
           </div>
           
           <div className="flex items-center gap-3">
              <button onClick={() => navigate('/stats')} className="p-2.5 bg-gray-50 rounded-2xl text-gray-400 hover:text-[#f3cd08] transition-colors"><BarChart2 className="w-5 h-5" /></button>
              <button onClick={() => navigate('/trajets')} className="p-2.5 bg-gray-50 rounded-2xl text-gray-400 hover:text-[#f3cd08] transition-colors"><Globe className="w-5 h-5" /></button>
              <div className="bg-gray-50 rounded-2xl">
                 <LanguageSwitcher variant="dark" /> 
              </div>
           </div>
        </header>

        <main className="px-6 space-y-8 pb-32">
            <div className="relative w-full h-44 rounded-4xl overflow-hidden group">
                <img src={HERO_IMAGE} className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" alt="Taxi" />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-black text-white leading-tight italic uppercase tracking-tighter"
                    >
                        {t('home.hero_title_1')} <span className="text-[#f3cd08]">{t('home.hero_title_2')}</span><br/>{t('home.hero_title_3')}
                    </motion.h2>
                </div>
            </div>

            <div className="relative">
                 <div 
                    onClick={() => handleStartSearch()}
                    className="relative group cursor-pointer bg-white"
                 >
                    <div className="absolute left-0 bottom-6 text-[#141414]">
                        <div className="w-3 h-3 bg-black rounded-sm mb-1" />
                        <div className="w-0.5 h-10 bg-gray-100 ml-[5px]" />
                        <div className="w-3 h-3 bg-[#f3cd08] rounded-sm mt-1 ring-4 ring-yellow-50" />
                    </div>

                    <div className="pl-10 space-y-8">
                        <div className="border-b border-gray-100 pb-3">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">{t('home.current_position_label')}</span>
                            <span className="text-sm font-bold text-gray-800 truncate block">
                                {userAddress}
                            </span>
                        </div>
                        
                        <div className="flex items-center justify-between border-b-2 border-[#141414] pb-3 transition-colors">
                            <div className="flex items-center gap-1">
                                <div className="w-0.5 h-6 bg-[#f3cd08] cursor-blink" />
                                <span className="text-xl font-bold text-[#141414] opacity-40">{t('estimate.start_search')}</span>
                            </div>
                            <ArrowRight className="w-5 h-5 text-[#f3cd08]" />
                        </div>
                    </div>
                 </div>
            </div>

            <div className="space-y-4 pt-2">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t('home.shortcuts')}</h3>
                <div className="flex flex-col gap-0 border-t border-gray-50">
                  {POPULAR_DESTINATIONS.map((dest) => (
                    <button 
                      key={dest.id}
                      onClick={() => handleStartSearch(dest)}
                      className="flex items-center gap-4 py-5 border-b border-gray-50 hover:bg-gray-50 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-[#f3cd08] group-hover:text-black transition-all">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-bold text-gray-900 truncate tracking-tight">{dest.name}</span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase truncate tracking-tight">{dest.address}</span>
                      </div>
                      <div className="text-[10px] font-bold text-gray-300 pr-2">{dest.time}</div>
                    </button>
                  ))}
                </div>
            </div>

            <ServiceAds />
        </main>

        <div className="fixed bottom-8 right-6 z-40">
          <button 
            onClick={() => navigate('/add-trajet')}
            className="flex items-center gap-3 px-6 py-4 bg-[#141414] text-white rounded-4xl font-bold text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all outline outline-white"
          >
            <PlusCircle className="w-4 h-4 text-[#f3cd08]" />
            <span>{t('home.cta_contribute')}</span>
          </button>
        </div>
      </div>
    </>
  );
}