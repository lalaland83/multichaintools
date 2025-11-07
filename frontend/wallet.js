async function connectWallet() {
    console.log("🔹 connectWallet() gestartet!");

    if (!window.ethereum) {
        console.log("❌ MetaMask nicht gefunden!");
        document.getElementById("walletAddress").innerText = "❌ MetaMask not found!";
        return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);

    try {
        accounts = await provider.send("eth_requestAccounts", []);  

        if (accounts.length === 0) {
            console.log("❌ Keine Accounts verfügbar!");
            document.getElementById("walletAddress").innerText = "❌ No account connected";
            return;
        }

        signer = provider.getSigner();
        connectedWalletAddress = await signer.getAddress();

        console.log("✅ Wallet verbunden:", connectedWalletAddress);

        document.getElementById("walletAddress").innerText = `✅ Connected: ${connectedWalletAddress}`;
        document.getElementById("connectWallet").innerText = "Disconnect";
        document.getElementById("connectWallet").onclick = disconnectWallet;

        // 💾 **Persistente Speicherung in localStorage**
        localStorage.setItem("walletConnected", "true");
        localStorage.setItem("connectedWalletAddress", connectedWalletAddress);
        console.log("💾 walletConnected gespeichert:", localStorage.getItem("walletConnected"));

        if (document.getElementById("gmPage")) {
            await renderChainButtons();
        }

        await updateWalletUI();
    } catch (error) {
        console.error("⚠️ Fehler beim Verbinden mit der Wallet:", error);
        document.getElementById("walletAddress").innerText = "❌ Connection failed";
    }
}






async function switchToChain(chainId) {
    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: contracts[chainId].chainIdHex }],
        });

        // Entferne "✅ Switched!" von allen Chains
        document.querySelectorAll("[id^='status-']").forEach(el => {
            if (el.textContent.includes("✅ Switched!")) {
                el.textContent = "Waiting for action...";
            }
        });

        // Setze die neue Chain als "✅ Switched!"
        document.getElementById(`status-${chainId}`).innerText = "✅ Switched!";

        setTimeout(async () => {
            await checkCurrentChain();
        }, 1000);
    } catch (error) {
        document.getElementById(`status-${chainId}`).innerText = "❌ Failed to switch chain!";
        console.error(error);
        setTimeout(checkCurrentChain, 500);
    }
}


async function disconnectWallet() {
    console.log("🚫 Wallet wird getrennt...");

    document.getElementById("walletAddress").innerText = "Not connected";
    document.getElementById("connectWallet").innerText = "🦊 Connect Wallet";
    document.getElementById("connectWallet").onclick = connectWallet;

    // 🌓 **Dark Mode Status sichern**
    const isDarkMode = localStorage.getItem("darkMode") === "enabled";

    // **Nur Wallet-Daten löschen, Dark Mode behalten**
    console.log("🗑️ Lösche Wallet-Daten aus localStorage...");
    Object.keys(localStorage).forEach(key => {
        if (key !== "darkMode" && key !== "cachedPositions" && key !== "selectedNetworkUniswap") {
            console.log(`🔹 Entferne ${key}`);
            localStorage.removeItem(key);
        }
    });
    
    // **Dark Mode erneut setzen, falls aktiv**
    if (isDarkMode) {
        localStorage.setItem("darkMode", "enabled");
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
    // **MetaMask Disconnect (falls unterstützt)**
    if (window.ethereum && window.ethereum.disconnect) {
        try {
            await window.ethereum.disconnect();
            console.log("✅ MetaMask session disconnected.");
        } catch (err) {
            console.error("⚠️ Fehler beim Disconnect:", err);
        }
    }

    // **Wallet-Berechtigungen widerrufen, um Auto-Connect zu verhindern**
    if (window.ethereum) {
        try {
            await window.ethereum.request({
                method: "wallet_revokePermissions",
                params: [{ eth_accounts: {} }]
            });
            console.log("✅ Wallet-Berechtigungen erfolgreich widerrufen.");
        } catch (err) {
            console.warn("⚠️ Konnte Wallet-Berechtigungen nicht widerrufen:", err);
        }
    }

    // **Ethereum-Provider hard reset**
    signer = null;
    provider = null;

    // **Alle Buttons auf der GM-Seite deaktivieren**
    if (document.getElementById("gmPage")) {
        document.querySelectorAll("#gmPage button").forEach(button => {
            button.innerText = "⏳ Connect wallet first";
            button.disabled = true;
            button.onclick = null;
        });
        console.log("✅ Alle GM-Buttons deaktiviert.");
    }


    console.log("🔄 UI aktualisieren...");
    updateWalletUI();  

    console.log("✅ Wallet erfolgreich disconnected.");

    setTimeout(() => {
        window.location.reload();  // 🚀 Refresh nach Disconnect
    }, 1);

}




function updateWalletUI() {
    const isConnected = connectedWalletAddress !== null;

    // Alle Connect-Buttons aktualisieren
    document.querySelectorAll("#connectWallet").forEach(button => {
        button.innerText = isConnected ? "Disconnect" : "🦊 Connect Wallet";
        button.onclick = isConnected ? disconnectWallet : connectWallet;
    });

    // Alle Wallet-Adressen aktualisieren
    document.querySelectorAll("#walletAddress").forEach(el => {
        el.innerText = isConnected ? `✅ Connected: ${connectedWalletAddress}` : "Not connected";
    });
    updateStatsButtonsState();

  //  console.log("🔄 updateWalletUI() ausgeführt!", { connectedWalletAddress });
}


function updateStatsButtonsState() {
    const isConnected = !!connectedWalletAddress;
    
    document.getElementById("totalStatsButton").disabled = !isConnected;
    document.getElementById("refreshStatsButton").disabled = !isConnected;
}



