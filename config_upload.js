const fs = require("fs");

const TEMPLATE_FILE = "config.template.js"; 
const OUTPUT_FILE = "public/config.js"; 

let config = fs.readFileSync(TEMPLATE_FILE, "utf8");

config = config.replace(/tempuse\.([A-Z0-9_]+)/g, (match, varName) => {
    const envValue = process.env[varName] || "";
    console.log(`Ersetze ${match} mit ${envValue ? "[GESETZT]" : "[FEHLT]"}`);
    return `"${envValue}"`;
});

fs.writeFileSync(OUTPUT_FILE, config);
console.log("✅ Secret Keys DONE");
