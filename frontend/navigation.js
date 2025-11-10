function showPage(page) {
    // Alle Seiten ausblenden
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");

    // Die gewählte Seite anzeigen
    document.getElementById(page + "Page").style.display = "block";

    
    updateWalletUI(); // UI nach Seitenwechsel aktualisieren

    
    // Falls die "Blockchain Stats"-Seite geöffnet wird, Buttons generieren
    if (page === "blockchain_stats" && connectedWalletAddress) {
        setupBlockchainStats();
    }
}

