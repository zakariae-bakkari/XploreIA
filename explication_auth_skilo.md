# Explication Détaillée : Flux d'Authentification (Skilo)

Cette fiche est conçue pour vous aider à expliquer techniquement **l'authentification** lors de votre soutenance. Votre implémentation est très robuste et utilise les meilleures pratiques de sécurité actuelles (JWT en mémoire + Refresh Token en Cookie HTTP-Only).

---

## 1. Le Flux Global (Ce qu'il faut expliquer au jury)

Votre système utilise **JSON Web Tokens (JWT)**. Au lieu d'utiliser des sessions stockées côté serveur (ce qui consomme de la mémoire serveur), vous utilisez une authentification *stateless* (sans état) basée sur deux types de tokens :

1. **Access Token (Jeton d'accès)** : 
   - Durée de vie très courte (ex: 15 minutes).
   - Donne accès aux routes protégées du backend.
   - **Sécurité** : Envoyé au frontend dans le corps de la réponse JSON, puis stocké *uniquement en mémoire RAM* par React (et surtout pas dans le `localStorage` pour éviter les failles XSS).
2. **Refresh Token (Jeton de rafraîchissement)** :
   - Durée de vie longue (7 jours).
   - Ne sert **qu'à fabriquer** un nouveau Access Token quand le premier a expiré.
   - **Sécurité** : Envoyé par le backend sous forme de **Cookie HTTP-Only**. Le Javascript du frontend ne peut pas le lire (protection contre les vols XSS). Il est envoyé automatiquement par le navigateur à chaque requête vers le backend.

---

## 2. Côté Base de Données (Prisma)

Votre schéma (`schema.prisma`) gère l'authentification avec soin :

- **Table `User`** : 
  - Ne stocke **jamais** le mot de passe en clair. Vous stockez un `passwordHash` (généré avec l'algorithme `bcrypt`).
  - Champs de sécurité additionnels : `failedLoginAttempts` et `lockedUntil` pour prévenir les attaques par "Brute Force".
- **Table `TokenBlacklist`** : 
  - Gère la déconnexion sécurisée. Quand un utilisateur fait "Logout", son Refresh Token est haché (SHA-256) et inséré ici. Si un hacker essaie de réutiliser ce token volé, le backend le refusera en vérifiant cette table.

---

## 3. Côté Backend (NestJS / Node.js)

Le fichier `auth.controller.ts` est le point d'entrée. Voici comment ça se passe :

### Login & Register
Quand le frontend appelle `POST /auth/login` avec l'email et le mot de passe :
1. Le backend cherche l'utilisateur et compare le hash du mot de passe avec `bcrypt.compare()`.
2. S'il est valide, le `auth.service.ts` génère les deux JWT.
3. Le contrôleur place le Refresh Token dans le cookie : 
   `res.cookie('refresh_token', result.refresh_token, { httpOnly: true, secure: true })`
4. Il renvoie l'Access Token en JSON : `{ access_token: "eyJhbG..." }`.

### Les Guards (Protection des routes)
Pour protéger une route (ex: `GET /users/me`), vous utilisez le décorateur `@UseGuards(JwtGuard)`. Ce garde intercepte la requête, lit le header `Authorization: Bearer <token>`, valide la signature du token JWT et injecte les infos de l'utilisateur dans `req.user`.

---

## 4. Côté Frontend (Next.js / React)

C'est ici que la liaison se fait de manière très intelligente (fichier `lib/api.ts`).

### Stockage en Mémoire
Dès que la fonction `login` ou `register` réussit, l'Access Token est stocké dans une simple variable globale (let `_accessToken`). Il n'est pas dans le LocalStorage.

### Le Client HTTP Custom (`request`)
Chaque fois qu'une requête part au backend via votre fonction `request()` :
1. Elle injecte automatiquement l'en-tête : `headers['Authorization'] = 'Bearer ' + _accessToken`.
2. Elle ajoute l'option `credentials: 'include'`, ce qui force le navigateur à envoyer le cookie HTTP-Only (contenant le refresh token) avec la requête.

### L'intercepteur de Refresh Automatique (Le point fort !)
Que se passe-t-il quand l'Access Token expire au bout de 15 min ?
Votre code dans `api.ts` gère ça silencieusement :
1. Le backend renvoie une erreur `401 Unauthorized`.
2. Le frontend intercepte cette erreur (ligne 224 de `api.ts`).
3. Au lieu de déconnecter l'utilisateur, le frontend lance secrètement un appel à `POST /auth/refresh`.
4. Le navigateur envoie le Refresh Token (via le cookie HTTP-Only).
5. Le backend renvoie un TOUT NOUVEL Access Token.
6. Le frontend met à jour sa variable mémoire et **rejoue la requête initiale** qui avait échoué.
7. L'utilisateur ne s'aperçoit de rien ! Sauf si le Refresh Token est lui aussi expiré, auquel cas la fonction déclenche un événement `skilo:session-expired` qui le redirige vers l'écran de Login.

---

## ❓ Questions pièges potentielles du Jury & Réponses

**Q : Pourquoi ne pas stocker le token dans le LocalStorage ? C'est plus facile pourtant.**
* **Réponse** : Le LocalStorage est lisible par n'importe quel script JavaScript s'exécutant sur la page. Si on subit une attaque XSS (Cross-Site Scripting), le hacker peut voler le token. En le gardant en mémoire RAM (variable simple) et en mettant le refresh token dans un Cookie `HTTP-Only`, on neutralise totalement ce risque.

**Q : Comment gérez-vous la déconnexion ? Il suffit de supprimer le token côté frontend ?**
* **Réponse** : Non, effacer le token côté frontend ne l'invalide pas côté serveur. Notre route `/auth/logout` prend le refresh token actuel et l'insère dans une table de base de données `TokenBlacklist`. Ainsi, même si le token est encore mathématiquement valide, le backend refusera de l'utiliser.

**Q : C'est quoi exactement un JWT ?**
* **Réponse** : Un JSON Web Token est une chaîne de caractères divisée en 3 parties (Header, Payload, Signature). Le Payload contient nos données (ex: l'ID utilisateur). La particularité est que ce token est "signé" cryptographiquement par le serveur avec une clé secrète. Le serveur n'a pas besoin de consulter la base de données pour vérifier si le token est authentique : il lui suffit de revérifier la signature.
