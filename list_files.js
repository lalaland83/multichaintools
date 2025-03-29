const fs = require("fs");
const path = require("path");

// Funktion zum rekursiven Durchsuchen eines Verzeichnisses
function listFiles(dir, prefix = "") {
    try {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                console.log(`${prefix}[DIR] ${file}/`);
                listFiles(fullPath, prefix + "  ");
            } else {
                console.log(`${prefix}- ${file}`);
            }
        });
    } catch (error) {
        console.error(`❌ Fehler beim Lesen von ${dir}:`, error.message);
    }
}

// Starte von der aktuellen Arbeitsumgebung
console.log("📂 **Dateien in Vercel-Umgebung:**");
listFiles(".");
