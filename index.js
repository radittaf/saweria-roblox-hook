// File: index.js

const express = require("express");
const axios = require("axios");
const app = express();

// Middleware ini penting agar server bisa membaca data JSON yang dikirim oleh Saweria
app.use(express.json());

// Mengambil data rahasia dari Environment Variables (Secrets)
// Pastikan Anda sudah mengaturnya di Render atau Glitch
const ROBLOX_API_URL = process.env.ROBLOX_API_URL;
const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;
const UNIVERSE_ID = process.env.UNIVERSE_ID;

// Endpoint utama yang akan menerima notifikasi donasi dari Saweria
app.post("/saweria-webhook", (req, res) => {
  console.log("Menerima webhook dari Saweria...");
  const data = req.body;

  // Cek apakah semua variabel dari secrets sudah ada dan tidak kosong
  if (!ROBLOX_API_URL || !ROBLOX_API_KEY || !UNIVERSE_ID) {
    console.error("Kesalahan: Variabel API Roblox belum diatur di Secrets!");
    // Jangan kirim pesan error yang terlalu detail ke publik
    return res.status(500).send("Server configuration error.");
  }

  // Memastikan data yang masuk adalah donasi yang valid
  if (data.type === "donation" && data.data) {
    const donationData = data.data;

    // Menyiapkan data yang akan dikirim ke Roblox
    const payload = {
      donator_name: donationData.donator_name || "Anonymous",
      amount: donationData.amount || 0,
      message: donationData.message || "", // Pesan donasi
    };

    // Mengirim data ke Roblox menggunakan MessagingService API
    axios.post(
        `${ROBLOX_API_URL}/v1/universes/${UNIVERSE_ID}/topics/SaweriaDonation`,
        { message: JSON.stringify(payload) }, // Pesan harus dalam bentuk string JSON
        { 
          headers: { 
            "x-api-key": ROBLOX_API_KEY, 
            "Content-Type": "application/json" 
          } 
        }
    ).then(response => {
        console.log("Berhasil mengirim data donasi ke Roblox.");
    }).catch(error => {
        console.error("Gagal mengirim data ke Roblox:", error.response ? error.response.data : error.message);
    });

    // Mengirim balasan ke Saweria bahwa data sudah diterima
    res.status(200).send("Donation received and forwarded to Roblox.");

  } else {
    // Jika data yang masuk bukan donasi atau formatnya salah
    res.status(400).send("Invalid data format or not a donation event.");
  }
});

// Endpoint ini hanya untuk mengecek apakah server Anda hidup atau tidak
// Anda bisa membukanya di browser: https://url-render-anda.onrender.com/
app.get("/", (req, res) => {
    res.send("Server perantara untuk Saweria-Roblox aktif! Siap menerima donasi.");
});

// Menjalankan server di port yang disediakan oleh hosting
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}.`);
});