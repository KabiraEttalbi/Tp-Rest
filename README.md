# TP REST API

## Description

Ce projet est une API REST développée avec Node.js et Express, implémentant un système d'authentification par token et une limitation du nombre de requêtes par utilisateur. L'API permet également de gérer une collection de livres avec des opérations CRUD (Create, Read, Update, Delete).

## Technologies utilisées

- **Node.js** : Environnement d'exécution JavaScript côté serveur
- **Express** : Framework web pour Node.js
- **UUID** : Génération d'identifiants uniques
- **dotenv** : Gestion des variables d'environnement

## Installation et démarrage

1. Cloner le dépôt :
```plaintext
git clone https://github.com/KabiraEttalbi/Tp-Rest
cd tprest
```

2. Installer les dépendances :
```plaintext
npm install
```

3. Créer un fichier `.env` à la racine du projet :
```code
PORT=3000
```

4. Démarrer le serveur :
```plaintext
npm start
```


Le serveur sera accessible à l'adresse `http://localhost:3000`.

## Fonctionnalités implémentées

### Système d'authentification

L'API utilise un système d'authentification basé sur des tokens UUID. Chaque utilisateur reçoit un token unique lors de l'enregistrement via l'endpoint `/register`. Ce token doit être inclus dans l'en-tête `Authorization` pour accéder aux ressources protégées.

### Limitation de requêtes

Un système de quota de requêtes a été implémenté. Chaque utilisateur dispose initialement de 10 requêtes. À chaque appel à une ressource protégée, le nombre de requêtes disponibles diminue. Lorsque le quota est épuisé, l'utilisateur ne peut plus accéder aux ressources jusqu'à ce qu'il recharge son compte.

### Système de recharge

L'API offre la possibilité de recharger le quota de requêtes via l'endpoint `/recharge`. L'utilisateur peut spécifier le nombre de requêtes à ajouter à son quota.

### Gestion des ressources (CRUD)

L'API permet de gérer une collection de livres avec les opérations CRUD classiques :
- `GET /items` : Récupérer tous les livres
- `POST /items` : Ajouter un nouveau livre
- `PUT /items/:id` : Mettre à jour un livre existant
- `DELETE /items/:id` : Supprimer un livre

Toutes ces opérations sont protégées par le middleware d'authentification et soumises à la limitation de requêtes.

## Documentation des endpoints

### Authentification

#### Enregistrement d'un nouvel utilisateur
\`\`\`
POST /register
\`\`\`

**Réponse :**
```json
{
"token": "uuid-token",
"requestsNumber": 10,
"message": "Enregistrement réussi. Vous avez 10 requêtes."
}
```

**Notes :**

- Chaque adresse IP ne peut s'enregistrer qu'une seule fois si elle a encore des requêtes disponibles
- Retourne un token qui doit être utilisé pour toutes les requêtes authentifiées


### Gestion du quota de requêtes

#### Recharger le quota de requêtes

```plaintext
POST /recharge
```

**En-têtes :**

```plaintext
Authorization: Bearer <token>
```

**Corps :**

```json
{
  "amount": 10
}
```

**Réponse :**

```json
{
  "message": "Rechargé de 10 requêtes.",
  "newRequestsNumber": 20
}
```

### Endpoints des livres

Tous les endpoints de livres nécessitent une authentification et consomment une requête du quota de l'utilisateur.

#### Récupérer tous les livres

```plaintext
GET /items
```

**En-têtes :**

```plaintext
Authorization: Bearer <token>
```

#### Ajouter un nouveau livre

```plaintext
POST /items
```

**En-têtes :**

```plaintext
Authorization: Bearer <token>
```

**Corps :**

```json
{
  "title": "Titre du livre",
  "author": "Nom de l'auteur",
  "year": 2023,
  "genre": "Genre",
  "language": "Langue"
}
```

#### Mettre à jour un livre

```plaintext
PUT /items/:id
```

**En-têtes :**

```plaintext
Authorization: Bearer <token>
```

**Corps :**

```json
{
  "title": "Titre mis à jour",
  "author": "Auteur mis à jour"
}
```

#### Supprimer un livre

```plaintext
DELETE /items/:id
```

**En-têtes :**

```plaintext
Authorization: Bearer <token>
```

### Endpoint de test

#### Ping

```plaintext
GET /ping
```

**Réponse :**

```json
{
  "message": "pong"
}
```

## Réponses d'erreur

- **401 Unauthorized** : Token invalide ou manquant
- **403 Forbidden** : Déjà enregistré avec des requêtes restantes
- **404 Not Found** : Livre non trouvé
- **429 Too Many Requests** : Quota de requêtes épuisé


## Exemples d'utilisation

### Enregistrer un nouvel utilisateur

```shellscript
curl -X POST http://localhost:3000/register
```

### Récupérer tous les livres

```shellscript
curl -X GET http://localhost:3000/items -H "Authorization: Bearer <votre-token>"
```

### Créer un nouveau livre

```shellscript
curl -X POST http://localhost:3000/items \
  -H "Authorization: Bearer <votre-token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Nouveau Livre","author":"Nouvel Auteur","year":2023,"genre":"Fiction","language":"Français"}'
```

### Recharger le quota de requêtes

```shellscript
curl -X POST http://localhost:3000/recharge \
  -H "Authorization: Bearer <votre-token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":10}'
```
