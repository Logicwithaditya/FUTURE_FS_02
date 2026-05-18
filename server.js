const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());


// ✅ Serve frontend files (index.html, style.css, script.js)
// Place this BEFORE your API routes
app.use(express.static(path.join(__dirname, "public")));


// ✅ MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",       // apna MySQL username
  password: "USA&D2430",       // apna MySQL password
  database: "leadflow_crm"
});

db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL");
});

// ✅ Add Lead API
app.post("/api/leads", (req, res) => {
  const { name, email, phone, company, status, notes, followUp } = req.body;
  const sql = "INSERT INTO leads (name, email, phone, company, status, notes, follow_up) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(sql, [name, email, phone, company, status, notes, followUp], (err, result) => {
    if (err) {
      res.status(500).send("Error saving lead");
    } else {
      res.send("Lead added successfully!");
    }
  });
});

// ✅ Fetch Leads API
app.get("/api/leads", (req, res) => {
  db.query("SELECT * FROM leads", (err, results) => {
    if (err) {
      res.status(500).send("Error fetching leads");
    } else {
      res.json(results);
    }
  });
});


// ✅ Delete Lead API
app.delete("/api/leads/:id", (req, res) => {
  const leadId = req.params.id;
  const sql = "DELETE FROM leads WHERE id = ?";
  db.query(sql, [leadId], (err, result) => {
    if (err) {
      res.status(500).send("Error deleting lead");
    } else {
      res.send("Lead deleted successfully!");
    }
  });
});

// ✅ Update Lead API (ADD THIS)
app.put("/api/leads/:id", (req, res) => {
  const leadId = req.params.id;
  const { status, notes, followUp } = req.body;
  const sql = "UPDATE leads SET status=?, notes=?, follow_up=? WHERE id=?";
  db.query(sql, [status, notes, followUp, leadId], (err, result) => {
    if (err) {
      res.status(500).send("Error updating lead");
    } else {
      res.send("Lead updated successfully!");
    }
  });
});



// Start Server
app.listen(3000,() => {
  console.log("🚀 Server running on http://localhost:3000");
})
