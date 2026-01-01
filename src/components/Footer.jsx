/**
 * @fileoverview Footer - Composant footer avec contacts
 * 
 * Footer responsive avec informations de contact,
 * liens utiles et design moderne.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, Phone, MessageCircle, MapPin, 
  ExternalLink, Github, Twitter, Linkedin,
  Heart, ChevronRight
} from 'lucide-react';
import { useAppNavigate } from '../hooks/useAppNavigate';
import { getContactInfo } from '../services/contactService';

const Footer = ({ variant = 'default' }) => {
  const navigate = useAppNavigate();
  const [contact, setContact] = useState(null);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const data = await getContactInfo();
        setContact(data);
      } catch (error) {
        console.error('Erreur chargement contact:', error);
      }
    };
    fetchContact();
  }, []);

  const currentYear = new Date().getFullYear();

  const QUICK_LINKS = [
    { label: 'Estimer un trajet', path: '/estimate' },
    { label: 'Contribuer', path: '/add-trajet' },
    { label: 'Marketplace', path: '/marketplace' },
    { label: 'Tarifs', path: '/pricing' },
    { label: 'Statistiques', path: '/stats' },
  ];

  const SOCIAL_LINKS = [
    { icon: Twitter, label: 'Twitter', url: '#' },
    { icon: Linkedin, label: 'LinkedIn', url: '#' },
    { icon: Github, label: 'GitHub', url: '#' },
  ];

  // Version compacte pour mobile
  if (variant === 'compact') {
    return (
      <footer className="bg-[#141414] text-white px-6 py-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-black tracking-tighter uppercase italic">
            FARE<span className="text-[#f3cd08]">CAL</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Estimateur de tarifs taxi
          </p>
        </div>

        {/* Contact */}
        {contact && (
          <div className="flex justify-center gap-6 mb-6">
            {contact.email && (
              <a 
                href={`mailto:${contact.email}`}
                className="p-3 bg-white/10 rounded-xl hover:bg-[#f3cd08] hover:text-black transition-all"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            )}
            {contact.whatsapp && (
              <a 
                href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/10 rounded-xl hover:bg-[#25D366] transition-all"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            )}
            {contact.telephone && (
              <a 
                href={`tel:${contact.telephone}`}
                className="p-3 bg-white/10 rounded-xl hover:bg-[#f3cd08] hover:text-black transition-all"
                aria-label="Téléphone"
              >
                <Phone className="w-5 h-5" />
              </a>
            )}
          </div>
        )}

        {/* Copyright */}
        <div className="text-center text-xs text-gray-500">
          <p className="flex items-center justify-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500" fill="currentColor" /> in Cameroon
          </p>
          <p className="mt-1">© {currentYear} FareCAL Tous droits réservés.</p>
        </div>
      </footer>
    );
  }

  // Version complète pour desktop
  return (
    <footer className="bg-[#141414] text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-tighter uppercase italic">
                FARE<span className="text-[#f3cd08]">CAL</span>
              </h2>
              <div className="h-1 w-8 bg-[#f3cd08] mt-2 rounded-full" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              La référence pour estimer vos tarifs de taxi au Cameroun. 
              Données communautaires, estimations fiables.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4 text-[#f3cd08]" />
              <span>Yaoundé, Cameroun</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest mb-6">
              Navigation
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <ChevronRight className="w-4 h-4 text-[#f3cd08] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest mb-6">
              Contact
            </h3>
            <div className="space-y-4">
              {contact?.email && (
                <a 
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#f3cd08]" />
                  </div>
                  <span className="text-sm">{contact.email}</span>
                </a>
              )}
              {contact?.whatsapp && (
                <a 
                  href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <span className="text-sm">{contact.whatsapp}</span>
                </a>
              )}
              {contact?.telephone && (
                <a 
                  href={`tel:${contact.telephone}`}
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[#f3cd08]" />
                  </div>
                  <span className="text-sm">{contact.telephone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Newsletter / Social */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest mb-6">
              Suivez-nous
            </h3>
            <div className="flex gap-3 mb-6">
              {SOCIAL_LINKS.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#f3cd08] hover:text-black transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Rejoignez notre communauté et contribuez à améliorer les estimations.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} FareCAL Tous droits réservés.
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500" fill="currentColor" /> in Cameroon
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
