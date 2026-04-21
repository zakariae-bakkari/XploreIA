# 📦 PHP MVC Project Setup

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
xploreia/
│
├── app/
│   ├── controllers/
│   ├── models/
│   └── views/
│
├── core/
├── public/        ← entry point (index.php)
├── config/
└── routes/
```

---

## ⚠️ Important Notes

* Always access the app via `/public`
* Do NOT modify files inside `/core` unless necessary
* Keep logic separated:

  * Controllers → handle requests
  * Models → database logic
  * Views → UI only

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
