function formatNumber(num, decimals = 0) {
    return Number(num).toLocaleString(userLocale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

const userLang = navigator.language || "en";
const formatter = new Intl.DateTimeFormat(userLang, { month: "short" });
const yearLabel = new Intl.DisplayNames([userLang], { type: "dateTimeField" }).of("year");

let localizedMonths = Array.from({ length: 12 }, (_, i) => formatter.format(new Date(2000, i, 1)));
let currentSortColumn = null;
let currentSort = { column: null, asc: true };
let blockchainTableData = []; // global für Sortierung


document.getElementById("refreshStatsButton").addEventListener("click", async () => {
    updateBlockchainStats();
});
document.getElementById("totalStatsButton").addEventListener("click", () => {
    totalSetupPopup();
});


// 🔧 Nur einmal definieren – außerhalb der Funktion
const headerMap = [
    { label: "Chain", key: "chain" },
    { label: "Total TX", key: "total_tx" },
    { label: "ERC-20 \n✉️", key: "erc20_sent_tx" },
    { label: "ERC-20 \n📥", key: "erc20_received_tx" },
    { label: "Unique \nNFTs ✉️", key: "erc721_sent" },
    { label: "Unique \nNFTs 📥", key: "erc721_unique_received" },
    { label: "Failed TX", key: "failed_tx" },
    { label: "Success \nRate", key: "success_rate" },
    { label: "First TX", key: "firsttxdate" },
    { label: "Last TX", key: "lasttxdate" },
    { label: "Most Active \nDay", key: "mostactiveday" },
    { label: "Most Active \nMonth", key: "mostactivemonth" },
    { label: "Streak", key: "currentstreak" },
    { label: "Longest \nStreak", key: "longeststreak" },
    { label: "Days \nUsed", key: "daysused" },
    { label: "Weeks \nUsed", key: "weeksused" },
    { label: "Months \nUsed", key: "monthsused" },
    { label: "Years \nUsed", key: "yearsused" }
];

async function setupBlockchainStats() {
    const container = document.getElementById("blockchain_statsPage");

    const existingTable = container.querySelector("table");
    if (existingTable) existingTable.remove();

    const table = document.createElement("table");
    table.classList.add("blockchain-stats-table");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    headerMap.forEach((header, index) => {
        const th = document.createElement("th");

        // 💡 Zentrierter Text + rechter Sort-Pfeil
        th.innerHTML = `
            <th>
            <div class="header-wrapper">
                <div class="header-text-wrapper">
                    <div class="header-text">${header.label.replace(/\n/g, "<br>")}</div>
                    <div class="sort-icon">↕</div>
                </div>
            </div>
            </th>
        `;



        th.style.cursor = "pointer";

        th.addEventListener("click", () => {
            if (currentSort.column === index) {
                currentSort.asc = !currentSort.asc;
            } else {
                currentSort.column = index;
                currentSort.asc = true;
            }

            sortTableByColumn(index, currentSort.asc);
            renderTableBody(table.querySelector("tbody"));
            updateSortIcons(thead, index, currentSort.asc);
        });

        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    table.appendChild(tbody);

    container.appendChild(table);

    await loadBlockchainStats(tbody);
}



async function loadBlockchainStats(tbody) {
    tbody.innerHTML = '';

    try {
        const response = await fetch(`/getBlockchainStats/${connectedWalletAddress}`);
        const result = await response.json();

        if (result.success) {
            sessionStorage.setItem(`blockchainStats_${connectedWalletAddress}`, JSON.stringify(result.data));
        } else {
            console.error("Error retrieving blockchain data:", result.message);
            return;
        }
    } catch (error) {
        console.error("❌ Error retrieving blockchain data:", error);
        return;
    }

    const allData = JSON.parse(sessionStorage.getItem(`blockchainStats_${connectedWalletAddress}`));
    const selectedChains = JSON.parse(localStorage.getItem("selectedNetworksStats") || "[]");

    blockchainTableData = selectedChains.map(key => {
        const chainInfo = CONFIG.chains[key];
        const data = allData.find(d => d.chain === chainInfo.name) || {};
        return { chain: chainInfo.name, ...data };
    });

    renderTableBody(tbody);
}


async function fetchBlockchainStats(chain) {


    const apiBase = getApiBase(chain.name.toLowerCase());
    const chainName = typeof chain === "object" ? chain.name : chain;


    const response = await fetch(`/api/proxy?chain=${chainName}&type=txlist&address=${connectedWalletAddress}`);
    const data = await response.json();

    const responseInternal = await fetch(`/api/proxy?chain=${chainName}&type=txlistinternal&address=${connectedWalletAddress}`);
    const dataInternal = await responseInternal.json();

    /*
    console.log("🛠 Full API Response:", data);
    console.log("🔍 Erste 10 txlist Einträge:", data.txlist.result.slice(0, 10));
    console.log("🔍 Erste 10 dataInternal Einträge:", dataInternal.txlistinternal.result.slice(0, 10));
*/


    if (
        !data.txlist || !Array.isArray(data.txlist.result) ||
        !data.txlistinternal || !Array.isArray(data.txlistinternal.result)
    ) {
        throw new Error("Invalid API response");
    }


    const transactions = data.txlist?.result ?? [];  // Use empty array if undefined
    const internalTransactions = dataInternal.txlistinternal?.result ?? [];  // Use empty array if undefined

    if (!Array.isArray(transactions)) {
        console.warn(`⚠️ 'transactions' is not an array for ${chain.name}.`);
        return;
    }

    if (!Array.isArray(internalTransactions)) {
        console.warn(`⚠️ 'internalTransactions' is not an array for ${chain.name}.`);
        return;
    }

    const allTransactions = [...transactions, ...internalTransactions];

    allTransactions.sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber));

    const sentTx = allTransactions.filter(tx => tx.from.toLowerCase() === connectedWalletAddress.toLowerCase());

    const totalTx = sentTx.length;
    if (totalTx === 0) return null;

    const failedTx = transactions.filter(tx => tx.isError === "1").length;
    const successRate = ((totalTx - failedTx) / totalTx * 100).toFixed(2);

    /*
        console.log("📤 Sent Transactions:", sentTx);
        console.log("📊 Total Transactions:", totalTx);
        console.log("❌ Failed Transactions:", failedTx);
        console.log("✅ Success Rate:", successRate + "%");
    */

    let erc20SentTx = 0, erc20ReceivedTx = 0, erc20uniqueSent = 0, erc20uniqueReceived = 0;
    let erc721SentTx = 0, erc721ReceivedTx = 0, erc721uniqueSentTx = 0, erc721uniqueReceivedTx = 0;
    let erc1155SentTx = 0, erc1155ReceivedTx = 0, erc1155uniqueSentTx = 0, erc1155uniqueReceivedTx = 0;
    let nftSentTx = 0, nftReceivedTx = 0, uniqueNftSentTx = 0, uniqueNftReceivedTx = 0;

    if (chain.blockscout) {

        const blockscouttoken = await tokenblockscout(chain).catch(() => ({ sent: 0, received: 0 }));
        erc20SentTx = blockscouttoken.sent20;
        erc20ReceivedTx = blockscouttoken.received20;
        erc20uniqueSent = blockscouttoken.uniqueSent20;
        erc20uniqueReceived = blockscouttoken.uniqueReceived20;
        erc721SentTx = blockscouttoken.sent721;
        erc721ReceivedTx = blockscouttoken.received721;
        erc721uniqueSentTx = blockscouttoken.uniqueSent721;
        erc721uniqueReceivedTx = blockscouttoken.uniqueReceived721;
        erc1155SentTx = blockscouttoken.sent1155;
        erc1155ReceivedTx = blockscouttoken.received1155;
        erc1155uniqueSentTx = blockscouttoken.uniqueSent1155;
        erc1155uniqueReceivedTx = blockscouttoken.uniqueReceived1155;
        nftSentTx = blockscouttoken.sentnft;
        nftReceivedTx = blockscouttoken.receivednft;
        uniqueNftSentTx = blockscouttoken.uniqueSentnft;
        uniqueNftReceivedTx = blockscouttoken.uniqueReceivednft;


    } else {
        const erc20 = await fetchERC20Transactions(chain).catch(() => ({ sent: 0, received: 0 }));
        const erc721 = await fetchERC721Transactions(chain).catch(() => ({ sent: 0, received: 0 }));
        const erc1155 = await fetchERC1155Transactions(chain).catch(() => ({ sent: 0, received: 0 }));

        erc20SentTx = erc20.sent;
        erc20ReceivedTx = erc20.received;
        erc20uniqueSent = erc20.uniqueSent;
        erc20uniqueReceived = erc20.uniqueReceived;
        erc721SentTx = erc721.sent;
        erc721ReceivedTx = erc721.received;
        erc721uniqueSentTx = erc721.uniqueSent;
        erc721uniqueReceivedTx = erc721.uniqueReceived;
        erc1155SentTx = erc1155.sent;
        erc1155ReceivedTx = erc1155.received;
        erc1155uniqueSentTx = erc1155.uniqueSent;
        erc1155uniqueReceivedTx = erc1155.uniqueReceived;
        nftSentTx = erc721SentTx + erc1155SentTx;
        nftReceivedTx = erc721ReceivedTx + erc1155ReceivedTx;
        uniqueNftSentTx = erc721uniqueSentTx + erc1155SentTx;
        uniqueNftReceivedTx = erc721uniqueReceivedTx + erc1155uniqueReceivedTx;

    }

    //throw new Error("🚨 Script stopped here for debugging.");


    if (transactions.length === 0) {
        console.log("❌ No transactions found");
        return;
    }

  
    const dateArray = transactions.map(tx => new Date(tx.timeStamp * 1000).toISOString().split("T")[0]);
    const dailyTxCounts = {};
    dateArray.forEach(date => {
        dailyTxCounts[date] = (dailyTxCounts[date] || 0) + 1;
    });

    const stats = {
        totalTx,
        failedTx,
        successRate: formatPercentage(successRate),
        erc20SentTx,
        erc20uniqueSent,
        erc20ReceivedTx,
        erc20uniqueReceived,
        erc721SentTx,
        erc721uniqueSentTx,
        erc721ReceivedTx,
        erc721uniqueReceivedTx,
        erc1155SentTx,
        erc1155uniqueSentTx,
        erc1155ReceivedTx,
        erc1155uniqueReceivedTx,
        nftSentTx,
        uniqueNftSentTx,
        nftReceivedTx,
        uniqueNftReceivedTx,
        dailyTxCounts
    };

    //   console.log('Generated stats:', stats);

    await saveBlockchainStats(connectedWalletAddress, chain.name, stats);
    return stats;
}


const formatDateForDB = (date) => {
    return date instanceof Date
        ? date.toISOString().split('T')[0]  // YYYY-MM-DD
        : null;
};

const formatPercentage = (value) => {
    return typeof value === "string" ? parseFloat(value) : value;
};



async function saveBlockchainStats(wallet, chain, stats) {

    //  console.log("Wallet:", wallet);
    //  console.log("chain:", chain);
    //  console.log("Received stats:", stats);

    try {
        const response = await fetch("/saveBlockchainStats", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ wallet, chain, stats }),
        });

        const data = await response.json();
        if (data.success) {
            console.log("✅ Blockchain stats saved successfully. Full response:", data);
        } else {
            console.error("❌ Error saving blockchain stats:", data.error);
        }
    } catch (error) {
        console.error("❌ Network or server error:", error);
    }
}



function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function fetchERC20Transactions(chain) {
    await delay(200);

    const url = `/api/erc20-transactions?chain=${chain.name}&address=${connectedWalletAddress}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data || !Array.isArray(data)) {
            console.warn(`⚠️ No valid result for ${chain.name}.`);
            return { sent: 0, received: 0, uniqueSent: 0, uniqueReceived: 0 };
        }

        let sentCount = 0;
        let receivedCount = 0;
        let uniqueSent = new Set();
        let uniqueReceived = new Set();

        for (const tx of data) {
            if (tx.from.toLowerCase() === connectedWalletAddress.toLowerCase()) {
                sentCount++;
                uniqueSent.add(tx.hash);
            } else if (tx.to.toLowerCase() === connectedWalletAddress.toLowerCase()) {
                receivedCount++;
                uniqueReceived.add(tx.hash);
            }
        }

        let uniqueSentCount = uniqueSent.size;
        let uniqueReceivedCount = uniqueReceived.size;

        //     console.log(`✅ ${chain.name}: ERC-20 TX - Sent: ${sentCount} (Unique: ${uniqueSentCount}), Received: ${receivedCount} (Unique: ${uniqueReceivedCount})`);
        return { sent: sentCount, received: receivedCount, uniqueSent: uniqueSentCount, uniqueReceived: uniqueReceivedCount };

    } catch (error) {
        console.error(`❌ Error loading ERC-20 TX for ${chain.name}:`, error);
        return { sent: 0, received: 0, uniqueSent: 0, uniqueReceived: 0 };
    }
}




async function fetchERC721Transactions(chain) {
    await delay(300);

    try {
        const response = await fetch(`/api/erc721-transactions?chain=${chain.name}&address=${connectedWalletAddress}`);
        const data = await response.json();

        if (!Array.isArray(data)) {
            console.warn(`⚠️ No valid result for ${chain.name}.`);
            return { sent: 0, received: 0, uniqueSent: 0, uniqueReceived: 0 };
        }

        let sentCount = 0;
        let receivedCount = 0;
        let uniqueSentHashes = new Set();
        let uniqueReceivedHashes = new Set();

        for (const tx of data) {
            const txHash = tx.hash.toLowerCase();

            if (tx.from.toLowerCase() === connectedWalletAddress.toLowerCase()) {
                sentCount++;
                uniqueSentHashes.add(txHash);
            }
            if (tx.to.toLowerCase() === connectedWalletAddress.toLowerCase()) {
                receivedCount++;
                uniqueReceivedHashes.add(txHash);
            }
        }

        let uniqueSentCount = uniqueSentHashes.size;
        let uniqueReceivedCount = uniqueReceivedHashes.size;

        //    console.log(`✅ ${chain.name}: ERC-721 TX - Sent: ${sentCount} (Unique: ${uniqueSentCount}), Received: ${receivedCount} (Unique: ${uniqueReceivedCount})`);

        return {
            sent: sentCount,
            received: receivedCount,
            uniqueSent: uniqueSentCount,
            uniqueReceived: uniqueReceivedCount
        };

    } catch (error) {
        console.error(`❌ Error loading ERC-721 TX for ${chain.name}:`, error);
        return { sent: 0, received: 0, uniqueSent: 0, uniqueReceived: 0 };
    }
}




async function fetchERC1155Transactions(chain) {
    await delay(400);

    try {
        const response = await fetch(`/api/erc1155-transactions?chain=${chain.name}&address=${connectedWalletAddress}`);
        const data = await response.json();
        //    console.log(`🔍 API Antwort für ${chain.name}:`, data);

        if (!Array.isArray(data)) {
            console.warn(`⚠️ No valid result for ${chain.name}.`);
            return { sent: 0, received: 0, uniqueSent: 0, uniqueReceived: 0 };
        }

        let sentCount = 0;
        let receivedCount = 0;
        let uniqueSentHashes = new Set();
        let uniqueReceivedHashes = new Set();

        for (const tx of data) {
            const txHash = tx.hash.toLowerCase();

            if (tx.from.toLowerCase() === connectedWalletAddress.toLowerCase()) {
                sentCount++;
                uniqueSentHashes.add(txHash);
            }
            if (tx.to.toLowerCase() === connectedWalletAddress.toLowerCase()) {
                receivedCount++;
                uniqueReceivedHashes.add(txHash);
            }
        }

        let uniqueSentCount = uniqueSentHashes.size;
        let uniqueReceivedCount = uniqueReceivedHashes.size;

        //    console.log(`✅ ${chain.name}: ERC-1155 TX - Sent: ${sentCount} (Unique: ${uniqueSentCount}), Received: ${receivedCount} (Unique: ${uniqueReceivedCount})`);

        return {
            sent: sentCount,
            received: receivedCount,
            uniqueSent: uniqueSentCount,
            uniqueReceived: uniqueReceivedCount
        };

    } catch (error) {
        console.error(`❌ Error loading ERC-1155 TX for ${chain.name}:`, error);
        return { sent: 0, received: 0, uniqueSent: 0, uniqueReceived: 0 };
    }
}






async function updateBlockchainStats() {
    const refreshButton = document.getElementById("refreshStatsButton");
    const statusMessage = document.getElementById("statusMessage");

    // Button deaktivieren & Status anzeigen
    refreshButton.disabled = true;
    refreshButton.innerText = "Refreshing...";
    statusMessage.innerText = "Updating blockchain stats... Please wait.";
    statusMessage.style.display = "block";

    try {
        // Starte alle API-Requests parallel
        const selectedChains = JSON.parse(localStorage.getItem("selectedNetworksStats") || "[]");

        const fetchPromises = Object.entries(CONFIG.chains)
            .filter(([key]) => selectedChains.includes(key))
            .map(async ([key, chain]) => {

                try {
                    const stats = await fetchBlockchainStats(chain);
                    if (!stats) {
                        console.warn(`⚠️ No valid data received for ${chain.name}.`);
                    } else {
                        console.log(`✅ Data received for ${chain.name}`);
                    }
                } catch (error) {
                    console.error(`❌ Error updating stats for ${chain.name}:`, error);
                }
            });

        // Warte, bis alle Requests abgeschlossen sind
        await Promise.all(fetchPromises);

        // Aktualisiere die Anzeige
        setupBlockchainStats();
        statusMessage.innerText = "✅ Blockchain statistics updated successfully!";
    } catch (error) {
        console.error("❌ Error updating blockchain stats:", error);
        statusMessage.innerText = "⚠️ Failed to update blockchain stats!";
    }

    // Nach kurzer Zeit Button wieder aktivieren & Status ausblenden
    setTimeout(() => {
        refreshButton.disabled = false;
        refreshButton.innerText = "Refresh Stats";
        statusMessage.style.display = "none";
    }, 2000);
}





// const calendarBlockchainStats = JSON.parse(localStorage.getItem("blockchainStats"));
// console.log(calendarBlockchainStats);

async function setupBlockchainStatsPopup(chainName) {


    let userLocale = navigator.language || "en-US";
    let formatNumber = (num, digits = 0) =>
        new Intl.NumberFormat(userLocale, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        }).format(num);



    let blockchainstats_popupOverlay = document.getElementById("blockchainstats-popup-overlay");



    if (!blockchainstats_popupOverlay) {
        blockchainstats_popupOverlay = document.createElement("div");
        blockchainstats_popupOverlay.id = "blockchainstats-popup-overlay";
        blockchainstats_popupOverlay.classList.add("blockchainstats-popup-overlay");
        blockchainstats_popupOverlay.style.display = "none";

        const blockchainstats_popupContent = document.createElement("div");
        blockchainstats_popupContent.classList.add("blockchainstats-popup-content");

        const blockchainstats_closeButton = document.createElement("span");
        blockchainstats_closeButton.id = "blockchainstats-popup-close-button";
        blockchainstats_closeButton.classList.add("blockchainstats-popup-close");
        blockchainstats_closeButton.textContent = "×";
        blockchainstats_popupContent.appendChild(blockchainstats_closeButton);

        const blockchainstats_popupTitle = document.createElement("h3");
        blockchainstats_popupTitle.id = "blockchainstats-popup-title";
        blockchainstats_popupContent.appendChild(blockchainstats_popupTitle);

        const newPopupDetails = document.createElement("div");
        newPopupDetails.id = "blockchainstats-popup-details";
        blockchainstats_popupContent.appendChild(newPopupDetails);

        blockchainstats_popupOverlay.appendChild(blockchainstats_popupContent);
        document.body.appendChild(blockchainstats_popupOverlay);

        blockchainstats_closeButton.addEventListener("click", () => {
            blockchainstats_popupOverlay.style.display = "none";
        });
    }

    let blockchainstats_popupDetails = document.getElementById("blockchainstats-popup-details");
    if (!blockchainstats_popupDetails) {
        console.error("Missing element: blockchainstats-popup-details");
        return;
    }

    // ✅ Fix: Vor dem neuen Einfügen den Inhalt leeren
    blockchainstats_popupDetails.innerHTML = "";

    let chainStats = {};
    let dailyTxCounts = {};

    try {
        // Fetch the chain data from the API
        // Überprüfe, ob die Daten im sessionStorage vorhanden sind

        const cachedData = sessionStorage.getItem(`blockchainStats_${connectedWalletAddress}`);

        if (cachedData) {
            console.log("Daten aus dem Cache geladen.");
            const allData = JSON.parse(cachedData);

            // Suche die Daten für den spezifischen Chain
            const chainData = allData.find(item => item.chain === chainName);

            if (chainData) {
                result = chainData;
            } else {
                console.log("Keine Daten für diesen Chain im Cache gefunden, hole sie von der API.");
                // Hole die Daten von der API, wenn sie im Cache nicht vorhanden sind

                const response = await fetch(`/getChainStats/${connectedWalletAddress}/${chainName}`);
                const apiResult = await response.json();

                // Check if the API response is successful
                if (!apiResult.success) { // Fehlerbehandlung für die API-Antwort
                    console.error("❌ Error: API did not return valid data.");
                    return;
                }
                if (apiResult.success) {
                    // Speichere die erhaltenen Daten im sessionStorage für zukünftige Anfragen
                    const existingData = sessionStorage.getItem(`blockchainStats_${connectedWalletAddress}`);
                    const allData = existingData ? JSON.parse(existingData) : [];

                    // Füge die neuen Daten zum bestehenden Cache hinzu
                    allData.push(apiResult.data);
                    sessionStorage.setItem(`blockchainStats_${connectedWalletAddress}`, JSON.stringify(allData));

                    result = apiResult.data;
                } else {
                    console.error("Fehler beim Abrufen der Daten von der API.");
                    return null;  // Oder handle den Fehler nach deinen Bedürfnissen
                }
            }
        } else {
            console.log("Keine Daten für diesen Chain im Cache gefunden, hole sie von der API.");
            // Hole die Daten von der API, wenn sie im Cache nicht vorhanden sind

            const response = await fetch(`/getChainStats/${connectedWalletAddress}/${chainName}`);
            const apiResult = await response.json();

            // Check if the API response is successful
            if (!apiResult.success) { // Fehlerbehandlung für die API-Antwort
                console.error("❌ Error: API did not return valid data.");
                return;
            }
            if (apiResult.success) {
                // Speichere die erhaltenen Daten im sessionStorage für zukünftige Anfragen
                const existingData = sessionStorage.getItem(`blockchainStats_${connectedWalletAddress}`);
                const allData = existingData ? JSON.parse(existingData) : [];

                // Füge die neuen Daten zum bestehenden Cache hinzu
                allData.push(apiResult.data);
                sessionStorage.setItem(`blockchainStats_${connectedWalletAddress}`, JSON.stringify(allData));

                result = apiResult.data;
            } else {
                console.error("Fehler beim Abrufen der Daten von der API.");
                return null;  // Oder handle den Fehler nach deinen Bedürfnissen
            }
        }


        // Log the full API response
        //    console.log("API Response:", result);

        // Extract the relevant data
        chainStats = result;
        dailyTxCounts = chainStats.daily_tx_counts || {};
        console.log("Successfully retrieved dailyTxCounts for chain:", chainName);

    } catch (error) {
        console.error("❌ Error fetching chain data:", error);
    }



    let walletAgeDays = Math.floor((new Date() - new Date(chainStats.firsttxdate)) / (1000 * 60 * 60 * 24));
    let avgPerDay = chainStats.daysused ? chainStats.total_tx / chainStats.daysused : 0;

    const summaryHTML = `
                    <h2 id="blockchainstats-popup-summary">
                    ${formatNumber(chainStats.total_tx)} transactions across ${formatNumber(chainStats.daysused)} unique days on ${chainName}, averaging ${formatNumber(avgPerDay, 2)} per day.
                    </h2>
                    <p><strong>Total TX per Month:</strong></p>
                `;



    blockchainstats_popupDetails.innerHTML += `

            ${summaryHTML}


        <div id="monthly-transactions-raster">
            <table id="transactions-raster">
                <thead>
                    <tr>
                        <th>${yearLabel}</th>
                        ${localizedMonths.map(month => `<th>${month}</th>`).join("")}
                    </tr>
                </thead>
                <tbody></tbody>
            </table>

            <h3>Transaction Breakdown by Token Type</h3>
            <table id="transactions-raster">
                <thead>
                    <tr>
                        <th></th>
                        <th>Sent</th>
                        <th>Unique Sent</th>
                        <th>Received</th>
                        <th>Unique Received</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>ERC-20</th>
                        <td>${formatNumber(chainStats.erc20_sent_tx || 0)}</td>
                        <td>${formatNumber(chainStats.erc20_unique_sent || 0)}</td>
                        <td>${formatNumber(chainStats.erc20_received_tx || 0)}</td>
                        <td>${formatNumber(chainStats.erc20_unique_received || 0)}</td>
                    </tr>
                    <tr>
                        <th>ERC-721</th>
                        <td>${formatNumber(chainStats.erc721_sent || 0)}</td>
                        <td>${formatNumber(chainStats.erc721_unique_sent || 0)}</td>
                        <td>${formatNumber(chainStats.erc721_received || 0)}</td>
                        <td>${formatNumber(chainStats.erc721_unique_received || 0)}</td>
                    </tr>
                    <tr>
                        <th>ERC-1155</th>
                        <td>${formatNumber(chainStats.erc1155_sent || 0)}</td>
                        <td>${formatNumber(chainStats.erc1155_unique_sent_tx || 0)}</td>
                        <td>${formatNumber(chainStats.erc1155_received || 0)}</td>
                        <td>${formatNumber(chainStats.erc1155__unique_received || 0)}</td>
                    </tr>
                    <tr>
                    <td>NFTs</td>
                    <td>${formatNumber(chainStats.nft_sent_tx || 0)}</td>
                    <td>${formatNumber(chainStats.unique_nft_sent_tx || 0)}</td>
                    <td>${formatNumber(chainStats.nft_received_tx || 0)}</td>
                    <td>${formatNumber(chainStats.unique_nft_received_tx || 0)}</td>
                </tr>
            </tbody>
        </table>
        <br>
        <h2>Other Statistics</h2>
        <p><strong>Wallet Age:</strong> ${formatNumber(walletAgeDays || 0)}</p>
        <p><strong>First Transaction:</strong> ${chainStats.firsttxdate}</p>
        <p><strong>Total Transactions:</strong> ${formatNumber(chainStats.total_tx || 0)}</p>
        <p><strong>Failed Transactions:</strong> ${formatNumber(chainStats.failed_tx || 0)}</p>
                </tbody>
            </table>
        </div>

        <div id="daily-transactions-calendar" style="display:none;">
            <div id="calendar-header">
                <button onclick="closeCalendar()">Back</button>
                <h3 id="calendar-title">Daily Transactions: ${chainName}</h3>
            </div>
            <div id="calendar-grid"></div>
        </div>
    `;


    console.log("let dailyTxCounts22:", dailyTxCounts);

    createMonthlyTransactionsRaster(dailyTxCounts, chainName);
    blockchainstats_popupOverlay.style.display = "block"; // Popup sichtbar machen
}




function getLocalizedMonthNames() {
    const formatter = new Intl.DateTimeFormat(navigator.language, { month: "short" });
    return [...Array(12)].map((_, i) => formatter.format(new Date(2024, i, 1)));
}

localizedMonths = getLocalizedMonthNames();





const monthsInLocalLanguage = new Intl.DateTimeFormat('en-US', { month: 'long' }).formatToParts(new Date(2024, 0)).map(part => part.value);
const monthNames = [
    monthsInLocalLanguage[0], monthsInLocalLanguage[1], monthsInLocalLanguage[2],
    monthsInLocalLanguage[3], monthsInLocalLanguage[4], monthsInLocalLanguage[5],
    monthsInLocalLanguage[6], monthsInLocalLanguage[7], monthsInLocalLanguage[8],
    monthsInLocalLanguage[9], monthsInLocalLanguage[10], monthsInLocalLanguage[11]
];

function createMonthlyTransactionsRaster(dailyTxCounts, chainName) {
    const tableBody = document.querySelector("#transactions-raster tbody");
    tableBody.innerHTML = "";

    let monthlySums = {};

    Object.entries(dailyTxCounts).forEach(([date, count]) => {
        let [year, month] = date.split("-").slice(0, 2);
        if (!monthlySums[year]) monthlySums[year] = {};
        if (!monthlySums[year][month]) monthlySums[year][month] = 0;
        monthlySums[year][month] += count;
    });

    Object.entries(monthlySums).forEach(([year, months]) => {
        let row = document.createElement("tr");

        let yearCell = document.createElement("td");
        yearCell.textContent = year;
        row.appendChild(yearCell);

        for (let month = 1; month <= 12; month++) {
            let monthKey = month.toString().padStart(2, "0"); // "01", "02", ..., "12"
            let cell = document.createElement("td");
            cell.classList.add("clickable-month");
            cell.textContent = months[monthKey] || 0;
            row.appendChild(cell);

            cell.addEventListener("click", () => {
                showDailyTransactionsForMonth(year, month, chainName, dailyTxCounts);
            });


        }

        tableBody.appendChild(row);
    });
}







function closeCalendar() {
    document.getElementById("daily-transactions-calendar").style.display = "none";
    document.getElementById("monthly-transactions-raster").style.display = "block";
}

function closeTotalCalendar() {
    document.getElementById("total-daily-transactions-calendar").style.display = "none";
    document.getElementById("total-transactions-raster").style.display = "block";
}



function showDailyTransactionsForMonth(year, month, chainName, dailyTxCounts) {
    // 1. Bestimme den ersten und letzten Tag des Monats
    const firstDayOfMonth = new Date(year, month - 1, 1);  // Monat ist 0-basiert
    const lastDayOfMonth = new Date(year, month, 0); // Der letzte Tag des Monats
    const daysInMonth = lastDayOfMonth.getDate();  // Anzahl der Tage im Monat

    // 2. Zeige den Monatsnamen
    document.getElementById("calendar-title").textContent = `Daily Transactions: ${chainName} (${month}/${year})`;

    const calendarGrid = document.getElementById("calendar-grid");
    calendarGrid.innerHTML = ""; // Kalender zurücksetzen

    // 3. Erstelle für jeden Tag des Monats ein Element
    for (let day = 1; day <= daysInMonth; day++) {
        // Generiere das Datum im Format YYYY-MM-DD
        const dateKey = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

        // Hole die Transaktionsanzahl oder setze sie auf 0, falls nicht vorhanden
        const count = dailyTxCounts[dateKey] || 0;

        // Erstelle ein neues Element für den Tag
        const dayElement = document.createElement("div");
        dayElement.classList.add("calendar-day");
        dayElement.innerHTML = `
            <div class="day-box">
                <span class="day-number">${day}</span>
                <span class="tx-count">${count}</span>
            </div>
        `;

        // Füge das neue Tag-Element in das Kalender-Grid ein
        calendarGrid.appendChild(dayElement);
    }

    // Kalender anzeigen und andere Elemente ausblenden
    document.getElementById("monthly-transactions-raster").style.display = "none";
    document.getElementById("daily-transactions-calendar").style.display = "block";
}



function totalSetupPopup() {
    let totalPopupOverlay = document.getElementById("total-popup-overlay");

    if (!totalPopupOverlay) {
        totalPopupOverlay = document.createElement("div");
        totalPopupOverlay.id = "total-popup-overlay";
        totalPopupOverlay.classList.add("blockchainstats-popup-overlay");
        totalPopupOverlay.style.display = "none";

        const totalPopupContent = document.createElement("div");
        totalPopupContent.classList.add("blockchainstats-popup-content");

        const totalCloseButton = document.createElement("span");
        totalCloseButton.id = "total-popup-close-button";
        totalCloseButton.classList.add("blockchainstats-popup-close");
        totalCloseButton.textContent = "×";
        totalPopupContent.appendChild(totalCloseButton);

        const totalPopupHeader = document.createElement("h2");
        totalPopupHeader.id = "total-popup-summary";
        totalPopupHeader.textContent = ""; // Inhalt wird später gesetzt
        totalPopupContent.appendChild(totalPopupHeader);

        const totalPopupTitle = document.createElement("h3");
        totalPopupTitle.id = "total-popup-title";
        totalPopupTitle.textContent = `Total Transactions per Month`;
        totalPopupContent.appendChild(totalPopupTitle);

        const totalPopupDetails = document.createElement("div");
        totalPopupDetails.id = "total-popup-details";
        totalPopupContent.appendChild(totalPopupDetails);

        totalPopupOverlay.appendChild(totalPopupContent);
        document.body.appendChild(totalPopupOverlay);

        totalCloseButton.addEventListener("click", () => {
            totalPopupOverlay.style.display = "none";
        });
    }

    let totalPopupDetails = document.getElementById("total-popup-details");
    if (!totalPopupDetails) {
        console.error("Fehlendes Element: total-popup-details");
        return;
    }

    // **Gesamte Transaktionen abrufen & Tabelle erstellen**
    const totalTxCounts = totalGetTxCounts(); // Aggregierte Daten abrufen
    //  console.log("Gesamte Transaktionsdaten:", totalTxCounts);

    if (!totalTxCounts || Object.keys(totalTxCounts).length === 0) {
        console.warn("Keine Daten für Total Stats gefunden.");
        totalPopupDetails.innerHTML = `<p>Keine Daten verfügbar.</p>`;
        return;
    }
    let userLocale = navigator.language || "en-US";
    let formatNumber = (num) => new Intl.NumberFormat(userLocale).format(num);
    const summedStats = sumBlockchainStats();

    console.log("summedStats:", summedStats);


    const summaryText = `${formatNumber(summedStats.total_tx || 0)} transactions over ${formatNumber(summedStats.total_days_used || 0)} unique days, across ${formatNumber(summedStats.chains_used || 0)} chains – average of ${formatNumber(summedStats.avg_tx_per_day || 0)} per day.`;
    document.getElementById("total-popup-summary").textContent = summaryText;



    totalPopupDetails.innerHTML = `
    <div id="total-transactions-raster">
        <table id="total-transactions-table">
            <thead>
                <tr>
                    <th>${yearLabel}</th>
                    ${localizedMonths.map(month => `<th>${month}</th>`).join("")}
                </tr>
            </thead>
            <tbody id="total-tx-body"></tbody>
        </table>
        <br>
        <h3>Transaction Breakdown by Token Type</h3>
        <table id="total-transactions-table">
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Sent</th>
                    <th>Unique Sent</th>
                    <th>Received</th>
                    <th>Unique Received</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>ERC-20</td>
                    <td>${formatNumber(summedStats.erc20_sent_tx || 0)}</td>
                    <td>${formatNumber(summedStats.erc20_unique_sent || 0)}</td>
                    <td>${formatNumber(summedStats.erc20_received_tx || 0)}</td>
                    <td>${formatNumber(summedStats.erc20_unique_received || 0)}</td>
                </tr>
                <tr>
                    <td>ERC-721</td>
                    <td>${formatNumber(summedStats.erc721_sent || 0)}</td>
                    <td>${formatNumber(summedStats.erc721_unique_sent || 0)}</td>
                    <td>${formatNumber(summedStats.erc721_received || 0)}</td>
                    <td>${formatNumber(summedStats.erc721_unique_received || 0)}</td>
                </tr>
                <tr>
                    <td>ERC-1155</td>
                    <td>${formatNumber(summedStats.erc1155_sent || 0)}</td>
                    <td>${formatNumber(summedStats.erc1155_unique_sent_tx || 0)}</td>
                    <td>${formatNumber(summedStats.erc1155_received || 0)}</td>
                    <td>${formatNumber(summedStats.erc1155_unique_received || 0)}</td>
                </tr>
                <tr>
                    <td>NFTs</td>
                    <td>${formatNumber(summedStats.nft_sent_tx || 0)}</td>
                    <td>${formatNumber(summedStats.unique_nft_sent_tx || 0)}</td>
                    <td>${formatNumber(summedStats.nft_received_tx || 0)}</td>
                    <td>${formatNumber(summedStats.unique_nft_received_tx || 0)}</td>
                </tr>
            </tbody>
        </table>
        <br>
        <h2>Other Statistics</h2>
        <p><strong>Wallet Age:</strong> ${formatNumber(summedStats.wallet_age_days || 0)}</p>
        <p><strong>First Transaction:</strong> ${summedStats.wallet_first_tx_date}</p>
        <p><strong>Total Transactions:</strong> ${formatNumber(summedStats.total_tx || 0)}</p>
        <p><strong>Failed Transactions:</strong> ${formatNumber(summedStats.failed_tx || 0)}</p>

    </div>
    <div id="total-daily-transactions-calendar" style="display:none;">
        <div id="total-calendar-header">
            <button onclick="closeTotalCalendar()">Back</button>
            <h3 id="total-calendar-title">Daily Transactions</h3>
        </div>
        <div id="total-calendar-grid"></div>
    </div>
`;

    totalCreateTxTable(totalTxCounts);
    totalPopupOverlay.style.display = "block"; // Popup öffnen
}


function totalGetTxCounts() {
    let totalChainsDataRaw = JSON.parse(sessionStorage.getItem(`blockchainStats_${connectedWalletAddress}`)) || [];
    let selectedChains = JSON.parse(localStorage.getItem("selectedNetworksStats")) || [];
    
    let totalChainsData = totalChainsDataRaw.filter(item =>
        selectedChains.includes(
            Object.keys(CONFIG.chains).find(key => CONFIG.chains[key].name === item.chain)
        )
    );
        let totalTxCounts = {};
    console.log("📊 totalChainsData:", totalChainsData);

    // Alle Chains durchgehen und Transaktionen summieren
    Object.values(totalChainsData).forEach(chainData => {
        if (!chainData.daily_tx_counts) return;

        Object.entries(chainData.daily_tx_counts).forEach(([date, count]) => {
            if (!totalTxCounts[date]) totalTxCounts[date] = 0;
            totalTxCounts[date] += count;
        });
    });

    return totalTxCounts;
}

function sumBlockchainStats() {
    let totalChainsDataRaw = JSON.parse(sessionStorage.getItem(`blockchainStats_${connectedWalletAddress}`)) || [];
    let selectedChains = JSON.parse(localStorage.getItem("selectedNetworksStats")) || [];
    
    let blockchainStats = totalChainsDataRaw.filter(item =>
        selectedChains.includes(
            Object.keys(CONFIG.chains).find(key => CONFIG.chains[key].name === item.chain)
        )
    );
    
    const totals = {
        erc20_received_tx: 0,
        erc20_sent_tx: 0,
        erc20_unique_received: 0,
        erc20_unique_sent: 0,
        erc721_received: 0,
        erc721_sent: 0,
        erc721_unique_received: 0,
        erc721_unique_sent: 0,
        erc1155_received: 0,
        erc1155_sent: 0,
        erc1155_unique_received: 0,
        erc1155_unique_sent_tx: 0,
        failed_tx: 0,
        nft_received_tx: 0,
        nft_sent_tx: 0,
        total_tx: 0,
        unique_nft_received_tx: 0,
        unique_nft_sent_tx: 0,
        wallet_first_tx_date: null,
        wallet_age_days: 0,
        total_days_used: 0,
        avg_tx_per_day: 0,
        chains_used: 0
    };

    let earliestDate = null;

    Object.values(blockchainStats).forEach(chainStats => {
        Object.keys(totals).forEach(key => {
            totals[key] += chainStats[key] || 0;
        });

        if (chainStats.firsttxdate) {
            const txDate = new Date(chainStats.firsttxdate);
            if (!earliestDate || txDate < earliestDate) {
                earliestDate = txDate;
                console.log("earliestDate", earliestDate);
            }
        }
    });

    if (earliestDate) {
        totals.wallet_first_tx_date = earliestDate.toISOString().split("T")[0]; // Nur yyyy-mm-dd
        const today = new Date();
        const diffTime = today - earliestDate;
        totals.wallet_age_days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    const uniqueDays = new Set();

    blockchainStats.forEach(entry => {
        const dailyCounts = entry.daily_tx_counts || {};
        Object.entries(dailyCounts).forEach(([date, count]) => {
            if (count > 0) uniqueDays.add(date);
        });
    });

    totals.total_days_used = uniqueDays.size;

    if (totals.total_days_used > 0) {
        totals.avg_tx_per_day = (totals.total_tx / totals.total_days_used).toFixed(2);
    }

    totals.chains_used = blockchainStats.length;


    return totals;
}





function totalCreateTxTable(totalTxCounts) {
    let totalTxBody = document.getElementById("total-tx-body");
    let userLocale = navigator.language || "en-US";
    let formatNumber = (num) => new Intl.NumberFormat(userLocale).format(num);

    if (!totalTxBody) return;

    totalTxBody.innerHTML = "";

    let totalYears = {};

    Object.keys(totalTxCounts).forEach(date => {
        let [year, month] = date.split("-");
        if (!totalYears[year]) totalYears[year] = {};
        if (!totalYears[year][month]) totalYears[year][month] = 0;
        totalYears[year][month] += totalTxCounts[date];
    });

    Object.keys(totalYears).forEach(year => {
        let row = `<tr><td>${year}</td>`;
        localizedMonths.forEach((_, index) => {
            let monthKey = String(index + 1).padStart(2, "0");
            let txCount = totalYears[year][monthKey] || 0;

            row += `<td class="clickable-month" onclick="openTotalDailyView('${year}', '${monthKey}')">${formatNumber(txCount)}</td>`;
        });
        row += "</tr>";
        totalTxBody.innerHTML += row;
    });


    let totalRow = "<tr><td><strong>Total</strong></td>";
    localizedMonths.forEach((_, index) => {
        let monthKey = String(index + 1).padStart(2, "0");
        let sum = Object.values(totalYears).reduce((acc, months) => acc + (months[monthKey] || 0), 0);
        totalRow += `<td><strong>${formatNumber(sum)}</strong></td>`;
    });
    totalRow += "</tr>";
    totalTxBody.innerHTML += totalRow;
}

function openTotalDailyView(year, month) {
    const allDailyTxCounts = totalGetTxCounts();

    const dailyTransactions = Object.entries(allDailyTxCounts)
        .filter(([date, count]) => date.startsWith(`${year}-${month.toString().padStart(2, "0")}`))
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // <--- sortiere chronologisch

    document.getElementById("total-calendar-title").textContent = `Daily Transactions (${month}/${year})`;

    const calendarGrid = document.getElementById("total-calendar-grid");
    calendarGrid.innerHTML = ""; // Reset

    dailyTransactions.forEach(({ date, count }) => {
        const dayElement = document.createElement("div");
        dayElement.classList.add("calendar-day");
        dayElement.innerHTML = `
            <div class="day-box">
                <span class="day-number">${date.split("-")[2]}</span>
                <span class="tx-count">${count}</span>
            </div>
        `;
        calendarGrid.appendChild(dayElement);
    });

    document.getElementById("total-transactions-raster").style.display = "none";
    document.getElementById("total-daily-transactions-calendar").style.display = "block";
}




async function tokenblockscout(chain) {
    //   console.log(`tokenblockscout für ${chain.name}`);

    try {
        const response = await fetch(`/api/token-transactions?chain=${chain.name}&address=${connectedWalletAddress}`);
        const data = await response.json();

        let erc20Response = data.erc20;
        let nftResponse = data.nfts;
        /*
        console.log("📤 API Response:", data);

        console.log("📥 ERC-20 Tokens:", erc20Response);
        console.log("📥 NFT Transfers:", nftResponse);


        console.log("🔍 Struktur von API-Daten:", data);
        console.log("🟢 ERC-20:", data.erc20 ? "Existiert" : "Fehlt!");
        console.log("🟢 NFTs:", data.nfts ? "Existiert" : "Fehlt!");
*/
        const analyzeTransactions = (data) => {
            return data.reduce((acc, tx) => {
                let hasTokenID = tx.tokenID !== undefined && tx.tokenID !== "";
                let isSent = tx.from.toLowerCase() === connectedWalletAddress.toLowerCase();
                let isReceived = tx.to.toLowerCase() === connectedWalletAddress.toLowerCase();

                if (isSent) {
                    acc.sentCount20++;
                    acc.uniqueSentCount20.add(tx.hash);
                    if (hasTokenID) {
                        acc.sentWithTokenID++;
                        acc.uniqueSentWithTokenID.add(tx.hash);
                    }
                }
                if (isReceived) {
                    acc.receivedCount20++;
                    acc.uniqueReceivedCount20.add(tx.hash);
                    if (hasTokenID) {
                        acc.receivedWithTokenID++;
                        acc.uniqueReceivedWithTokenID.add(tx.hash);
                    }
                }
                return acc;
            }, {
                sentCount20: 0, receivedCount20: 0,
                uniqueSentCount20: new Set(), uniqueReceivedCount20: new Set(),
                sentWithTokenID: 0, receivedWithTokenID: 0,
                uniqueSentWithTokenID: new Set(), uniqueReceivedWithTokenID: new Set()
            });
        };

        const tokentx = analyzeTransactions(erc20Response.result);
        const tokennfttx = analyzeTransactions(nftResponse.result);

        let sent20 = tokentx.sentCount20;
        let received20 = tokentx.receivedCount20;
        let uniqueSent20 = tokentx.uniqueSentCount20.size;
        let uniqueReceived20 = tokentx.uniqueReceivedCount20.size;

        let sent721 = tokennfttx.sentWithTokenID;
        let received721 = tokennfttx.receivedWithTokenID;
        let uniqueSent721 = tokennfttx.uniqueSentWithTokenID.size;
        let uniqueReceived721 = tokennfttx.uniqueReceivedWithTokenID.size;

        let sentnft = tokentx.sentWithTokenID;
        let receivednft = tokentx.receivedWithTokenID;
        let uniqueSentnft = tokentx.uniqueSentWithTokenID.size;
        let uniqueReceivednft = tokentx.uniqueReceivedWithTokenID.size;

        let sent1155 = sentnft - sent721;
        let received1155 = receivednft - received721;
        let uniqueSent1155 = uniqueSentnft - uniqueSent721;
        let uniqueReceived1155 = uniqueReceivednft - uniqueReceived721;

        /*
        console.log("📊 Endgültige Werte:", {
            sent20, received20,
            uniqueSent20, uniqueReceived20,
            sent721, received721,
            uniqueSent721, uniqueReceived721,
            sent1155, received1155,
            uniqueSent1155, uniqueReceived1155,
            sentnft, receivednft,
            uniqueSentnft, uniqueReceivednft
        });
*/

        return {
            sent20, received20, uniqueSent20, uniqueReceived20,
            sent721, received721, uniqueSent721, uniqueReceived721,
            sent1155, received1155, uniqueSent1155, uniqueReceived1155,
            sentnft, receivednft, uniqueSentnft, uniqueReceivednft
        };

    } catch (error) {
        console.error("❌ Fehler bei tokenblockscout:", error);
        erc20Response = [];
        nftResponse = [];
    }
}


let previousChainSelection = []; 

function toggleChainDropdown() {
    const dropdown = document.getElementById("chain-dropdown-content");
    
    if (dropdown.style.display === "none" || dropdown.style.display === "") {
        dropdown.style.display = "block";

        // Auswahl merken beim Öffnen
        previousChainSelection = JSON.parse(localStorage.getItem("selectedNetworksStats") || "[]").sort();
    } else {
        closeChainSelection(); // ruft update nur auf, wenn sich was geändert hat
    }
}



function buildChainSelectorDropdown() {
    const container = document.getElementById("chain-dropdown-content");
    if (!container) return;

    container.innerHTML = "";

    const savedSelection = JSON.parse(localStorage.getItem("selectedNetworksStats") || "[]");
    const allChainKeys = Object.keys(window.CONFIG.chains);

    const sortedChainKeys = allChainKeys.sort((a, b) => {
        const nameA = window.CONFIG.chains[a].name.toLowerCase();
        const nameB = window.CONFIG.chains[b].name.toLowerCase();
        return nameA.localeCompare(nameB);
    });

    // Select All Option
    const selectAllLi = document.createElement("li");
    const selectAllCheckbox = document.createElement("input");
    selectAllCheckbox.type = "checkbox";
    selectAllCheckbox.id = "select-all-chains";
    selectAllCheckbox.checked = savedSelection.length === allChainKeys.length;

    selectAllCheckbox.addEventListener("change", function () {
        const checkboxes = container.querySelectorAll(".chain-checkbox");
        checkboxes.forEach(cb => cb.checked = this.checked);
        saveChainSelection();
    });

    const selectAllLabel = document.createElement("label");
    selectAllLabel.textContent = "Select All";
    selectAllLabel.setAttribute("for", "select-all-chains");

    selectAllLi.appendChild(selectAllCheckbox);
    selectAllLi.appendChild(selectAllLabel);
    container.appendChild(selectAllLi);

    // Einzelne Chains
    sortedChainKeys.forEach(chainKey => {
        const chainName = window.CONFIG.chains[chainKey].name;

        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "chain-checkbox";
        checkbox.value = chainKey;
        checkbox.checked = savedSelection.includes(chainKey);
        checkbox.id = `checkbox-${chainKey}`;
        checkbox.addEventListener("change", saveChainSelection);

        const label = document.createElement("label");
        label.textContent = chainName;
        label.setAttribute("for", `checkbox-${chainKey}`);

        li.appendChild(checkbox);
        li.appendChild(label);
        container.appendChild(li);
    });
}

function saveChainSelection() {
    const selected = Array.from(document.querySelectorAll(".chain-checkbox"))
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    localStorage.setItem("selectedNetworksStats", JSON.stringify(selected));

    const allChainKeys = Object.keys(window.CONFIG.chains);
    const selectAllCheckbox = document.getElementById("select-all-chains");
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = selected.length === allChainKeys.length;
    }

    console.log("Aktive Auswahl:", selected);
}


document.addEventListener("click", function (event) {
    const dropdownWrapper = document.getElementById("chain-selector-wrapper");
    const dropdownContent = document.getElementById("chain-dropdown-content");

    const isDropdownOpen = dropdownContent.style.display === "block";
    const clickedOutside = !dropdownWrapper.contains(event.target);

    if (isDropdownOpen && clickedOutside) {
        closeChainSelection(); // Nur wenn offen & außerhalb geklickt wurde
    }
});


function closeChainSelection() {
    const dropdown = document.getElementById("chain-dropdown-content");
    dropdown.style.display = "none";

    const currentSelection = JSON.parse(localStorage.getItem("selectedNetworksStats") || "[]").sort();
    const hasChanged = JSON.stringify(currentSelection) !== JSON.stringify(previousChainSelection);

    if (hasChanged) {
        console.log("🟢 Auswahl hat sich geändert → Update!");
        updateBlockchainStats();
    } else {
        console.log("🔵 Keine Änderung → Kein Update.");
    }
}




function renderTableBody(tbody) {
    tbody.innerHTML = "";

    blockchainTableData.forEach(row => {
        const tr = document.createElement("tr");

        headerMap.forEach(h => {
            const value = row[h.key];

            let content = typeof value === "number"
                ? formatNumber(value, h.key === "success_rate" ? 2 : 0)
                : value || "–";

            if (h.key === "chain") {
                tr.innerHTML += `<td class="clickable-chain" onclick="setupBlockchainStatsPopup('${row.chain}')">${row.chain}</td>`;
            } else {
                tr.innerHTML += `<td>${content}${h.key === "success_rate" ? "%" : ""}</td>`;
            }
        });

        tbody.appendChild(tr);
    });
}

function sortTableByColumn(index) {
    const key = headerMap[index].key;

    if (currentSortColumn === key) {
        currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc";
    } else {
        currentSortColumn = key;
        currentSortOrder = "asc";
    }

    blockchainTableData.sort((a, b) => {
        const valA = a[key] ?? "";
        const valB = b[key] ?? "";

        if (!isNaN(valA) && !isNaN(valB)) {
            return currentSortOrder === "asc" ? valA - valB : valB - valA;
        } else {
            return currentSortOrder === "asc"
                ? String(valA).localeCompare(String(valB))
                : String(valB).localeCompare(String(valA));
        }
    });
}

function updateSortIcons(thead, sortedIndex, asc) {
    const headers = thead.querySelectorAll("th");
    headers.forEach((th, i) => {
        const icon = th.querySelector(".sort-icon");
        if (!icon) return;
        if (i === sortedIndex) {
            icon.textContent = asc ? "▲" : "▼";
            th.classList.add("sorted");
        } else {
            icon.textContent = "↕";
            th.classList.remove("sorted");
        }
    });
}
