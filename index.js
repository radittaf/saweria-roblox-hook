// File: index.js (Versi Debug Secrets)
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

// Mengambil data rahasia dari Environment Variables (Secrets)
const ROBLOX_API_URL = process.env.ROBLOX_API_URL;
const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;
const UNIVERSE_ID = process.env.UNIVERSE_ID;

// Endpoint utama yang akan menerima notifikasi donasi dari Saweria
app.post("/saweria-webhook", (req, res) => {
  console.log("===================================");
  console.log("Menerima webhook dari Saweria...");

  // === BLOK DEBUG BARU ===
  // Blok ini akan mencetak status setiap Secret yang kita butuhkan.
  console.log("Mengecek status Environment Variables (Secrets)...");
  console.log(`- Status ROBLOX_API_URL: ${ROBLOX_API_URL ? 'DITEMUKAN' : 'TIDAK ADA / KOSONG'}`);
  console.log(`- Status ROBLOX_API_KEY: ${ROBLOX_API_KEY ? 'DITEMUKAN' : 'TIDAK ADA / KOSONG'}`);
  console.log(`- Status UNIVERSE_ID: ${UNIVERSE_ID ? 'DITEMUKAN' : 'TIDAK ADA / KOSONG'}`);
  console.log("===================================");
  // === AKHIR BLOK DEBUG ===

  // Cek apakah semua variabel dari secrets sudah ada
  if (!ROBLOX_API_URL || !ROBLOX_API_KEY || !UNIVERSE_ID) {
    console.error("Kesalahan: Satu atau lebih Environment Variables tidak ditemukan. Proses dihentikan.");
    return res.status(500).send("Server configuration error.");
  }

  const data = req.body;
  if (data.type === "donation" && data.data) {
    const donationData = data.data;
    const payload = {
      donator_name: donationData.donator_name || "Anonymous",
      amount: donationData.amount || 0,
      message: donationData.message || "",
    };

    axios.post(
        `${ROBLOX_API_URL}/v1/universes/${UNIVERSE_ID}/topics/SaweriaDonation`,
        { message: JSON.stringify(payload) },
        { headers: { "x-api-key": ROBLOX_API_KEY, "Content-Type": "application/json" } }
    ).then(response => {
        console.log("Berhasil mengirim data donasi ke Roblox.");
    }).catch(error => {
        console.error("Gagal mengirim data ke Roblox:", error.response ? error.response.data : error.message);
    });

    res.status(200).send("Donation received and processing.");
  } else {
    res.status(400).send("Invalid data format.");
  }
});

app.get("/", (req, res) => {
    res.send("Server perantara untuk Saweria-Roblox aktif! (v_debug_secrets)");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}.`);
});
