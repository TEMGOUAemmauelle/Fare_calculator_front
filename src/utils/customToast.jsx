import React from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, AlertCircle, Info, X, Loader2, MapPin } from 'lucide-react';

const Toast = ({ t, type, message, icon, visible, id }) => {
  let Icon = Info;
  let bgColor = 'bg-white';
  let borderColor = 'border-gray-100';
  let iconColor = 'text-blue-500';
  let iconBg = 'bg-blue-50';

  switch (type) {
    case 'success':
      Icon = CheckCircle2;
      iconColor = 'text-green-500';
      iconBg = 'bg-green-50';
      break;
    case 'error':
      Icon = AlertCircle;
      iconColor = 'text-red-500';
      iconBg = 'bg-red-50';
      break;
    case 'loading':
      Icon = Loader2;
      iconColor = 'text-yellow-600';
      iconBg = 'bg-yellow-50';
      break;
    case 'info':
    default:
      Icon = Info;
      iconColor = 'text-black';
      iconBg = 'bg-gray-100';
      break;
  }

  // Override icon if provided directly
  if (icon === '📍') {
    Icon = MapPin;
    iconColor = 'text-[#f3cd08]'; // Taxi yellow
    iconBg = 'bg-[#f3cd08]/10';
  } else if (icon === '🔒') {
    iconColor = 'text-red-500';
    iconBg = 'bg-red-50';
  }

  return (
    <div
      className={`
        ${visible ? 'animate-enter' : 'animate-leave'}
        max-w-md w-full bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-2xl pointer-events-auto flex ring-1 ring-black/5
        transform transition-all duration-300 ease-out translate-y-2 border border-white/20
      `}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="shrink-0 pt-0.5">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${iconBg}`}>
               {type === 'loading' ? (
                 <Icon className={`h-6 w-6 ${iconColor} animate-spin`} />
               ) : (
                 <Icon className={`h-6 w-6 ${iconColor}`} />
               )}
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-bold text-gray-900 leading-snug">
              {message}
            </p>
            {type === 'loading' && (
              <p className="mt-1 text-xs text-gray-500">
                Veuillez patienter...
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex border-l border-black/5">
        <button
          onClick={() => toast.dismiss(id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export const showToast = {
  success: (message) => toast.custom((t) => <Toast type="success" message={message} visible={t.visible} id={t.id} />, { duration: 3000 }),
  error: (message) => toast.custom((t) => <Toast type="error" message={message} visible={t.visible} id={t.id} />, { duration: 3000 }),
  loading: (message) => toast.custom((t) => <Toast type="loading" message={message} visible={t.visible} id={t.id} />, { duration: Infinity }),
  info: (message, icon) => toast.custom((t) => <Toast type="info" message={message} icon={icon} visible={t.visible} id={t.id} />, { duration: 3000 }),
  dismiss: (id) => toast.dismiss(id),
};

export default showToast;
