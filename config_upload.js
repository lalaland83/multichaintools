const fs = require("fs");

const configPath = "./frontend/config.js"; // Passe den Pfad ggf. an

if (!fs.existsSync(configPath)) {
    console.warn("⚠️  WARNUNG: config.js wurde nicht gefunden! Erstelle eine Standardversion...");
    fs.writeFileSync(configPath, "export const CONFIG = {};");
    console.log("✅ config.js erstellt!");
} else {
    console.log("✅ config.js bereits vorhanden.");
}

console.log("🚀 Alle Dateien sind bereit für den Upload!");
