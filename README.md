# Fare Calculator - Frontend PWA

# -> Fare Calculator Frontend

Application web PWA moderne pour l'estimation de prix de taxi au Cameroun (focus Yaoundé).

## -> Fonctionnalités

- -> **Carte interactive** Mapbox avec itinéraires animés
- -> **Système POI** avec suggestions intelligentes
- -> **Estimation prix** avec 3 méthodes (exact, similaire, inconnu)
- -> **Ajustements météo** et tranches horaires
- -> **Bottom sheet** draggable mobile-first
- -> **Historique anonyme** dans localStorage
- -> **Design moderne** avec Framer Motion
- -> **Mode sombre** (à venir)
- -> **Fonctionnement offline** PWA

## -> Technologies

- **React 19** + **Vite 7** - Framework moderne ultra-rapide
- **Tailwind CSS 4** - Styling utility-first
- **Mapbox GL JS** - Cartes interactives
- **Framer Motion** - Animations fluides
- **Lucide React** - Icônes professionnelles
- **React Router DOM** - Navigation
- **Axios** - API calls
- **Lottie React** - Animations JSON

## -> Vue d'ensemble

Cette application React/Vite permet aux utilisateurs de :
- **Estimer le prix** d'un trajet taxi entre deux points (POI connus)
- **Ajouter des trajets réels** après un ride pour enrichir la base de données communautaire
- **Visualiser l'itinéraire** sur une carte interactive (Mapbox GL JS)
- **Consulter l'historique** et les statistiques des trajets

### Technologies utilisées

- **Frontend** : React 19, Vite 7
- **Styling** : Tailwind CSS 4.1 (utility-first, responsive)
- **Cartes** : Mapbox GL JS (routing, geocoding, isochrones)
- **Animations** : Lottie React (lotties pour engagement UX)
- **API HTTP** : Axios (avec intercepteurs auth/errors)
- **Notifications** : React Hot Toast
- **Routing** : React Router DOM
- **Géolocalisation** : Navigator Geolocation API + Nominatim fallback
- **Météo** : Open-Meteo API (gratuit)
- **Géographie** : Turf.js (calculs géospatiaux)
- **PWA** : Vite Plugin PWA (service worker, offline)

---

## -> Installation et Configuration

### Prérequis

- **Node.js** : v18+ recommandé
- **npm** ou **yarn**
- **Clés API** :
  - Django backend (VITE_API_KEY)
  - Mapbox (VITE_MAPBOX_TOKEN) - gratuit jusqu'à 100k requêtes/mois

### Installation

```bash
# Installer dépendances
npm install

# Copier .env.example → .env et configurer clés
cp .env.example .env
# Éditer .env avec vos clés API

# Lancer en développement
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

### Variables d'environnement (.env)

Créer un fichier `.env` à la racine avec :

```env
# API Backend Django
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_KEY=<votre-cle-api-uuid>

# Mapbox (carte, routing, geocoding)
VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91cl91c2VybmFtZSIsImEiOiJjbHh4eHh4eHh4In0.xxxx

# Nominatim (fallback geocoding - optionnel)
VITE_NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org

# Open-Meteo (météo gratuite)
VITE_OPENMETEO_BASE_URL=https://api.open-meteo.com/v1

# Autres configs
VITE_ENABLE_GEOLOCATION=true
VITE_CACHE_TTL=3600000
VITE_API_TIMEOUT=30000
```

**Obtenir les clés** :
- **API Backend** : Via interface Django Admin (`/admin/` → créer clé API)
- **Mapbox** : https://account.mapbox.com/ (compte gratuit)

---

## -> Structure du projet

```
fare_calculator_front_end/
src/
│   App.css
│   App.jsx
│   index.css
│   main.jsx
│
├───assets
│   ├───images
│   │       taxi-logo.png
│   │
│   └───lotties
│           Car driving on road.json
│           Making Money.json
│           Man waiting car.json
│           yellow taxi.json
│
├───components
│       Button.jsx
│       ConfirmationModal.jsx
│       ErrorMessage.jsx
│       FormInput.jsx
│       index.js
│       LoadingSkeleton.jsx
│       LottieAnimation.jsx
│       MapView.jsx
│       PriceCard.jsx
│       PWAInstallPrompt.jsx
│       SearchBar.jsx
│
├───config
│       api.js
│       constants.js
│       index.js
│
├───hooks
│       useMediaQuery.js
│
├───models
│       types.js
│
├───pages
│       AddTrajetPage.jsx
│       EstimatePageDesktop.jsx
│       EstimatePageMobile.jsx
│       EstimatePageRouter.jsx
│       HomePage.jsx
│
├───services
│       estimateService.js
│       geolocationService.js
│       index.js
│       localStorageService.js
│       mapboxService.js
│       nominatimService.js
│       pointService.js
│       pwaService.js
│       trajetService.js
│       weatherService.js
│
└───styles
        theme.js
├── doc/
│   ├── DESCRIPTION DU PROJET.MD
│   ├── APPORT DE MAPBOX.MD
│   ├── DETAILS SUR MAPBOX.MD
│   └── API_DOC.md
├── .env.example
├── package.json
├── vite.config.js
└── README.md
```

---

## -> Services (Couche API)

Tous les appels API sont centralisés dans `src/services/` :

1. **estimateService.js** : 
   - `estimatePrice(data)` : POST /estimate/ (estimation principale)
   - `getEstimateHistory()` : Récupère historique localStorage

2. **trajetService.js** :
   - `addTrajet(data)` : POST /trajets/ (ajouter trajet)
   - `getTrajets(params)` : GET /trajets/ (liste paginée)
   - `getTrajetStats()` : GET /trajets/stats/ (statistiques)

3. **pointService.js** :
   - `getPoints(params)` : GET /points/ (liste POI)
   - `searchPoints(query)` : Recherche textuelle POI

4. **geolocationService.js** :
   - `getCurrentPosition()` : Position GPS actuelle
   - `reverseGeocode(lat, lon)` : Coords → POI nommé (via Nominatim)

5. **mapboxService.js** :
   - `searchSuggestions(query)` : Auto-complétion POI
   - `getDirections(coords)` : Calcul itinéraire avec trafic
   - `getIsochrone(center, contours)` : Zones temporelles

6. **weatherService.js** :
   - `getCurrentWeather(lat, lon)` : Météo actuelle Open-Meteo

---

## -> API Backend Django REST Framework

### Endpoints principaux

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/estimate/` | POST | Estimation prix trajet |
| `/api/trajets/` | POST | Ajouter trajet réel |
| `/api/trajets/` | GET | Liste trajets (paginée, filtres) |
| `/api/trajets/stats/` | GET | Statistiques globales |
| `/api/points/` | GET | Liste POI |
| `/api/health/` | GET | Health check (public) |

### Authentification

Header requis :
```http
Authorization: ApiKey <uuid>
```

---

## -> Scripts NPM

```bash
# Développement (hot reload)
npm run dev

# Build production (minifié, optimisé)
npm run build

# Preview build (serveur statique)
npm run preview

# Lint ESLint
npm run lint
```

---

## -> Documentation complète
- **API Backend** : `doc/API_DOC.md` (endpoints, modèles, exemples)

