# 🔐 Signup & Verification System Documentation

Hello Team! 👋 

This document explains the new Signup and Email Verification system implemented for **XploreIA**. The goal was to create a secure, user-friendly, and professional onboarding experience.

---

## 🚀 Key Features
1.  **Multi-Step Onboarding**: A smooth transition from the registration form to email verification.
2.  **Real-Time Countdown**: A 15-minute timer for code verification with visual alerts.
3.  **Secure Backend**: Password hashing using Bcrypt and session-based temporary storage.
4.  **Real Email Delivery**: Integrated **PHPMailer** with Gmail SMTP support for academic/development use.
5.  **Premium UI**: Glassmorphic design with subtle animations using Framer Motion.

---

## 🛠️ Technical Architecture

### 1. Backend Logic (PHP)
*   **AuthController**: Handles two main endpoints:
    *   `/signup`: Validates user data, generates a 6-digit code, and stores a "pending" user in the session.
    *   `/verify-code`: Validates the submitted code against the session and persists the user to the database only after success.
*   **EmailService**: A dedicated service using PHPMailer to send beautiful HTML emails.
    *   *Tip*: Codes are also logged in `backend/storage/logs/email.log` for local debugging.
*   **Session Management**: We use `$_SESSION` to track users during the 15-minute verification window without cluttering the database with unverified accounts.

### 2. Frontend Logic (React)
*   **API Centralization**: All calls go through `frontend/src/api/index.js` using a clean `authApi` object.
*   **CORS & Credentials**: The system is configured to support cross-origin sessions, allowing the frontend (Vite) and backend (XAMPP) to communicate securely.
*   **Animations**: We use `AnimatePresence` from Framer Motion for seamless transitions between signup steps.

---

## 🔒 Security & Environment
*   **App Passwords**: For Gmail SMTP, please use a **Google App Password** instead of your main account password in the `.env` file.
*   **Git Integrity**: The `.gitignore` has been updated to ensure your `.env` and `vendor` folders are never committed.

---

## 📝 Team Notes
*   **Testing**: If you don't receive an email immediately, check the local log file mentioned above.
*   **Login**: The signup system automatically logs the user in (creates a session) upon successful verification.
*   **SMTP**: If you change the SMTP provider, simply update the variables in the `backend/.env` file.

Feel free to reach out if you have any questions about the implementation! Let's build something great together. 🚀

---

## 📅 Suggested Commit History
If you are committing these changes, here is a suggested list of messages to describe the work:

1.  `feat(backend): init AuthController and signup routes`
2.  `feat(backend): implement session-based signup with verification code`
3.  `feat(backend): add 15-minute expiration timer for verification`
4.  `feat(backend): integrate PHPMailer with Gmail SMTP support`
5.  `feat(frontend): create premium glassmorphic Signup UI with multi-step flow`
6.  `refactor(api): centralize API calls and enable CORS with credentials`
7.  `refactor(frontend): modularize Auth components for better maintainability`
8.  `docs: add comprehensive signup documentation for the team`

---

-- *XploreIA Development Team*

