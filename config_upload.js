const fs = require("fs");
const path = require("path");

// 1️⃣ Stelle sicher, dass der `public`-Ordner existiert
if (!fs.existsSync("public")) {
    fs.mkdirSync("public", { recursive: true });
}

// 2️⃣ Falls nötig, verschiebe `config.js` ins `public`-Verzeichnis
const configSrc = path.join(__dirname, "config.js");
const configDest = path.join(__dirname, "public", "config.js");

if (fs.existsSync(configSrc)) {
    fs.copyFileSync(configSrc, configDest);
    console.log("✅ config.js wurde nach public/ verschoben.");
} else {
    console.warn("⚠️  WARNUNG: config.js wurde nicht gefunden!");
}

console.log("🚀 Alle Dateien sind bereit für den Upload!");
