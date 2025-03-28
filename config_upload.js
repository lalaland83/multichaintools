const fs = require("fs");
const path = require("path");

const configPath = "public/config.js";
const templatePath = "config.template.js";

// Ensure the `public/` directory exists, create it if missing
if (!fs.existsSync("public")) {
    fs.mkdirSync("public", { recursive: true });
}

// Read the template file
let config = fs.readFileSync(templatePath, "utf8");

// Replace all `tempuse.*` placeholders with Vercel environment variables
config = config.replace(/tempuse\.([A-Z0-9_]+)/g, (_, key) => {
    const value = process.env[key] || "[NOT SET]";
    console.log(`Replacing ${key} with ${value !== "[NOT SET]" ? "[SET]" : "[NOT SET]"}`);
    return value;
});

// Write the new `config.js` file
fs.writeFileSync(configPath, config, "utf8");

console.log("✅ Secret Keys successfully replaced in config.js!");
