async function initializePage() {
    console.log("🔹 initializePage() gestartet!");

    // **Dark Mode setzen**
    const isDarkMode = localStorage.getItem("darkMode") === "enabled";
    if (isDarkMode) document.body.classList.add("dark-mode");
    document.getElementById("darkModeToggle").checked = isDarkMode;

    console.log("🔎 Prüfe Wallet-Status...");
    console.log("🔎 localStorage walletConnected:", localStorage.getItem("walletConnected"));

    // 🔹 Aktuelle Auswahl aus LocalStorage laden oder Standardwert setzen
    if (!localStorage.getItem("selectedNetworkUniswap")) {
        localStorage.setItem("selectedNetworkUniswap", "all");
    }
    selectedNetwork = localStorage.getItem("selectedNetworkUniswap");




    let walletConnected = false; // Standardmäßig false

    // **Falls keine Wallet verbunden ist, Buttons deaktivieren**
    if (localStorage.getItem("walletConnected") !== "true") {
        console.log("🚫 Keine gespeicherte Wallet-Verbindung. Deaktiviere Buttons.");
        disableGMButtons();
        updateWalletUI();
        return;
    }

    // **Falls Wallet gespeichert war, prüfen**
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        accounts = await provider.listAccounts();

        console.log("🔎 Ethereum Accounts gefunden:", accounts);

        if (accounts.length > 0) {
            signer = provider.getSigner();
            connectedWalletAddress = await signer.getAddress();
            localStorage.setItem("connectedWalletAddress", connectedWalletAddress);
            walletConnected = true;
            console.log("✅ Wallet ist verbunden:", connectedWalletAddress);
        } else {
            console.log("🚫 Keine Accounts gefunden. Entferne Wallet-Daten.");
            connectedWalletAddress = null;
            localStorage.removeItem("walletConnected");
            localStorage.removeItem("connectedWalletAddress");
        }
    } else {
        console.log("❌ Kein Ethereum Provider gefunden.");
        connectedWalletAddress = null;
    }

    // **Falls keine Wallet verbunden ist, GM-Buttons deaktivieren**
    if (!walletConnected) {
        disableGMButtons();
    }



    updateWalletUI();
}





async function initializeProvider() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
    } else {
        console.error("❌ MetaMask not found!");
    }
}



window.onload = async () => {
    console.log("🔹 window.onload -> initializePage() läuft...");
    await initializePage();
    renderChainButtons();
    getStoredPositions();  // ✅ Gespeicherte Pool-IDs direkt anzeigen
    checkStaleStatus();
    renderStoredPositionsTable()
    await initializeProvider();

    if (connectedWalletAddress) {
        console.log("🔄 Wallet-Adresse wiederhergestellt:", connectedWalletAddress);
    } else {
        console.log("🔴 Keine gespeicherte Wallet-Adresse gefunden.");
    }
}


function disableGMButtons() {
    console.log("❌ disableGMButtons() aufgerufen!");
    if (document.getElementById("gmPage")) {
        document.querySelectorAll("#gmPage button").forEach(button => {
            button.innerText = "⏳ Connect wallet first";
            button.disabled = true;
            button.onclick = null;
        });
        console.log("✅ Alle GM-Buttons deaktiviert.");
    }
}


