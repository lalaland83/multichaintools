// Dark Mode speichern & umschalten
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const isDarkMode = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
    document.getElementById("darkModeToggle").checked = isDarkMode;
}

// Adresse in die Zwischenablage kopieren
function copyToClipboard() {
    const address = "0x2E7520254060D925608E96CC7a1d43cC6C6d9383";
    navigator.clipboard.writeText(address)
        .then(() => alert("Address copied to clipboard!"))
        .catch(err => console.error("Failed to copy: ", err));
}
