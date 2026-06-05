# Le Cheminement du Code : De la Connexion à la Base de Données

Ce document trace l'exécution **ligne par ligne** et **fichier par fichier** lorsque l'utilisateur clique sur le bouton "Se connecter". Idéal pour montrer au jury que vous maîtrisez l'architecture de bout en bout.

---

## Étape 1 : Le Clic dans l'Interface (Frontend)
**Fichier concerné :** `apps/frontend/components/auth/login-form.tsx`

1. L'utilisateur remplit les champs et clique sur "Sign In".
2. L'événement `onSubmit` déclenche la fonction `handleSubmit(e)`.
3. **Concept - Event Handling :** On utilise `e.preventDefault()` pour empêcher le navigateur de recharger la page (comportement par défaut d'un formulaire HTML).
4. Le code fait appel à notre client API : `await authApi.login({ email, password })`.

---

## Étape 2 : L'Appel Réseau (Frontend)
**Fichier concerné :** `apps/frontend/lib/api.ts`

1. La fonction `authApi.login` appelle notre fonction générique `request('POST', '/auth/login', data)`.
2. **Concept - Promises (Promesses) :** Le mot-clé `await` indique qu'on fait un appel asynchrone (sur le réseau). Pendant que le navigateur attend la réponse du serveur, le thread principal JavaScript (Event Loop) n'est pas bloqué, l'interface reste fluide.
3. La requête HTTP `fetch` part vers le serveur (NestJS) avec l'option `credentials: 'include'` pour accepter les cookies en retour.

---

## Étape 3 : La Réception et la Validation (Backend)
**Fichier concerné :** `apps/backend/src/auth/auth.controller.ts`

1. La requête arrive sur le décorateur `@Post('login')` de la fonction `async login()`.
2. **Concept - Les Pipes (Validation) :** Dans la signature de la fonction, on voit `@Body() dto: LoginDto`. En arrière-plan, NestJS utilise un **ValidationPipe**. Ce "tuyau" intercepte la requête *avant même qu'elle n'entre dans la fonction*. Il vérifie que l'email a bien le format d'un email et que le mot de passe est une chaîne de caractères (définis par `class-validator` dans `LoginDto`). Si c'est faux, le Pipe renvoie directement une erreur 400 (Bad Request).

---

## Étape 4 : La Logique Métier (Backend)
**Fichier concerné :** `apps/backend/src/auth/auth.service.ts`

Le contrôleur délègue le travail au service via `this.authService.login(dto)`.

1. **Concept - Singleton :** Le `AuthService` et le `PrismaService` sont injectés via le constructeur. Ce sont des **Singletons**. Cela signifie que NestJS ne crée qu'une seule instance globale de ces classes au démarrage. On ne sature pas la mémoire en créant un nouveau service à chaque connexion.
2. **Recherche BDD :** On appelle `await this.prisma.user.findUnique(...)`. (Encore une Promesse asynchrone).
3. **Vérification Brute Force :** On appelle la méthode `this.assertNotLocked(user)`. Si l'utilisateur a échoué 5 fois, on lève une exception (`Error`).
4. **Vérification du Mot de Passe :** On utilise `await bcrypt.compare(dto.password, user.passwordHash)`. `bcrypt` compare le mot de passe tapé avec le hash de la BDD.
5. Si succès, on met à jour la base de données : on remet `failedLoginAttempts` à 0.

---

## Étape 5 : La Génération des Tokens (Backend)
**Fichier concerné :** `apps/backend/src/auth/auth.service.ts` (Méthode `buildResponse`)

1. On crée le "Payload" (le contenu du JWT) contenant l'ID et l'email de l'utilisateur.
2. Le `JwtService` génère deux tokens de manière asynchrone :
   - `access_token` (expire dans 15m)
   - `refresh_token` (expire dans 7d)
3. On renvoie ces tokens au Contrôleur.

---

## Étape 6 : L'Envoi de la Réponse (Backend -> Frontend)
**Fichier concerné :** `apps/backend/src/auth/auth.controller.ts`

1. Le contrôleur place le Refresh Token dans un cookie sécurisé : `res.cookie('refresh_token', ..., REFRESH_COOKIE_OPTIONS)`.
2. Il renvoie l'Access Token et les infos de l'utilisateur sous forme de JSON (`return { access_token, user }`).

---

## Étape 7 : La Redirection Finale (Frontend)
**Fichier concerné :** `apps/frontend/components/auth/login-form.tsx`

1. La promesse `await authApi.login()` est résolue et renvoie les données.
2. On appelle `login(data.access_token, data.user)` (venant du `AuthContext`). Cela enregistre l'Access Token en mémoire vive (RAM) et met à jour l'interface React.
3. Le routeur Next.js redirige l'utilisateur en fonction de son statut :
   - S'il est Onboarded : `router.push('/dashboard')`
   - Sinon : `router.push('/onboarding')`

---

## 🔒 Et après ? (Les Guards)

**Fichier concerné :** `apps/backend/src/auth/auth.controller.ts` (Ligne `90`)

Une fois connecté, lorsque l'utilisateur veut accéder à des données privées (ex: `GET /auth/me`), la requête passe par un **Guard** (Garde).
- **Concept - Les Guards :** Sur la route, on a `@UseGuards(JwtGuard)`. Le Guard agit comme un videur de boîte de nuit. *Avant* d'exécuter la fonction `getProfile()`, il lit l'en-tête `Authorization` de la requête HTTP. S'il n'y a pas d'Access Token ou s'il est expiré, le Guard bloque la requête et renvoie une erreur `401 Unauthorized` sans même réveiller le contrôleur. S'il est valide, il laisse passer.
