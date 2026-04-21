# 🧠 1. Vue globale de l’architecture

Ton projet est organisé en **MVC + Core + Config + Routes**.

👉 Traduction simple :

* **app/** → logique métier (ton vrai code)
* **core/** → moteur interne (routing, base de données…)
* **public/** → point d’entrée (ce que le navigateur voit)
* **config/** → configuration (DB, etc.)
* **routes/** → mapping URL → controller

---

# 🧩 2. Rôle de chaque dossier

## 🔹 `public/` (Entry Point)

C’est **le seul dossier accessible par le navigateur**.

```php
// public/index.php
require_once '../core/Router.php';
require_once '../routes/web.php';
```

👉 Tout passe par ici
👉 Sécurité + contrôle total

---

## 🔹 `routes/`

Définit les routes de ton app :

```php
// routes/web.php
Router::get('/users', 'UserController@index');
```

👉 URL → Controller

---

## 🔹 `core/`

Le “mini framework” que tu construis :

* `Router.php` → gère les routes
* `Controller.php` → classe de base
* `Database.php` → connexion DB (PDO)

---

## 🔹 `app/controllers/`

Reçoit la requête et décide quoi faire :

```php
class UserController {
    public function index() {
        $users = User::getAll();
        require '../app/views/user/profile.php';
    }
}
```

👉 Pas de SQL direct
👉 Pas de HTML lourd

---

## 🔹 `app/models/`

Gère la base de données :

```php
class User {
    public static function getAll() {
        $db = Database::connect();
        return $db->query("SELECT * FROM users")->fetchAll();
    }
}
```

👉 Ici = logique DB uniquement

---

## 🔹 `app/views/`

Affichage :

```php
<h1>Users</h1>

<?php foreach ($users as $user): ?>
    <p><?= $user['name'] ?></p>
<?php endforeach; ?>
```

👉 Pas de logique métier
👉 Juste UI

---

## 🔹 `config/`

Configuration :

```php
// config/database.php
return [
    'host' => 'localhost',
    'dbname' => 'test',
    'user' => 'root',
    'password' => ''
];
```

---

# 🔁 3. Exemple complet (flow)

## 🎯 Cas: utilisateur visite

```
http://localhost/project/public/users
```

---

## Étape 1 → index.php

```php
Router::dispatch('/users');
```

---

## Étape 2 → Router

```php
// Router.php
'/users' => 'UserController@index'
```

👉 Il appelle :

```php
$controller = new UserController();
$controller->index();
```

---

## Étape 3 → Controller

```php
public function index() {
    $users = User::getAll();
    require '../app/views/user/profile.php';
}
```

---

## Étape 4 → Model

```php
User::getAll();
```

👉 Exécute SQL → récupère données

---

## Étape 5 → View

```php
foreach ($users as $user) {
    echo $user['name'];
}
```

👉 Affichage final

---

# 🔄 4. Schéma mental (important)

```
Client (Browser)
      ↓
public/index.php
      ↓
Router
      ↓
Controller
      ↓
Model (DB)
      ↓
Controller
      ↓
View
      ↓
Response (HTML)
```

---

# ⚠️ 5. Règles importantes (sinon chaos)

* ❌ Model ne connaît pas View
* ❌ View ne fait pas de SQL
* ❌ Controller ne contient pas tout ton projet

Sinon → spaghetti code 🍝

---

# 🧱 6. Améliorations recommandées

Si tu veux faire ça proprement (et impressionner ton prof) :

### ✔ Ajouter un BaseController

```php
class Controller {
    protected function view($path, $data = []) {
        extract($data);
        require "../app/views/$path.php";
    }
}
```

---

### ✔ Router propre

```php
Router::get('/users', [UserController::class, 'index']);
```

---

### ✔ PDO sécurisé

```php
$stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$id]);
```

---

# 🧾 Conclusion

Ton architecture =

* **simple MVC maison**
* **scalable pour projet étudiant**
* **propre si tu respectes les rôles**

---

Tu tiens une base solide. Si tu commences à mélanger SQL + HTML + logique dans le même fichier… ton futur toi va te maudire avec passion.
