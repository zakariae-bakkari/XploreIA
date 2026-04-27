# 📦 XploreIA - Project Setup (React + PHP API)

XploreIA is a modern AI tools marketplace platform built with a decoupled architecture: a **React + Vite** frontend and a **Native PHP API** backend.

---

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/zakariae-bakkari/XploreIA.git
cd XploreIA
```

---

## 🖥️ Backend Setup (PHP API)

The backend is a custom-built PHP API that handles database interactions and business logic.

1.  **Move to XAMPP**:
    Move the `XploreIA` folder to your XAMPP `htdocs` directory (usually `C:\xampp\htdocs\XploreIA`).
2.  **Configure Environment**:
    - Go to `backend/`
    - Copy `example.env` to `.env`
    - Update the database credentials in `.env` if necessary.
3.  **Database Import**:
    - Start **Apache** and **MySQL** in XAMPP.
    - Go to [phpMyAdmin](http://localhost/phpmyadmin).
    - Create a database named `xplore_ia`.
    - Import the `xplore_ia_database_v3_mysql.sql` file located in the root directory.
4.  **Verify API**:
    Your API entry point is `http://localhost/XploreIA/backend/public/`.

---

## ⚛️ Frontend Setup (React)

The frontend is built with React, Vite, and pnpm.

1.  **Install dependencies**:
    ```bash
    cd frontend
    pnpm install
    ```
2.  **Configure Environment**:
    - Copy `example.env` to `.env`
    - Ensure `VITE_API_URL` points to your backend entry point (e.g., `http://localhost/XploreIA/backend/public`).
3.  **Run Development Server**:
    ```bash
    pnpm dev
    ```
4.  **Access the App**:
    Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
XploreIA/
├── backend/                ← PHP API
│   ├── app/                ← Controllers & Logic
│   ├── config/             ← Database & App Config
│   ├── core/               ← Base System (Router, DotEnv, DB)
│   ├── public/             ← API Entry Point (index.php)
│   ├── routes/             ← API Route Definitions
│   └── .env                ← Backend Environment Variables
├── frontend/               ← React Frontend
│   ├── src/
│   │   ├── api/            ← Axios / API Services
│   │   ├── components/     ← Reusable UI Components
│   │   └── pages/          ← View Components
│   └── .env                ← Frontend Environment Variables
└── xplore_ia_database.sql  ← Database Schema
```

---

## ⚠️ Important Notes

*   **API-Only Backend**: The PHP backend does not serve HTML. It returns JSON for the React frontend.
*   **Environment Variables**: We use a custom `Core\DotEnv` loader in the backend to support `.env` files without Composer.
*   **Security**: Never commit your `.env` files. They are already added to `.gitignore`.

---

## 👥 Team Members

| Name | Role |
| :--- | :--- |
| **Bakkari Zakariae** | 👑 Super Admin |
| **Hamri Meriem** | 👨‍💻 Developer |
| **Ait Yahya Saad** | 👨‍💻 Developer |
| **Oubraim Noureddine** | 👨‍💻 Developer |
| **Errami Youssef** | 👨‍💻 Developer |

---

## 📜 Development Standards
Before contributing, please read the [Development Rules](DEVELOPMENT_RULES.md) carefully.
