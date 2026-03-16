# REACT-IPSSI-TASKS

Petite application démo React + Symfony pour gérer des tasks (exercice pédagogique).

## Structure
- `react/` : frontend React (Vite) — pages : Accueil, Inscription, Tasks, Nouvelle tâche.
- `api/api_demo_ipssi/` : backend Symfony (API) — endpoints pour `register`, `login`, `tasks`.

## Démarrage (front)
1. Ouvrir un terminal à la racine `react/`:

```bash
cd react
npm install
npm run dev
```

2. Le front tourne normalement sur `http://localhost:5173` (ou port Vite par défaut).

## Démarrage (API Symfony)
Dans un autre terminal, depuis `api/api_demo_ipssi/` :

Option A — avec le binaire Symfony CLI (recommandé si installé) :

```bash
cd api/api_demo_ipssi
composer install
symfony serve -d
```

Option B — via Docker/Compose si tu utilises `compose.yaml`:

```bash
cd api/api_demo_ipssi
docker compose up -d
```

L'API écoute par défaut sur `http://localhost:8000` (vérifier la sortie de `symfony serve` ou Compose).

> Remarque : le projet attend l'API sur `http://localhost:8000` dans le code front. Ajuste les URL si nécessaire.

## Variables d'environnement
- Vérifie le fichier `.env` dans `api/api_demo_ipssi/` pour les réglages (base de données, JWT, etc.).

## Tests
- Le backend contient une configuration PHPUnit (`phpunit.dist.xml`). Lancer depuis `api/api_demo_ipssi/` :

```bash
cd api/api_demo_ipssi
./bin/phpunit
```

## Notes rapides
- L'authentification utilise JWT. Le contexte React (`JwtContext`) stocke le token en mémoire (pas de stockage persistant par défaut).
- Après connexion, l'accueil affiche un message indiquant que l'utilisateur est connecté; la déconnexion se fait depuis l'accueil.
