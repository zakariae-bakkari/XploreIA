# 🚀 XploreIA Official Development Guide

This document defines the technical standards and workflows for the XploreIA team. **Following these rules is mandatory for all contributors.**

---

## 1. 📂 Folder & File Structure

### Backend (PHP)
- **`backend/app/Controllers/`**: All logic for handling requests.
- **`backend/core/`**: Base classes (Database, Controller, Router). **STRICTLY FORBIDDEN to modify** (Super Admin only).
- **Files**: Must use `PascalCase.php` (e.g., `AiToolController.php`).

### Frontend (React)
- **`frontend/src/pages/`**: Full views/routes (e.g., `Home.jsx`, `Dashboard.jsx`).
- **`frontend/src/components/`**: Reusable UI parts (e.g., `Button.jsx`, `UserCard.jsx`).
- **`frontend/src/api/`**: **All** API communication logic. No fetch calls allowed inside components.

---

## 2. 🔡 Naming Conventions

| Entity | Standard | Example |
| :--- | :--- | :--- |
| **PHP Classes** | PascalCase | `class UserProfileController` |
| **PHP Methods** | camelCase | `public function getUserData()` |
| **PHP Variables** | camelCase | `$allUsers = $this->db->query(...)` |
| **JS Components** | PascalCase | `const UserList = () => { ... }` |
| **JS Functions** | camelCase | `const fetchData = async () => { ... }` |
| **Database Columns**| snake_case | `created_at`, `profile_url` |
| **CSS Classes** | kebab-case | `.user-list-container` |

---

## 3. 🛠️ Backend Development (OOP)

All controllers **must** inherit from the base `Controller` class.

**✅ Correct Example:**
```php
namespace App\Controllers;
use Core\Controller;

class ProductController extends Controller {
    public function index() {
        $data = ["item" => "Laptop"];
        // Always use the built-in jsonResponse method
        $this->jsonResponse([
            'status' => 'success',
            'data' => $data
        ]);
    }
}
```

---

## 4. 🌐 Frontend Development (API & Pages)

### Page vs Component
- **Page**: Controls the layout and fetches data via the API folder.
- **Component**: Receives data via `props` and displays it.

**✅ API Usage Example (`src/api/index.js`):**
```javascript
export const aiToolApi = {
    getAll: () => apiRequest('aitools'),
};
```

**✅ Component Usage Example (`src/components/List.jsx`):**
```javascript
import { aiToolApi } from '../api';

useEffect(() => {
    const load = async () => {
        const res = await aiToolApi.getAll();
        setItems(res.data);
    };
    load();
}, []);
```

---

## 5. 🌿 Git Workflow & Rules

### Branching Policy
- **NEVER push directly to `main`.**
- Always create a branch with your name: `git checkout -b yourname/feature-description` (e.g., `zakariae/add-login`).
- If working on a general task, just use your name: `git checkout -b zakariae`.

### Commit Rules
- **Force Push**: Never use `git push --force`. This can destroy your teammates' work.
- **Pulling**: Always `git pull origin main` before starting work to stay updated.
- **Merging**: Use Pull Requests (PRs) on GitHub/GitLab to merge your branch into `main`.

### Example Workflow:
1. `git checkout main`
2. `git pull origin main`
3. `git checkout -b zakariae/fix-ui`
4. *... make changes ...*
5. `git add .`
6. `git commit -m "Fix styling issues in UserList"`
7. `git push origin zakariae/fix-ui`

---

## 6. 📝 General Cleanliness
- **No Placeholders**: Never use "lorem ipsum" or "test". Use realistic data.
- **Naming**: Use PascalCase for React components and camelCase for logic functions.
- **Clean Code**: Remove `console.log` and comments that don't add value before pushing.
- **Communication**: If you don't understand something, **ask in the WhatsApp group immediately**. Do not make assumptions that could break the build.
- **Workspace**: Stay within your assigned folder/module. Do not modify other people's work without permission.
- **Comments**: Write comments for complex logic, but keep the code self-explanatory.
