const positionManagerAbi = window.ABI.UNISWAP.POSITION_MANAGER;
const factoryAbi = window.ABI.UNISWAP.FACTORY;

let selectedChain = localStorage.getItem("selectedNetworkUniswap") || "BASE";

let allCachedPositions = JSON.parse(localStorage.getItem("cachedPositions")) || [];
let cachedPositions = allCachedPositions.filter(p => p.chain === selectedChain);



// 🔹 Falls "all" → Standard-Chain setzen!
if (selectedChain === "all") {
    console.warn("⚠️ 'all' ist keine einzelne Chain. Standard-Provider wird verwendet.");
    selectedChain = "BASE"; // Oder eine andere bevorzugte Chain
}

// 🔹 RPC-URL abrufen & Provider initialisieren
let rpcUrl = window.CONFIG.RPC[selectedChain] || null;
let rpcProvider = null;
let positionManager = null;
let factoryContract = null;

if (!rpcUrl) {
    console.error("❌ Kein gültiger RPC-Provider gefunden für", selectedChain);
} else {
    rpcProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
}

// 🔹 Position Manager abrufen & initialisieren
let positionManagerAddress = window.CONFIG.UNISWAP[selectedChain]?.NONFUNGIBLE_POSITION_MANAGER || null;
if (positionManagerAddress && rpcProvider) {
    positionManager = new ethers.Contract(positionManagerAddress, positionManagerAbi, rpcProvider);
} else {
    console.error("❌ Position Manager konnte nicht initialisiert werden.");
}

// 🔹 Factory Contract abrufen & initialisieren
let factoryAddress = window.CONFIG.UNISWAP[selectedChain]?.FACTORY || null;
if (factoryAddress && rpcProvider) {
    factoryContract = new ethers.Contract(factoryAddress, factoryAbi, rpcProvider);
} else {
    console.error("❌ Kein gültiger Factory-Contract für", selectedChain);
}





async function getTokenPositions(selectedChain = "all", forceRefresh = false) {
    if (!forceRefresh) {
        const cached = getCachedPositions();
        if (cached) {
            console.log("🔄 Verwende gecachte Positionen aus LocalStorage");
            return cached;
        }
    }

    console.log(`🔄 Lade Positionen von The Graph für: ${selectedChain.toUpperCase()}...`);

    let allPositions = [];
    const networks = window.CONFIG.GRAPH.NETWORKS;

    // Falls "all" gewählt wurde, durchlaufe alle Chains
    let chainsToQuery = selectedChain === "all" ? Object.keys(networks) : [selectedChain];

    for (const chain of chainsToQuery) {
        const graphId = networks[chain];

        if (!graphId) {
            console.warn(`⚠️ Keine Graph-ID für ${chain} gefunden.`);
            continue;
        }

        console.log(`🌐 Abruf für ${chain} (Graph ID: ${graphId})...`);

        const query = `{
                    positions(where: { owner: "${connectedWalletAddress.toLowerCase()}", liquidity_gt: "1" }) {
                        id
                        token0 { symbol decimals id }
                        token1 { symbol decimals id }
                        pool { sqrtPrice }
                        transaction { timestamp }
                        liquidity                    
                    }
                }`;

        try {
            const response = await fetch(`https://gateway.thegraph.com/api/${window.CONFIG.GRAPH.GRAPH_API_KEY}/subgraphs/id/${graphId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query })
            });

            const data = await response.json();
            if (!data || !data.data || !data.data.positions) {
                console.warn(`⚠️ Keine Positionen gefunden für ${chain}`);
                continue;
            }

            // 🟢 Positionen mit Chain-Tag speichern
            const positionsWithChain = data.data.positions.map(pos => ({
                ...pos,
                chain  // Neue Eigenschaft hinzufügen
            }));

            allPositions.push(...positionsWithChain);

        } catch (error) {
            console.error(`❌ Fehler beim Abruf der Positionen für ${chain}:`, error);
        }
    }

    console.log("✅ Positionen erfolgreich geladen:", allPositions);

    localStorage.setItem("cachedPositions", JSON.stringify(allPositions)); // 🔥 Multichain speichern

    return allPositions;
}


async function getPoolAddress(token0, token1, fee) {
    try {
        console.log(`🔍 Hole Pool-Adresse für Token0: ${token0}, Token1: ${token1}, Fee: ${fee}`);

        const poolAddress = await factoryContract.getPool(token0, token1, fee);
        console.log(`✅ Gefundene Pool-Adresse: ${poolAddress}`);

        if (poolAddress === "0x0000000000000000000000000000000000000000") {
            throw new Error("Pool existiert nicht.");
        }

        return poolAddress;
    } catch (error) {
        console.error(`❌ Fehler beim Abrufen der Pool-Adresse für Token0: ${token0}, Token1: ${token1}, Fee: ${fee}:`, error);
        return null;
    }
}

function getAge(timestamp) {
    const now = Math.floor(Date.now() / 1000);
    const ageInSeconds = now - timestamp;
    const ageInDays = Math.floor(ageInSeconds / 86400);
    const ageInHours = Math.floor((ageInSeconds % 86400) / 3600);
    return ageInDays > 0 ? `${ageInDays} days` : `${ageInHours} hours`;
}


const userLocale = navigator.language || "en-US";

function formatNumber2(num, decimals = 0) {
    return Number(num).toLocaleString(userLocale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

function tickToPrice(tick) {
    return Math.pow(1.0001, tick);
}

function calculateTokenAmounts(liquidity, sqrtPrice, tickLower, tickUpper, decimals0, decimals1) {
    const sqrtPriceLower = Math.sqrt(tickToPrice(tickLower));
    const sqrtPriceUpper = Math.sqrt(tickToPrice(tickUpper));
    const sqrtPriceCurrent = sqrtPrice / (2 ** 96);

    let amount0 = 0;
    let amount1 = 0;

    if (sqrtPriceCurrent <= sqrtPriceLower) {
        amount0 = liquidity * ((1 / sqrtPriceLower) - (1 / sqrtPriceUpper));
    } else if (sqrtPriceCurrent >= sqrtPriceUpper) {
        amount1 = liquidity * (sqrtPriceUpper - sqrtPriceLower);
    } else {
        amount0 = liquidity * ((1 / sqrtPriceCurrent) - (1 / sqrtPriceUpper));
        amount1 = liquidity * (sqrtPriceCurrent - sqrtPriceLower);
    }

    return {
        token0: amount0 / (10 ** decimals0),
        token1: amount1 / (10 ** decimals1)
    };
}


async function simulateCollect(positionId) {
    try {
        // 1️⃣ Prüfen, ob gecachte Positionen existieren
        const positionsToSearch = selectedChain === "all" ? allCachedPositions : cachedPositions;

        if (!Array.isArray(positionsToSearch)) {
            throw new Error("❌ Positionen sind nicht geladen oder kein Array!");
        }

        // 2️⃣ Token-Infos abrufen
        const pos = positionsToSearch.find(p => p.id === positionId);
        console.log(`🔍 Suche Position ${positionId} in:`, positionsToSearch);

        if (!pos) {
            throw new Error(`❌ Position ${positionId} nicht im Cache gefunden!`);
        }

        // 3️⃣ Stelle sicher, dass der PositionManager für die richtige Chain verwendet wird
        // let chainIdUni = pos.chain;
        updatePositionManager(pos.chain);

        if (!positionManager) {
            throw new Error(`❌ Position Manager konnte nicht für Chain ${chainIdUni} aktualisiert werden!`);
        }


        // 3️⃣ Position-Daten abrufen
        const position = await positionManager.positions(positionId);
        console.log(`ℹ️ Position ${positionId} (Chain: ${pos.chain}):`, position);



        // 3️⃣ Simulationsparameter
        const MAX_UINT128 = ethers.BigNumber.from("340282366920938463463374607431768211455");

        const params = {
            tokenId: positionId,
            recipient: "0x0000000000000000000000000000000000000000", // Dummy-Adresse, weil es nur eine Simulation ist!
            amount0Max: MAX_UINT128,
            amount1Max: MAX_UINT128
        };

        // 4️⃣ `callStatic.collect` ausführen (Simulation)
        const feesGenerated = await positionManager.callStatic.collect(params);

        // 5️⃣ Konvertieren in lesbare Zahlen
        const fees0 = ethers.utils.formatUnits(feesGenerated.amount0, pos.token0.decimals);
        const fees1 = ethers.utils.formatUnits(feesGenerated.amount1, pos.token1.decimals);

        console.log(`✅ Simulierte Collect-Werte für Position ${positionId}:`);
        console.log(`- ${fees0} ${pos.token0.symbol}`);
        console.log(`- ${fees1} ${pos.token1.symbol}`);

        return {
            positionId,
            token0: pos.token0.symbol,
            token1: pos.token1.symbol,
            totalFees0: fees0,
            totalFees1: fees1
        };
    } catch (error) {
        console.error(`❌ Fehler bei der Collect-Simulation für Position ${positionId}:`, error);
        return null;
    }
}


async function getUniData() {
    let Unipositions;

    if (selectedNetwork === "all") {
        console.log("⚡ Lade ALLE Chains...");
        Unipositions = allCachedPositions; // ✅ Alle Positionen laden
    } else {
        console.log(`⚡ Lade Positionen für ${selectedNetwork}...`);
        Unipositions = getCachedPositions(); // ❗ Holt nur die gewählte Chain
    }

    if (!Unipositions || Unipositions.length === 0) {
        console.log("⚠️ Keine gecachten Positionen gefunden. Lade von The Graph...");
        Unipositions = await getTokenPositions(true);
        if (!Unipositions || Unipositions.length === 0) {
            console.log("❌ Keine Positionen gefunden.");
            return;
        }
        localStorage.setItem("cachedPositions", JSON.stringify(Unipositions));
    }

    Unipositions.forEach(pos => {
        pos.status = pos.status || "⚡ Updating...";
        pos.liquidityUSD = pos.liquidityUSD ?? 0;
        pos.tokenAmounts = pos.tokenAmounts ?? { token0: 0, token1: 0 };
        pos.priceToken0 = pos.priceToken0 ?? 0;
        pos.priceToken1 = pos.priceToken1 ?? 0;
        pos.fees0 = pos.fees0 ?? 0;
        pos.fees1 = pos.fees1 ?? 0;
    });
    mergeStoredPositions(Unipositions);
    renderStoredPositionsTable();

    for (const pos of Unipositions) {
        try {
            updatePositionManager(pos.chain);
            const position = await positionManager.positions(pos.id);
            const sqrtPrice = ethers.BigNumber.from(pos.pool.sqrtPrice);
            const liquidity = ethers.BigNumber.from(position.liquidity);
            const tickLower = Number(position.tickLower);
            const tickUpper = Number(position.tickUpper);

            const tokenAmounts = calculateTokenAmounts(
                liquidity,
                sqrtPrice,
                tickLower,
                tickUpper,
                pos.token0.decimals,
                pos.token1.decimals
            );

            const priceToken0 = await getTokenPrice(pos.token0.id, pos.chain);
            const priceToken1 = await getTokenPrice(pos.token1.id, pos.chain);

            const liquidityUSD = (tokenAmounts.token0 * priceToken0) + (tokenAmounts.token1 * priceToken1);

            const collectResult = await simulateCollect(pos.id);
            let fees0 = 0, fees1 = 0;
            if (collectResult) {
                fees0 = parseFloat(collectResult.totalFees0);
                fees1 = parseFloat(collectResult.totalFees1);
            }

            pos.liquidityUSD = liquidityUSD;
            pos.tokenAmounts = tokenAmounts;
            pos.priceToken0 = priceToken0;
            pos.priceToken1 = priceToken1;
            pos.fees0 = fees0;
            pos.fees1 = fees1;

            // ✅ Status auf "Updated" setzen
            pos.status = "✅ Updated";
            pos.lastUpdated = Math.floor(Date.now() / 1000); // Aktueller Unix-Timestamp in Sekunden
        } catch (error) {
            console.error(`❌ Fehler bei Position ${pos.id}:`, error);
            pos.status = "❌ Error";
        }

        // 🔥 Nach jeder Position den Storage aktualisieren
        mergeStoredPositions(Unipositions);
        renderStoredPositionsTable(); // Direktes Update der Anzeige
    }
}


function checkStaleStatus() {
    let positions = getStoredPositions();
    let now = Math.floor(Date.now() / 1000); // Aktueller Unix-Timestamp

    positions.forEach(pos => {
        let age = now - pos.lastUpdated;
        //       let statusElement = document.getElementById(`status-${pos.id}`);

        if (age > 600) { // 🔥 Falls älter als 10 Minuten (600 Sekunden)
            pos.status = "⚠️ Stale";
            //        statusElement.innerHTML = "⚠️"; 
            //        statusElement.style.color = "orange";
        }
    });

    mergeStoredPositions(positions);
}


const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.target.style.display !== "none") {
            console.log("🚀 Uniswap-Seite sichtbar → Timestamps setzen!");

            let positions = JSON.parse(localStorage.getItem("storedPositionData")) || [];

            positions.forEach(pos => {
                let statusElement = document.getElementById(`status-${pos.id}`);
                if (statusElement) {
                    statusElement.setAttribute("data-timestamp", `${getRelativeTime(pos.lastUpdated)}`);
                }
            });
        }
    });
});


function setTimestampsOnStatusElements() {
    let positions = JSON.parse(localStorage.getItem("storedPositionData")) || [];

    positions.forEach(pos => {
        let statusElement = document.getElementById(`status-${pos.id}`);
        if (statusElement) {
            let relativeTime = getRelativeTime(pos.lastUpdated);
            statusElement.setAttribute("data-timestamp", relativeTime);
            //            console.log(`✅ Timestamp gesetzt für ${pos.id}: ${relativeTime}`); // 🔥 Debug
        } else {
            //            console.warn(`⚠️ Status-Element nicht gefunden für ${pos.id}`);
        }
    });

    console.log("✅ Timestamps neu gesetzt!");
}


// Startet das Beobachten der Uniswap-Seite
observer.observe(document.getElementById("uniswapPage"), { attributes: true, attributeFilter: ["style"] });

function getRelativeTime(timestamp) {
    let now = Math.floor(Date.now() / 1000);
    let diff = now - timestamp; // Zeitdifferenz in Sekunden

    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) {
        let hours = Math.floor(diff / 3600);
        let minutes = Math.floor((diff % 3600) / 60);
        return minutes > 0 ? `${hours}h ${minutes}m ago` : `${hours}h ago`;
    }

    let days = Math.floor(diff / 86400);
    let hours = Math.floor((diff % 86400) / 3600);
    let minutes = Math.floor((diff % 3600) / 60);

    return (hours > 0 || minutes > 0)
        ? `${days} day ${hours}h ${minutes}m ago`
        : `${days} day ago`;
}


async function getTokenPrice(tokenAddress, unichain) {
    try {
        // 🔹 1️⃣ Aktuelle Chain holen (Standard: BASE)
        //     const selectedChain = localStorage.getItem("selectedNetworkUniswap") || "BASE";
        let cacheKey = `coingecko_cache_${unichain}`;

        // 🔹 2️⃣ Cache abrufen
        cachedData = JSON.parse(localStorage.getItem(cacheKey)) || {};
        let cachedToken = cachedData[tokenAddress.toLowerCase()];

        // 🔹 3️⃣ Falls Token im Cache & nicht älter als 1 Stunde → Rückgabe
        if (cachedToken && Date.now() - cachedToken.timestamp < window.CONFIG.COINGECKO.cacheDuration) {
            console.log(`✅ Preis aus Cache für ${tokenAddress} auf ${unichain}: ${cachedToken.price} USD`);
            return cachedToken.price;
        }

        // 🔹 4️⃣ API-URL für CoinGecko basierend auf der Chain erstellen
        const chainMapping = {
            BASE: "base",
            OPTIMISM: "optimistic-ethereum",
            ARBITRUM: "arbitrum-one",
            BSC: "binance-smart-chain",
            AVALANCHE: "avalanche",
            CELO: "celo",
            POLYGON: "polygon-pos",
            ETHEREUM: "ethereum",
            BLAST: "blast"
        };

        let coingeckoChain = chainMapping[unichain] || "base"; // Falls Chain nicht bekannt, BASE nutzen

        let response = await fetch(`https://api.coingecko.com/api/v3/simple/token_price/${coingeckoChain}?contract_addresses=${tokenAddress}&vs_currencies=usd&x_cg_demo_api_key=${window.CONFIG.COINGECKO.coingecko_apiKey}`);
        let data = await response.json();

        // 🔹 5️⃣ Preis speichern, falls vorhanden
        let price = data[tokenAddress.toLowerCase()]?.usd || 0;

        // 🔹 6️⃣ Neuen Preis im Cache speichern
        cachedData[tokenAddress] = { price, timestamp: Date.now() };
        localStorage.setItem(cacheKey, JSON.stringify(cachedData));

        console.log(`🔄 Neuer Preis für ${tokenAddress} auf ${unichain}: ${price} USD`);
        return price;

    } catch (error) {
        console.error(`❌ Fehler beim Abrufen des Preises für ${tokenAddress} auf ${unichain}:`, error);
        return 0;
    }
}


function sortTable(columnIndex, isNumeric = false) {
    const tbody = document.getElementById("positionsTableBody");
    const rows = Array.from(tbody.getElementsByTagName("tr"));
    const sortIcon = document.getElementById(`sortIcon${columnIndex}`);

    // Sortierrichtung umschalten
    const isAscending = !sortIcon.dataset.order || sortIcon.dataset.order === "desc";
    sortIcon.dataset.order = isAscending ? "asc" : "desc";
    sortIcon.textContent = isAscending ? "↓" : "↑";

    // Sortieren
    rows.sort((rowA, rowB) => {
        let cellA = rowA.cells[columnIndex]?.textContent.trim() || "0";
        let cellB = rowB.cells[columnIndex]?.textContent.trim() || "0";

        // 🔹 Erkennen, ob Zahl ein Komma oder Punkt als Dezimaltrenner hat
        const usesComma = cellA.includes(",") && !cellA.includes(".");

        // 🔹 Entferne Währungssymbole und Tausendertrennzeichen
        cellA = cellA.replace(/[^0-9,.-]/g, ""); // Entferne alles außer Zahlen, Komma, Punkt, Minus
        cellB = cellB.replace(/[^0-9,.-]/g, "");

        // 🔹 Falls Komma als Dezimaltrenner genutzt wird, ersetze es mit einem Punkt
        if (usesComma) {
            cellA = cellA.replace(",", ".");
            cellB = cellB.replace(",", ".");
        } else {
            cellA = cellA.replace(/,/g, ""); // Entferne Tausendertrennzeichen (z.B. `1,234.56`)
            cellB = cellB.replace(/,/g, "");
        }

        console.log(`🔍 Sortiere Spalte ${columnIndex}:`, cellA, cellB); // Debugging

        if (isNumeric) {
            const numA = parseFloat(cellA) || 0;
            const numB = parseFloat(cellB) || 0;
            return isAscending ? numA - numB : numB - numA;
        } else {
            return isAscending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
        }
    });

    // Neue Reihenfolge einfügen
    rows.forEach(row => tbody.appendChild(row));
}



async function getPositions() {
    console.log("🔄 Hole neue Positionen von The Graph...");

    selectedChain = localStorage.getItem("selectedNetworkUniswap") || "all"; // 🔹 Gewählte Chain laden
    const positions = await getTokenPositions(selectedChain, true); // 🔥 Mit gewählter Chain abrufen

    if (positions.length === 0) {
        console.log("⚠️ Keine Positionen gefunden.");
        return;
    }

    localStorage.setItem("cachedPositions", JSON.stringify(positions)); // 🔥 Speichern im Cache
    displayCachedPools();           // Tabelle sofort aktualisieren
    console.log("✅ Positionen erfolgreich gecached!");
}



function getCachedPositions() {
    cachedData = localStorage.getItem("cachedPositions");
    if (!cachedData) return null;

    allCachedPositions = JSON.parse(cachedData);
    selectedChain = localStorage.getItem("selectedNetworkUniswap") || "BASE";

    if (selectedChain === "all") {
        console.log("📌 Alle gecachten Positionen (ALL):", allCachedPositions);
        return allCachedPositions; // ✅ Kein Filter, wenn "all" aktiv ist
    }

    console.log("📌 Alle gecachten Positionen (gefiltert):", allCachedPositions.filter(p => p.chain === selectedChain));
    console.log("📌 Aktuelle Chain:", selectedChain);
    return allCachedPositions.filter(p => p.chain === selectedChain);
}



const networks = {
    uniswap: [
        { id: "all", name: "All Networks" },
        { id: "ETHEREUM", name: "Ethereum" },
        { id: "POLYGON", name: "Polygon" },
        { id: "ARBITRUM", name: "Arbitrum" },
        { id: "OPTIMISM", name: "Optimism" },
        { id: "BASE", name: "Base" },
        { id: "BSC", name: "BSC" },
        { id: "BLAST", name: "Blast" },
        { id: "AVALANCHE", name: "Avalanche" },
        { id: "CELO", name: "Celo" }

    ]
};

// HTML-Elemente
const networkButton = document.getElementById("networkButton");
const networkList = document.getElementById("networkList");

// 🔹 Aktuelle Auswahl aus LocalStorage laden
selectedNetwork = localStorage.getItem("selectedNetworkUniswap") || "all";

// 🟢 Dropdown-Status verwalten
let isDropdownOpen = false;

// 🔹 Dropdown öffnen/schließen
networkButton.addEventListener("click", () => {
    isDropdownOpen = !isDropdownOpen;
    networkList.style.display = isDropdownOpen ? "block" : "none";
});

// 🔹 Netzwerkliste füllen
function updateNetworkList() {
    networkList.innerHTML = "";
    networks.uniswap.forEach(network => {
        const li = document.createElement("li");
        li.textContent = network.name;

        // ✅ Markierte Auswahl
        if (network.id === selectedNetwork) {
            li.classList.add("selected");
        }

        li.addEventListener("click", () => {
            selectedNetwork = network.id;
            localStorage.setItem("selectedNetworkUniswap", selectedNetwork);
            networkButton.innerHTML = `🌐 ${network.name}`;
            networkList.style.display = "none"; // 🔥 Dropdown schließen
            isDropdownOpen = false;

            //           updatePositionManager();  // 🔄 Stelle sicher, dass der richtige Position Manager geladen wird

            if (selectedNetwork === "all") {
                cachedPositions = allCachedPositions; // ✅ Alle Positionen laden
            } else {
                cachedPositions = getCachedPositions(); // ❗ Holt die neuesten Positions-Daten
                updatePositionManager(network.id);  // 🔄 Stelle sicher, dass der richtige Position Manager geladen wird

            }
            console.log("🔄 Cached Positions nach Chain-Wechsel:", cachedPositions);

            // Optional: Direkt neue Tabelle rendern
            renderStoredPositionsTable();
        });

        networkList.appendChild(li);
    });
}

// 🟢 Setze den Button auf die gespeicherte Auswahl
const selectedNetworkObj = networks.uniswap.find(n => n.id === selectedNetwork);
if (selectedNetworkObj) {
    networkButton.innerHTML = `🌐 ${selectedNetworkObj.name}`;
}

// Liste initial befüllen
updateNetworkList();

function displayCachedPools() {
    console.log("🔄 Lade gespeicherte Pool-Positionen...");

    storedPositions = localStorage.getItem("cachedPositions");
    if (!storedPositions) {
        console.log("❌ Keine gespeicherten Positionen gefunden.");
        return;
    }

    let positions = JSON.parse(storedPositions);
    let tableBody = document.getElementById("positionsTableBody");

    // **Tabelle leeren**
    tableBody.innerHTML = "";

    positions.forEach(pos => {
        let row = tableBody.insertRow();
        //**Spalte 1: Status 
        let statusCell = row.insertCell(0);

        // **Spalte 2: Pair**
        let pairCell = row.insertCell(1);
        pairCell.innerHTML = `<strong>${pos.token0.symbol} / ${pos.token1.symbol}</strong><br>
                              <span style="font-size: 12px; color: gray;">${pos.chain}, Position ${pos.id}</span>`;
        pairCell.style.textAlign = "left";


    });

    console.log("✅ Gespeicherte Pools angezeigt!");
}


function updatePositionManager(network) {
    const rpcUrl = window.CONFIG.RPC[network] || null;
    const positionManagerAddress = window.CONFIG.UNISWAP[network]?.NONFUNGIBLE_POSITION_MANAGER || null;

    if (rpcUrl && positionManagerAddress) {
        rpcProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
        positionManager = new ethers.Contract(positionManagerAddress, positionManagerAbi, rpcProvider);
        console.log("🔄 Position Manager aktualisiert für:", network);
    } else {
        console.error("❌ Position Manager konnte nicht aktualisiert werden für:", network);
    }
}



function updatePositionsSummary() {
    const positions = JSON.parse(localStorage.getItem("cachedPositions")) || [];
    const chainCounts = {};

    positions.forEach(pos => {
        chainCounts[pos.chain] = (chainCounts[pos.chain] || 0) + 1;
    });

    const totalPositions = positions.length;
    const totalChains = Object.keys(chainCounts).length;
    const chainSummary = Object.entries(chainCounts)
        .map(([chain, count]) => `${count}x ${chain}`)
        .join("\n"); // 🚀 Jede Chain in eine neue Zeile setzen

    const summaryElement = document.getElementById("positionsSummary");
    summaryElement.textContent = `My Uniswap Positions - ${totalPositions} Positions on ${totalChains} Chains`;
    summaryElement.setAttribute("data-hover", chainSummary);
}


// 🚀 Beim Laden der Seite ausführen
// document.addEventListener("DOMContentLoaded", updatePositionsSummary);


async function uniCollect(positionId, chain) {
    try {
        console.log(`🔄 Claiming Fees für Position ${positionId} auf ${chain}...`);

        // 1️⃣ Sicherstellen, dass wir auf der richtigen Chain sind
        await switchToChainUni(chain);


        // 2️⃣ Signer holen
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();

        // 2️⃣ Position Manager des Netzwerks holen
        const positionManagerAddressclaim = window.CONFIG.UNISWAP[chain]?.NONFUNGIBLE_POSITION_MANAGER;
        if (!positionManagerAddressclaim) {
            console.error(`❌ Kein Position Manager für ${chain} gefunden.`);
            return;
        }

        // 3️⃣ Position Manager Contract mit Signer verbinden
        const positionManagerclaim = new ethers.Contract(positionManagerAddressclaim, positionManagerAbi, signer);

        // 4️⃣ Claim-Parameter definieren
        const params = {
            tokenId: positionId,
            recipient: accounts[0], // Nutzt die bereits definierte Wallet-Adresse
            amount0Max: ethers.BigNumber.from("340282366920938463463374607431768211455"),
            amount1Max: ethers.BigNumber.from("340282366920938463463374607431768211455")
        };

        // 5️⃣ Transaktion senden
        const tx = await positionManagerclaim.collect(params);
        console.log(`⏳ Claiming gestartet: ${tx.hash}`);
        await tx.wait();
        console.log(`✅ Claiming erfolgreich abgeschlossen!`);

    } catch (error) {
        console.error(`❌ Fehler beim Claiming:`, error);
    }
}




async function switchToChainUni(chainName) {
    console.log(`🔄 Wechsel zu Uniswap-Chain: ${chainName}`);

    // Mapping von Chain-Namen zu den Hex-IDs
    const chainIdMapping = {
        BASE: "0x2105",
        OPTIMISM: "0xa",
        ARBITRUM: "0xa4b1",
        BSC: "0x38",
        AVALANCHE: "0xa86a",
        CELO: "0xa4ec",
        POLYGON: "0x89",
        ETHEREUM: "0x1",
        BLAST: "0x13e31"
    };

    // Prüfen, ob die Chain existiert
    const chainIdHex = chainIdMapping[chainName.toUpperCase()];
    if (!chainIdHex) {
        console.error(`❌ Unbekannte Chain: ${chainName}`);
        return;
    }

    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: chainIdHex }],
        });

        console.log(`✅ Erfolgreich zu Chain ${chainName} gewechselt!`);

        setTimeout(async () => {
            await checkCurrentChain();
        }, 1000);

    } catch (error) {
        console.error(`❌ Fehler beim Wechseln der Uniswap-Chain ${chainName}:`, error);
    }
}


// 🔹 Ruft gespeicherte Positionen aus dem localStorage ab
function getStoredPositions() {
    let stored = localStorage.getItem("storedPositionData");
    selectedNetwork = localStorage.getItem("selectedNetworkUniswap");

    if (!stored) return []; // Falls keine gespeicherten Daten existieren

    let positions = JSON.parse(stored);

    // Falls "all" ausgewählt wurde, alle Positionen zurückgeben
    if (selectedNetwork === "all") {
        return positions;
    }

    // ✅ Nur Positionen für das aktuelle Netzwerk zurückgeben
    return positions.filter(pos => pos.chain === selectedNetwork);
}

// 🔹 Rendert die gespeicherten Positionen aus dem Storage
function renderStoredPositionsTable() {
    let tbody = document.getElementById("positionsTableBody");
    tbody.innerHTML = ""; // Alte Einträge entfernen

    let Storedpositions = getStoredPositions();

    Storedpositions.forEach(pos => {
        let row = tbody.insertRow();

        // Status-Farben definieren
        let statusColor = "gray"; // Standard

        if (pos.status === "✅ Done") statusColor = "green";
        else if (pos.status === "⚡ Updating...") statusColor = "yellow";
        else if (pos.status === "❌ Error") statusColor = "red";

        // Spalte 1: Status-Anzeige (Ampel + Text)
        let statusCell = row.insertCell(0);
        statusCell.innerHTML = `<span class="status-indicator" id="status-${pos.id}" style="color: ${statusColor};">●</span> ${pos.status}`;

        // Spalte 2: Refresh Button
        let refreshCell = row.insertCell(1);
        refreshCell.innerHTML = `<button class="refresh-btn" <button onclick="console.log('ID:', ${pos.id}, 'Chain:', '${pos.chain}'); refreshSinglePosition(${pos.id}, '${pos.chain}', this)">↻</button>`;



        // Spalte 3: Pair
        let pairCell = row.insertCell(2);
        pairCell.innerHTML = `<strong>${pos.token0.symbol} / ${pos.token1.symbol}</strong><br>
                              <span style="font-size: 12px; color: gray;">${pos.chain}, Position ${pos.id}</span>`;
        pairCell.style.textAlign = "left";

        // Spalte 4: Age
        let ageCell = row.insertCell(3);
        ageCell.textContent = getAge(pos.transaction.timestamp);
        ageCell.style.textAlign = "center";

        // Spalte 5: Liquidity (USD)
        let liquidityUsdCell = row.insertCell(4);
        liquidityUsdCell.textContent = `$${pos.liquidityUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        liquidityUsdCell.style.textAlign = "center";

        // Spalte 6: Liquidity Details
        let liquidityTokensCell = row.insertCell(5);
        liquidityTokensCell.innerHTML = `<div class="centered"><strong>${pos.token0.symbol} / ${pos.token1.symbol}</strong><br>
          ${pos.tokenAmounts.token0.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} / 
          ${pos.tokenAmounts.token1.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} <br>
           <span style="font-size: 12px; color: gray;">$${(pos.tokenAmounts.token0 * pos.priceToken0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / 
           $${(pos.tokenAmounts.token1 * pos.priceToken1).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>`;

        // Spalte 7: Unclaimed Fees
        let feesCell = row.insertCell(6);
        feesCell.innerHTML = `<div class="centered"><strong>${pos.token0.symbol} / ${pos.token1.symbol}</strong><br>
           ${pos.fees0.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} / 
           ${pos.fees1.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} <br>
           <span style="font-size: 12px; color: gray;">$${(pos.fees0 * pos.priceToken0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / 
           $${(pos.fees1 * pos.priceToken1).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>`;

        // Spalte 8: Claim-Button
        let claimCell = row.insertCell(7);
        claimCell.innerHTML = `<button class="claim-button" onclick="uniCollect('${pos.id}', '${pos.chain}')">Claim Fees</button>`;
    });
    setTimestampsOnStatusElements(); // ⬅️ Timestamps aktualisieren

}

// 🔹 Funktion zum Laden von Positionen (erst aus Storage, dann aus The Graph)
function loadUniPositions() {
    storedPositions = getStoredPositions(); // Holt gespeicherte Positionen aus localStorage

    if (storedPositions.length > 0) {
        console.log("📂 Lade gespeicherte Positionen...");
        renderStoredPositionsTable();
    } else {
        console.log("⚠️ Keine gespeicherten Positionen gefunden. Bitte zuerst 'Get Positions' ausführen.");
    }
}

function mergeStoredPositions(newPositions) {
    console.log("🔵 mergeStoredPositions() gestartet...");

    // 🟢 Bestehende Positionen aus LocalStorage holen
    storedPositions = JSON.parse(localStorage.getItem("storedPositionData")) || [];
    console.log("📂 Geladene gespeicherte Positionen:", storedPositions);

    console.log("📥 Neue Positionen zum Mergen:", newPositions);

    // 🔄 Neue Positionen einfügen oder vorhandene aktualisieren
    newPositions.forEach(newPos => {
        let index = storedPositions.findIndex(pos => pos.id === newPos.id);

        if (index !== -1) {
            console.log(`♻️ Position ${newPos.id} aktualisiert.`);
            storedPositions[index] = newPos; // ✅ Existierende Position updaten
        } else {
            console.log(`➕ Neue Position ${newPos.id} hinzugefügt.`);
            storedPositions.push(newPos); // ➕ Neue Position hinzufügen
        }
    });

    // ✅ Aktualisierte Daten wieder speichern
    localStorage.setItem("storedPositionData", JSON.stringify(storedPositions));
    console.log("💾 LocalStorage aktualisiert. Neue gespeicherte Positionen:", storedPositions);
}


async function refreshSinglePosition(positionId, chain, btn) {

    btn.classList.add("rotating");

    try {

        let pos = JSON.parse(localStorage.getItem("storedPositionData")).find(p => Number(p.id) === Number(positionId) && p.chain === chain);
        console.log(`🔍 Gesuchte Position ID: ${positionId}, Chain: ${chain}`);
        console.log("📌 Gefundene Position:", pos);
        if (!pos) {
            console.log(`❌ Position ${positionId} nicht gefunden!`);
            btn.classList.remove("rotating");
            return;
        }

        updatePositionManager(chain);
        const position = await positionManager.positions(pos.id);
        const sqrtPrice = ethers.BigNumber.from(pos.pool.sqrtPrice);
        const liquidity = ethers.BigNumber.from(position.liquidity);
        const tickLower = Number(position.tickLower);
        const tickUpper = Number(position.tickUpper);

        const tokenAmounts = calculateTokenAmounts(
            liquidity,
            sqrtPrice,
            tickLower,
            tickUpper,
            pos.token0.decimals,
            pos.token1.decimals
        );

        const priceToken0 = await getTokenPrice(pos.token0.id, chain);
        const priceToken1 = await getTokenPrice(pos.token1.id, chain);

        const liquidityUSD = (tokenAmounts.token0 * priceToken0) + (tokenAmounts.token1 * priceToken1);

        const collectResult = await simulateCollect(pos.id);
        let fees0 = 0, fees1 = 0;
        if (collectResult) {
            fees0 = parseFloat(collectResult.totalFees0);
            fees1 = parseFloat(collectResult.totalFees1);
        }

        pos.liquidityUSD = liquidityUSD;
        pos.tokenAmounts = tokenAmounts;
        pos.priceToken0 = priceToken0;
        pos.priceToken1 = priceToken1;
        pos.fees0 = fees0;
        pos.fees1 = fees1;

        // ✅ Status & Timestamp aktualisieren
        pos.status = "✅ Updated";
        pos.lastUpdated = Math.floor(Date.now() / 1000); 

        // 🔥 Einzelne Position im Speicher aktualisieren
        mergeStoredPositions([pos]);
        console.log("🔍 Übergabe an mergeStoredPositions:", pos);

        // ✅ Nur diese Position im UI aktualisieren
        renderStoredPositionsTable();
    } catch (error) {
        console.error(`❌ Fehler bei Position ${positionId}:`, error);
    }

    btn.classList.remove("rotating");
}



