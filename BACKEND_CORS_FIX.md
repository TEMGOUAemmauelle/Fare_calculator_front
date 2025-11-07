# 🔧 CORRECTION REQUISE SUR LE BACKEND DJANGO

## ❌ Problème actuel

Les requêtes échouent avec **401 Unauthorized** à cause des **requêtes CORS OPTIONS (preflight)**.

```
[WARNING] Requête /api/estimate/ sans header Authorization
[WARNING] Unauthorized: /api/estimate/
[WARNING] "OPTIONS /api/estimate/ HTTP/1.1" 401 132
```

## 🔍 Cause racine

Le middleware d'authentification Django intercepte **TOUTES** les requêtes, y compris les **OPTIONS**.

**IMPORTANT** : Les requêtes OPTIONS (CORS preflight) sont envoyées **AVANT** la vraie requête POST/GET et **ne peuvent PAS** contenir de headers Authorization. C'est une limitation du protocole CORS.

## ✅ Solution

Le backend Django doit **autoriser les requêtes OPTIONS sans authentification**.

### Fichier : `core/middleware.py`

```python
class AuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # ✅ AUTORISER LES REQUÊTES OPTIONS SANS AUTH (CORS preflight)
        if request.method == 'OPTIONS':
            return self.get_response(request)
        
        # Vérifier Authorization uniquement pour les autres méthodes
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            logger.warning(f"Requête {request.path} sans header Authorization")
            return JsonResponse(
                {'error': 'Header Authorization manquant'},
                status=401
            )
        
        # Valider le format: "ApiKey <uuid>"
        if not auth_header.startswith('ApiKey '):
            return JsonResponse(
                {'error': 'Format Authorization invalide. Attendu: ApiKey <uuid>'},
                status=401
            )
        
        api_key = auth_header.replace('ApiKey ', '').strip()
        
        # Valider la clé API
        if api_key != settings.API_KEY:
            return JsonResponse(
                {'error': 'Clé API invalide'},
                status=401
            )
        
        return self.get_response(request)
```

### Fichier : `settings.py`

Vérifier aussi la configuration CORS :

```python
# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',  # ✅ Essentiel
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',  # ✅ Essentiel
    'PATCH',
    'POST',
    'PUT',
]
```

## 🧪 Test après correction

1. Redémarrer le serveur Django
2. Dans le frontend, ouvrir la console développeur
3. Faire une estimation
4. Vérifier les logs :

**Console frontend (attendu)** :
```
🔧 [API Config] Initialisation: {
  baseURL: 'http://localhost:8000/api',
  apiKey: '974e9428...7ef8',
  timeout: 30000
}
🔵 [API Request] OPTIONS /estimate/ { Authorization: '✅ ApiKey 974e9428...' }
✅ [API Response] POST /estimate/ { status: 200, data: {...} }
```

**Console backend (attendu)** :
```
[INFO] OPTIONS /api/estimate/ HTTP/1.1 200 0  <-- Pas d'auth requise
[INFO] POST /api/estimate/ HTTP/1.1 200 1234  <-- Auth validée
```

## 📋 Checklist

- [ ] Modifier `core/middleware.py` pour exclure OPTIONS
- [ ] Vérifier `CORS_ALLOW_HEADERS` inclut 'authorization'
- [ ] Vérifier `CORS_ALLOW_METHODS` inclut 'OPTIONS'
- [ ] Redémarrer Django
- [ ] Tester depuis le frontend
- [ ] Vérifier les logs : OPTIONS 200, POST 200

## 🔗 Ressources

- [MDN - CORS Preflight](https://developer.mozilla.org/fr/docs/Web/HTTP/CORS#requ%C3%AAtes_preflight)
- [Django CORS Headers](https://github.com/adamchainz/django-cors-headers)
