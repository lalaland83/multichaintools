const fs = require("fs");
const path = require("path");

// Aktuelles Arbeitsverzeichnis ausgeben
console.log("📁 Aktuelles Verzeichnis:", process.cwd());

// Alle Dateien und Ordner im aktuellen Verzeichnis listen
const listFiles = (dir, level = 0) => {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const isDirectory = fs.statSync(fullPath).isDirectory();
        console.log("  ".repeat(level) + (isDirectory ? "📂 " : "📄 ") + item);
        if (isDirectory) {
            listFiles(fullPath, level + 1);
        }
    });
};

// Starte im aktuellen Verzeichnis
listFiles(".");
