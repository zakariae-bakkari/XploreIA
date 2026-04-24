# 📦 XploreIA - Project Setup (React + PHP API)

## 🚀 Project Installation

Follow these steps to run the project locally using XAMPP.

---

## 1. Clone the repository

```bash
git clone https://github.com/zakariae-bakkari/xploreia.git
```

---

## 2. Move project to XAMPP

Move the project folder into the `htdocs` directory:

### On Linux:

```bash
mv xploreia /opt/lampp/htdocs/xploreia
```

### On Windows:

Move the folder to:

```
C:\xampp\htdocs\xploreia
```

---

## 3. Start XAMPP

Make sure the following services are running:

* Apache
* MySQL

---

## 4. Access the project

Open your browser and go to:

```
http://localhost/xploreia/public
```

---

## 📁 Project Structure

```
XploreIA/
├── backend/           ← PHP MVC Backend
│   ├── app/
│   │   ├── Controllers/
│   │   ├── Models/
│   │   └── Views/
│   ├── core/          ← Base system logic
│   └── public/        ← Entry point (index.php)
├── frontend/          ← React + Vite Frontend
│   ├── src/
│   │   ├── api/       ← API services
│   │   ├── components/
│   │   └── pages/
│   └── .env           ← Frontend config
└── README.md
```

---

## 📜 Development Standards
Before contributing, please read the [Development Rules](DEVELOPMENT_RULES.md) carefully.

---

## ⚠️ Important Notes

* Always access the app via the React frontend.
* The PHP backend is now an **API-only** system.
* **No MVC**: We have Controllers to handle requests, but Models and Views were removed in favor of React.
* Do NOT modify files inside `backend/core/` unless you are the Super Admin.

---

## 🛠 Requirements

* PHP >= 8.x
* XAMPP (Apache + MySQL)

---

## ✅ Good Practices

* Do not commit `.env` or sensitive data
* Keep code clean and modular
* Follow MVC structure

---

## 💀 Common Mistakes

* Opening `index.php` directly (don’t do that)
* Mixing HTML inside Models (just don’t)
* Writing SQL inside Views (please no)

---

Stay organized. Future you will be less angry.

---

## 👥 Team Members

| Name | Role |
| :--- | :--- |
| **Bakkari Zakariae** | 👑 Super Admin |
| **Hamri Meriem** | 👨‍💻 Late wake up Developer  😴 |
| **Ait Yahya Saad** | 👨‍💻 Hacker |
| **Oubraim Noureddine** | 👨‍💻 Developer with Abtal |
| **Errami Youssef** | 👨‍💻 Developer 💵 |
