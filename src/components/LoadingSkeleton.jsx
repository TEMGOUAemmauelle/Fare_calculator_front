/**
 * @fileoverview Composant LoadingSkeleton - Placeholders chargement
 * 
 * Utilise react-loading-skeleton pour afficher placeholders pendant chargements.
 * 
 * Props:
 * - count: Nombre de lignes (défaut: 1)
 * - height: Hauteur lignes (défaut: 20px)
 * - width: Largeur (défaut: "100%")
 * - circle: Forme circulaire (pour avatars)
 * - className: Classes CSS additionnelles
 */

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function LoadingSkeleton({
  count = 1,
  height = 20,
  width = '100%',
  circle = false,
  className = '',
}) {
  return (
    <div className={`loading-skeleton ${className}`}>
      <Skeleton
        count={count}
        height={height}
        width={width}
        circle={circle}
        baseColor="#e5e7eb"
        highlightColor="#f3f4f6"
      />
    </div>
  );
}

// Composant pré-configuré pour liste trajets
export function TrajetListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-4">
            <LoadingSkeleton circle width={40} height={40} />
            <div className="flex-1">
              <LoadingSkeleton height={16} width="60%" />
              <LoadingSkeleton height={14} width="40%" className="mt-2" />
            </div>
            <LoadingSkeleton height={24} width={80} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Composant pré-configuré pour carte prix
export function PriceCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <LoadingSkeleton height={24} width="50%" />
      <LoadingSkeleton height={48} width="80%" className="mt-4" />
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <LoadingSkeleton height={14} width="40%" />
          <LoadingSkeleton height={20} width="60%" className="mt-2" />
        </div>
        <div>
          <LoadingSkeleton height={14} width="40%" />
          <LoadingSkeleton height={20} width="60%" className="mt-2" />
        </div>
      </div>
      <LoadingSkeleton height={100} className="mt-6" />
    </div>
  );
}
