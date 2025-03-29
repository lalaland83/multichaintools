const fs = require("fs");

// Ensure "public" folder exists (even if empty)
if (!fs.existsSync("public")) {
    fs.mkdirSync("public", { recursive: true });
}

// Create a dummy file to prevent Vercel errors
fs.writeFileSync("public/keep.txt", "This file prevents Vercel errors.");

// Read the template config file
let config = fs.readFileSync("config.template.js", "utf8");

// Match all occurrences of tempuse.*
const matches = config.match(/tempuse\.[a-zA-Z0-9_]+/g) || [];

let replacedCount = 0;
matches.forEach((match) => {
    const envVar = match.replace("tempuse.", "").toUpperCase(); // Convert to uppercase for ENV lookup
    const value = process.env[envVar] || "[MISSING]"; // Use "[MISSING]" if env variable is not set

    const regex = new RegExp(match, "g"); // Ensure all occurrences are replaced
    config = config.replace(regex, value);

    replacedCount++;
    console.log(`Replacing ${match} with ${value !== "[MISSING]" ? "[SET]" : "[MISSING]"}`);
});

// Save the modified config.js OUTSIDE public
fs.writeFileSync("config.js", config);
console.log(`✅ Secret Keys successfully replaced in config.js! (${replacedCount} replacements)`);


const path = require("path");

// Funktion zur Ausgabe aller Dateien und Ordner
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
console.log("📁 Aktuelles Verzeichnis:", process.cwd());
listFiles(".");
