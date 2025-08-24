const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const multer = require("multer");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: "easymed_secret",
  resave: false,
  saveUninitialized: false
}));
app.use(express.static("public"));

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Jpm112911@",
  database: "easymed"
});

// --- Ensure tables exist ---

// Users for authentication
const createUsers = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);`;
db.query(createUsers, (err) => {
  if (err) console.error("Users table create error:", err);
});

// Speech notes
const createSpeech = `
CREATE TABLE IF NOT EXISTS speech_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  note TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
db.query(createSpeech, (err) => {
  if (err) console.error("Speech table create error:", err);
});

// --- Patient registration ---
app.post("/register", (req, res) => {
  const { name, age, gender, email, phone } = req.body;
  db.query(
    "INSERT INTO patients (name, age, gender, email, phone) VALUES (?, ?, ?, ?, ?)",
    [name, age, gender, email, phone],
    (err) => {
      if (err) throw err;
      res.send("Patient registered successfully! <a href='/'>Go Home</a>");
    }
  );
});

// --- Appointment booking ---
app.post("/appointment", (req, res) => {
  const { patient_id, doctor_name, appointment_date } = req.body;
  db.query(
    "INSERT INTO appointments (patient_id, doctor_name, appointment_date) VALUES (?, ?, ?)",
    [patient_id, doctor_name, appointment_date],
    (err) => {
      if (err) throw err;
      res.send("Appointment booked! <a href='/'>Go Home</a>");
    }
  );
});

// --- File upload (audio) ---
const upload = multer({ dest: "uploads/" });

app.post("/upload-audio", upload.single("audio"), (req, res) => {
  const audioPath = path.join(__dirname, req.file.path);
  const patientId = req.body.patient_id;

  try {
    const result = execSync(
      `whisper "${audioPath}" --model small --language en --output_format txt`
    ).toString();

    const transcription = result || "No transcription";

    db.query(
      "INSERT INTO voice_notes (patient_id, transcription) VALUES (?, ?)",
      [patientId, transcription],
      (err) => {
        if (err) throw err;
        fs.unlinkSync(audioPath);
        res.json({ transcription });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Transcription failed");
  }
});

// Fetch voice notes
app.get("/get-notes/:patient_id", (req, res) => {
  const { patient_id } = req.params;
  db.query("SELECT * FROM voice_notes WHERE patient_id = ?", [patient_id], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// --- Speech notes ---
// Save speech note
app.post("/speech", (req, res) => {
  const { note } = req.body;
  if (!note || note.trim() === "") {
    return res.send("Speech note cannot be empty! <a href='/speech.html'>Try again</a>");
  }
  db.query("INSERT INTO speech_notes (note) VALUES (?)", [note], (err) => {
    if (err) throw err;
    res.send("Speech note saved! <a href='/speech.html'>Back</a>");
  });
});

// List all speech notes
app.get("/speech-notes", (req, res) => {
  db.query("SELECT * FROM speech_notes ORDER BY created_at DESC", (err, results) => {
    if (err) throw err;

    let html = `
      <html>
      <head>
        <title>Speech Notes</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body class="container py-4">
        <h2 class="mb-3">All Speech Notes</h2>
        <a href="/speech.html" class="btn btn-primary mb-3">Back to Recorder</a>
        <ul class="list-group">`;

    results.forEach(r => {
      html += `<li class="list-group-item">
                 ${r.note} <br>
                 <small class="text-muted">${r.created_at}</small>
               </li>`;
    });

    html += `</ul></body></html>`;
    res.send(html);
  });
});

// --- User auth ---
// Register user
app.post("/registerUser", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).send("Missing username or password");
    const hash = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hash],
      (err) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY")
            return res
              .status(400)
              .send("Username already exists. <a href='/user-register.html'>Try again</a>");
          console.error(err);
          return res.status(500).send("Error creating user");
        }
        res.send("User registered successfully! <a href='/login.html'>Login here</a>");
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).send("Server error");
  }
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Missing credentials");
  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
    if (err) return res.status(500).send("DB error");
    if (results.length === 0)
      return res.status(401).send("Invalid credentials. <a href='/login.html'>Try again</a>");
    const user = results[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(401).send("Invalid credentials. <a href='/login.html'>Try again</a>");
    req.session.user = { id: user.id, username: user.username };
    res.send("Login successful! <a href='/index.html'>Go Home</a>");
  });
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.send("Logged out. <a href='/index.html'>Home</a>");
  });
});

// --- Start server ---
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
