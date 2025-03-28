const fs = require("fs");

// Read the template config file
let config = fs.readFileSync("public/config.template.js", "utf8");

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

// Save the modified config.js
fs.writeFileSync("public/config.js", config);

console.log(`✅ Secret Keys successfully replaced in config.js! (${replacedCount} replacements)`);
