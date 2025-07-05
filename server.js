// server.js
const express = require('express');
const serveIndex = require('serve-index');
const cors = require('cors');
const path = require('path');

const app = express();

// Allow CORS
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Serve static files and directory listing with details view
const songsPath = path.join(__dirname, 'songs');
app.use('/songs',
  express.static(songsPath),
  serveIndex(songsPath, { icons: true, view: 'details' })  // 👈 This is the key line
);

app.listen(3000, () => {
  console.log("✅ Server running at http://127.0.0.1:3000");
});
