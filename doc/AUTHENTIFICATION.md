# Authentification – Frontend (Fare Calculator)

Ce document décrit **en détail** le fonctionnement de l’authentification côté frontend :
- Les **modes disponibles**
- Les **variables d’environnement**
- Le **flow utilisateur**
- La **flexibilité** (mode temporaire)
- La **synchro backend** et la **visibilité dans l’admin**
- Le **stockage local**

---

## 1) Objectif général
L’authentification est **optionnelle** : l’application fonctionne même sans compte. L’objectif est :
- d’offrir une expérience personnalisée,
- de permettre l’accès aux fonctionnalités avancées,
- tout en gardant la simplicité et la compatibilité avec le budget (Firebase SMS peut être payant).

---

## 2) Modes d’authentification
Le frontend gère **deux modes** selon l’état de la facturation Firebase :

### ✅ Mode principal : SMS + Google (billing activé)
Quand `VITE_FIREBASE_BILLING_ENABLED=true` :
- **Téléphone + SMS (OTP)**
- **Google OAuth** en option

Ce mode est le **mode idéal** (complet), mais nécessite un plan Firebase payant pour l’envoi de SMS.

### ✅ Mode temporaire : Google uniquement (billing désactivé)
Quand `VITE_FIREBASE_BILLING_ENABLED=false` :
- **Uniquement Google OAuth**

Ce mode est **temporaire** et sert de fallback **gratuit** tant que la facturation SMS n’est pas activée. Il permet :
- d’éviter les erreurs `auth/operation-not-allowed`,
- de conserver une expérience stable,
- d’avoir une authentification fonctionnelle immédiatement.

---

## 3) Pourquoi c’est flexible
Cette architecture permet :
- de **basculer instantanément** entre SMS+Google et Google-only sans changer le code,
- d’activer **progressivement** le SMS quand le budget est prêt,
- d’éviter les échecs d’auth quand le SMS n’est pas disponible,
- de garder une logique unique côté backend (Firebase ID Token).

---

## 4) Variables d’environnement (Frontend)
À définir dans `frontend/.env` :

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Active/désactive la facturation SMS
VITE_FIREBASE_BILLING_ENABLED=true
```

> `VITE_FIREBASE_BILLING_ENABLED` contrôle le mode (SMS+Google ou Google-only).

---

## 5) Flow utilisateur (frontend)
### 5.1 Ouverture du modal
- Le modal s’affiche **à la première utilisation** si l’utilisateur n’est pas connecté.
- Ensuite, s’il ignore, il ne se re‑montre que **1 fois sur 10**.
- L’utilisateur peut toujours cliquer sur “Se connecter” manuellement.

### 5.2 Le modal
- **Sur mobile** : rendu “bottom sheet”.
- **Sur desktop** : rendu dédié (layout desktop). 

### 5.3 Bouton “Ignorer la connexion”
Le modal inclut un bouton **« Continuer sans connexion »** afin de ne jamais bloquer l’accès à l’app.

---

## 6) Stockage local
Le frontend conserve des infos de session dans `localStorage` :

- `fare_calculator_user` : infos Firebase (uid, email, displayName, photoURL)
- `fare_calculator_backend_user` : profil synchronisé côté backend
- `fare_calculator_phone` : numéro si dispo
- `fare_calculator_auth_method` : `phone_sms` ou `google`
- `fare_calculator_auth_prompt_count` : nombre de refus du modal

---

## 7) Synchronisation backend
Après login Firebase, le frontend envoie le token à :

```
POST /api/auth/verify-token/
```

Le backend :
- vérifie le token Firebase,
- crée ou récupère l’utilisateur `MobileUser`,
- renvoie le profil à stocker côté frontend.

---

## 8) Où voir les utilisateurs
### ✅ Dans l’admin Django
Les utilisateurs sont visibles dans l’admin sous **MobileUser**.
L’affichage est optimisé :
- email si disponible
- sinon nom
- sinon téléphone

Champs visibles :
- `email`, `display_name`, `phone_number`, `auth_method`
- `created_at`, `last_login`

---

## 9) Résumé rapide
| Cas | Mode | Actif quand | Avantages |
|-----|------|------------|-----------|
| SMS + Google | complet | billing=true | expérience idéale + OTP |
| Google Only | fallback | billing=false | gratuit et stable |

---

## 10) Points clés
- **Mode temporaire** = uniquement Google, car SMS payant.
- **Flexible** = un seul switch d’ENV.
- **Non bloquant** = auth facultative.
- **Compatible backend** = Firebase ID Token unique.

---

Si tu veux, je peux aussi ajouter :
- un diagramme de flow,
- une section “FAQ auth”,
- un schéma sécurité/token.
