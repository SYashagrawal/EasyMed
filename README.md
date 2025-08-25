# 🏥 EasyMed

**EasyMed** is a simple healthcare management system built with **Node.js, Express, and MySQL**.
It allows patients to register, book appointments, and doctors to manage patient information and voice notes.

---

## ✨ Features

* 👤 **User Authentication** – Secure login & registration with hashed passwords
* 🧾 **Patient Registration** – Register patients with personal details
* 📅 **Appointment Booking** – Schedule appointments with doctors
* 🎙 **Speech Notes** – Record and transcribe audio notes using Whisper AI
* 📂 **Data Storage** – All information stored in MySQL database
* 🔐 **Session Handling** – Manage logged-in users with Express Sessions

---

## ⚙️ Tech Stack

* **Frontend**: HTML, CSS, JavaScript
* **Backend**: Node.js, Express.js
* **Database**: MySQL
* **Authentication**: bcrypt.js, express-session
* **Voice Transcription**: OpenAI Whisper

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/SYashagrawal/EasyMed.git
cd EasyMed
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up MySQL database

```sql
CREATE DATABASE easymed;
USE easymed;
```

Create the required tables (`users`, `patients`, `appointments`, `voice_notes`, `speech_notes`).

### 4. Start the server

```bash
node server.js
```

The app will run at 👉 [http://localhost:3000](http://localhost:3000)

---

## 📌 Future Improvements

* Dashboard for doctors & patients
* Better UI with Bootstrap/TailwindCSS
* Role-based authentication (Doctor vs Patient)
* Cloud deployment (Heroku, Vercel, or AWS RDS for database)

---

## 📄 License

This project is licensed under the **MIT License**.

---
