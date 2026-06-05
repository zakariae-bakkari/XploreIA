# 🎤 Discours de Soutenance : Projet Skilo (Format Court : 6-7 min)

*Ce script a été raccourci pour aller à l'essentiel et tenir le timing serré. L'accroche est plus directe et intègre l'argument de l'Intelligence Artificielle.*

---

## 1. Introduction & Problématique (1 min)

**"Bonjour à toutes et à tous.**

Aujourd'hui, l'apprentissage en ligne explose, mais il y manque un élément crucial : **la pratique**. Si je veux m'améliorer en React ou en anglais, trouver un partenaire motivé et de même niveau est un vrai défi. 
Les tuteurs sont chers, les groupes gratuits manquent d'engagement, **et même si l'Intelligence Artificielle est puissante aujourd'hui, elle ne permet pas l'interaction humaine, l'empathie et le partage d'expérience réelle dont on a besoin pour s'améliorer.**

**Notre solution : Skilo.** Une plateforme de mise en relation pour l'échange mutuel de compétences."

---

## 2. La Solution "Hors du Marché" (1 min)

**"Ce qui nous démarque des plateformes existantes, ce sont deux innovations majeures :**

1. **Un Algorithme de Matching intelligent :** Il ne donne pas une liste aléatoire, il calcule un score de compatibilité précis entre ce que j'offre et ce que je cherche (Perfect ou Partial Match).
2. **Une Économie de Crédits :** Que faire si je veux apprendre d'un expert, mais qu'il n'a pas besoin de mes compétences ? Avec notre système, je peux payer cette session en "crédits", des crédits que j'aurai gagnés préalablement en enseignant ma propre passion à quelqu'un d'autre. L'écosystème reste toujours équilibré."

---

## 3. Démo : L'Inscription & Onboarding (1.5 min)

**"Passons à la pratique avec l'arrivée d'un nouvel utilisateur.** *(Début de la démo)*

Côté inscription, la sécurité est primordiale : le mot de passe est immédiatement hashé avec l'algorithme `bcrypt` avant de toucher notre base de données.
Mais le plus important est ce qui suit : **l'Onboarding**. Pour que l'algorithme fonctionne, le nouveau membre doit déclarer les compétences qu'il offre et celles qu'il recherche. Cette étape permet d'alimenter instantanément notre moteur de Matching."

---

## 4. Démo : Connexion & Architecture de Sécurité (1.5 min)

**"Lors de la connexion (Login), nous avons mis en place une sécurité très stricte.**

D'abord, notre backend intègre une protection *Anti-Brute Force* qui bloque le compte après plusieurs échecs.
Ensuite, pour maintenir la connexion, nous utilisons des **JSON Web Tokens (JWT)** avec une approche très sécurisée :
* L'**Access Token** (qui donne accès aux données) n'est stocké **que dans la mémoire vive (RAM)** du navigateur, ce qui le protège contre le vol (failles XSS).
* Le **Refresh Token** (qui sert à prolonger la session) est placé dans un **Cookie HTTP-Only**, totalement invisible pour les hackers. Notre code frontend intercepte discrètement l'expiration et rafraîchit la session en arrière-plan sans gêner l'utilisateur."

---

## 5. Le Profil & La Fiabilité (1 min)

**"Pour finir, la réputation de l'utilisateur est gérée dynamiquement sur son profil.**

Après chaque session d'échange, les membres s'évaluent mutuellement (pédagogie, ponctualité). 
Grâce à ces notes, notre backend (développé avec NestJS et Prisma) recalcule automatiquement son score. S'il est excellent, le système lui décerne le **Badge 'Fiable'**, visible par toute la communauté.

**En conclusion, avec Skilo, nous utilisons une architecture technique de pointe (Matching, WebSockets, Sécurité JWT) pour résoudre un problème profondément humain : apprendre ensemble."**
