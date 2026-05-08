# Documentation : Fonctionnalités de Login & Mot de passe oublié

Ce document récapitule toutes les modifications et ajouts effectués pour intégrer l'authentification (Login) et la récupération de compte (Mot de passe oublié) sur XploreIA.

---

## 🛠️ 1. Modifications côté Backend (PHP)

### A. Nouvelles Routes (`backend/routes/web.php`)
Ajout des routes nécessaires pour la gestion de l'authentification :
- `POST /login` : Pour la connexion.
- `POST /logout` : Pour la déconnexion.
- `POST /forgot-password` : Pour demander un code de réinitialisation.
- `POST /forgot-password/verify` : Pour vérifier le code à 6 chiffres.
- `POST /reset-password` : Pour enregistrer le nouveau mot de passe.

### B. Contrôleur d'Authentification (`backend/app/controllers/AuthController.php`)
- **`login()`** : Vérifie l'email, compare le mot de passe haché avec `password_verify()`, et initialise la session (`$_SESSION['user_id']`).
- **`logout()`** : Détruit la session utilisateur.
- **`forgotPassword()`** : Génère un code à 6 chiffres, l'enregistre en session avec une expiration de 15 minutes, et déclenche l'envoi de l'email avec le type `reset`.
- **`forgotPasswordVerify()`** : Vérifie que le code entré par l'utilisateur correspond à celui en session, et marque l'étape comme "vérifiée".
- **`resetPassword()`** : Vérifie la correspondance des mots de passe, impose une longueur minimale de 8 caractères, hache le nouveau mot de passe avec `PASSWORD_BCRYPT`, et met à jour la base de données.

### C. Service d'Email (`backend/core/EmailService.php`)
- **Rendu dynamique** : Modification de `sendVerificationCode()` et `getEmailTemplate()` pour accepter un paramètre `$type` (`'signup'` ou `'reset'`).
- **Textes personnalisés** : Le sujet et le corps de l'email s'adaptent automatiquement. Au lieu de "Welcome to XploreIA", un utilisateur demandant un reset recevra "Password Reset Request".

---

## 💻 2. Modifications côté Frontend (React / Vite)

### A. Service API (`frontend/src/api/index.js`)
Ajout des appels API correspondants aux nouvelles routes backend :
- `authApi.login(data)`
- `authApi.logout()`
- `authApi.forgotPassword(email)`
- `authApi.forgotPasswordVerify(code)`
- `authApi.resetPassword(data)`

### B. Pages et Navigation
- **`frontend/src/App.jsx`** : Ajout des routes `<Route path="/login" />` et `<Route path="/forgot-password" />`.
- **`frontend/src/pages/HomePage.jsx`** : Ajout du lien de navigation vers la page `/login` dans la section footer "Connect with us".

### C. Fonctionnalité de Connexion (Login)
- **`frontend/src/pages/login-page.jsx`** : Page principale qui gère l'état de la connexion et l'appel API. Redirige vers la page d'accueil (`/`) en cas de succès.
- **`frontend/src/pages/login.css`** : Feuille de style réutilisant l'esthétique Glassmorphism définie dans le signup.
- **`frontend/src/components/auth/LoginForm.jsx`** : Le formulaire UI avec les champs Email et Mot de passe, et les liens de redirection vers "Forgot Password" et "Sign up".

### D. Fonctionnalité de Mot de Passe Oublié
Création d'un flux fluide en 4 étapes (sans rechargement de page), géré par **`frontend/src/pages/forgot-password-page.jsx`** :

1. **Étape 1 - Demande (`ForgotPasswordForm.jsx`)** : L'utilisateur entre son email.
2. **Étape 2 - Vérification (`VerificationForm.jsx`)** : Saisie du code à 6 chiffres envoyé par email.
3. **Étape 3 - Nouveau mot de passe (`ResetPasswordForm.jsx`)** : Saisie et confirmation du nouveau mot de passe.
4. **Étape 4 - Succès (`SuccessStep.jsx`)** : Affichage d'un message de confirmation et redirection automatique vers `/login`.

### E. Amélioration des Composants Réutilisables
Pour éviter la duplication de code entre le Signup et le Reset Password, nous avons rendu deux composants dynamiques (via l'ajout de *props*) :
- **`VerificationForm.jsx`** : Accepte maintenant `title` et `buttonText`.
- **`SuccessStep.jsx`** : Accepte maintenant `title` et `message`, permettant d'afficher "Password Reset Successful!" au lieu de "Welcome to XploreIA!".
