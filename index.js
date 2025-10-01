const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const ROBLOX_API_URL = process.env.ROBLOX_API_URL;
const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;
const UNIVERSE_ID = process.env.UNIVERSE_ID;

app.post("/saweria-webhook", (req, res) => {
  console.log("===================================");
  console.log("Menerima webhook dari Saweria...");

  console.log("Mengecek status Environment Variables (Secrets)...");
  console.log(`- Status ROBLOX_API_URL: ${ROBLOX_API_URL ? 'DITEMUKAN' : 'TIDAK ADA / KOSONG'}`);
  console.log(`- Status ROBLOX_API_KEY: ${ROBLOX_API_KEY ? 'DITEMUKAN' : 'TIDAK ADA / KOSONG'}`);
  console.log(`- Status UNIVERSE_ID: ${UNIVERSE_ID ? 'DITEMUKAN' : 'TIDAK ADA / KOSONG'}`);
  console.log("===================================");

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

    console.log("Mencoba mengirim data ke Roblox API dengan timeout 5 detik...");
    axios.post(
        `${ROBLOX_API_URL}/v1/universes/${UNIVERSE_ID}/topics/SaweriaDonation`,
        { message: JSON.stringify(payload) },
        { 
          headers: { "x-api-key": ROBLOX_API_KEY, "Content-Type": "application/json" },
          timeout: 5000 // Menambahkan timeout 5 detik
        }
    ).then(response => {
        console.log("Berhasil mengirim data donasi ke Roblox.");
    }).catch(error => {
        if (error.code === 'ECONNABORTED') {
            console.error("Gagal mengirim data ke Roblox: Request timed out (melebihi 5 detik). Ini kemungkinan besar adalah masalah jaringan antara Render dan Roblox.");
        } else {
            console.error("Gagal mengirim data ke Roblox:", error.response ? error.response.data : error.message);
        }
    });

    res.status(200).send("Donation received, processing request to Roblox.");
  } else {
    res.status(400).send("Invalid data format.");
  }
});

app.get("/", (req, res) => {
    res.send("Server perantara untuk Saweria-Roblox aktif! (v_debug_timeout)");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}.`);
});
