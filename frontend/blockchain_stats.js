const userLang = navigator.language || "en";
const formatter = new Intl.DateTimeFormat(userLang, { month: "short" });
const yearLabel = new Intl.DisplayNames([userLang], { type: "dateTimeField" }).of("year");

let localizedMonths = Array.from({ length: 12 }, (_, i) => formatter.format(new Date(2000, i, 1)));


document.getElementById("refreshStatsButton").addEventListener("click", async () => {
    updateBlockchainStats();
});
document.getElementById("totalStatsButton").addEventListener("click", () => {
    totalSetupPopup();
});



function setupBlockchainStats() {
    const container = document.getElementById("blockchain_statsPage");

    const existingTable = container.querySelector("table");
    if (existingTable) {
        existingTable.remove();
    }

    const table = document.createElement("table");
    table.classList.add("blockchain-stats-table");

    const headers = [
        "Chain", "Total TX", "ERC-20 ✉️", "ERC-20 📥", "Unique \nNFTs ✉️", "Unique \nNFTs 📥",
        "Failed TX", "Success Rate", "First TX", "Last TX",
        "Most Active \nDay", "Most Active \nMonth", "Streak",
        "Longest \nStreak", "Days Used", "Weeks Used", "Months Used", "Years Used"
    ];

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headers.forEach(text => {
        const th = document.createElement("th");
        th.innerHTML = text.replace(/\n/g, "<br>");
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    table.appendChild(tbody);

    container.appendChild(table);

    loadBlockchainStats(tbody);

    setupBlockchainStatsPopup();
}


async function loadBlockchainStats(tbody) {

    tbody.innerHTML = '';

    for (const [key, chain] of Object.entries(CONFIG.chains)) {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${chain.name}</td><td colspan='18'>Loading...</td>`;
        tbody.appendChild(row);

        try {
            let storedStats = JSON.parse(localStorage.getItem("blockchainStats")) || {};
            let stats = storedStats[chain.name] || null;

            // If no stored data is available, retrieve on-chain
            if (!stats) {
                console.log(`🔍 Keine gespeicherten Daten für ${chain.name}, hole on-chain...`);
                stats = await fetchBlockchainStats(chain);

                if (stats) {
                    saveBlockchainStats(chain, stats);
                }
            } else {
                //   console.log(`✅ Geladene gespeicherte Daten für ${chain.name}`);
            }

            if (!stats) {
                row.innerHTML = `<td>${chain.name}</td><td colspan='18'>No Transactions</td>`;
                continue;
            }

            // Fill table with data
            row.innerHTML = `
                <td class="clickable-chain" onclick="setupBlockchainStatsPopup('${chain.name}')">${chain.name}</td>
                <td>${stats.totalTx}</td>
                <td>${stats.erc20SentTx}</td>
                <td>${stats.erc20ReceivedTx}</td>
                <td>${stats.uniqueNftSentTx}</td>
                <td>${stats.erc721uniqueReceivedTx}</td>
                <td>${stats.failedTx}</td>
                <td>${stats.successRate}%</td>
                <td>${stats.firstTxDate}</td>
                <td>${stats.lastTxDate}</td>
                <td>${stats.mostActiveDay}</td>
                <td>${stats.mostActiveMonth}</td>
                <td>${stats.currentStreak}</td>
                <td>${stats.longestStreak}</td>
                <td>${stats.daysUsed}</td>
                <td>${stats.weeksUsed}</td>
                <td>${stats.monthsUsed}</td>
                <td>${stats.yearsUsed}</td>
            `;
        } catch (error) {
            console.error(`❌ Fehler beim Laden von ${chain.name}:`, error);
            row.innerHTML = `<td>${chain.name}</td><td colspan='18'>Error loading data</td>`;
        }
    }
}



async function fetchBlockchainStats(chain) {


    const apiBase = getApiBase(chain.name.toLowerCase());
    const chainName = typeof chain === "object" ? chain.name : chain;


    const response = await fetch(`http://localhost:3001/api/proxy?chain=${chainName}&type=txlist&address=${connectedWalletAddress}`);
    const data = await response.json();

    const responseInternal = await fetch(`http://localhost:3001/api/proxy?chain=${chainName}&type=txlistinternal&address=${connectedWalletAddress}`);
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

    transactions.sort((a, b) => a.timeStamp - b.timeStamp);

    const firstTxDate = new Date(transactions[0].timeStamp * 1000);
    const lastTxDate = new Date(transactions[transactions.length - 1].timeStamp * 1000);

    const dateArray = transactions.map(tx => new Date(tx.timeStamp * 1000).toISOString().split("T")[0]);
    const dateSet = new Set(dateArray);
    const daysUsed = dateSet.size;

    const uniqueWeeks = new Set([...dateSet].map(d => {
        const date = new Date(d);
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const weekNumber = Math.ceil((((date - startOfYear) / (1000 * 60 * 60 * 24)) + startOfYear.getDay() + 1) / 7);
        return `${date.getFullYear()}-W${weekNumber}`;
    }));
    const weeksUsed = uniqueWeeks.size;
    const monthsUsed = new Set([...dateSet].map(d => d.slice(0, 7))).size;
    const yearsUsed = new Set([...dateSet].map(d => d.slice(0, 4))).size;

    const dailyTxCounts = {};
    dateArray.forEach(date => {
        dailyTxCounts[date] = (dailyTxCounts[date] || 0) + 1;
    });

    const mostActiveDay = Object.keys(dailyTxCounts).reduce((a, b) => dailyTxCounts[a] > dailyTxCounts[b] ? a : b, "-");
    const monthCounts = {};
    [...dateSet].forEach(date => {
        monthCounts[date.slice(0, 7)] = (monthCounts[date.slice(0, 7)] || 0) + 1;
    });

    const mostActiveMonth = Object.keys(monthCounts).length > 0
        ? Object.keys(monthCounts).reduce((a, b) => monthCounts[a] > monthCounts[b] ? a : b)
        : "-";

    const sortedDates = [...dateSet].map(d => new Date(d)).sort((a, b) => a - b);
    let longestStreak = 1, currentStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = sortedDates[i - 1];
        const currDate = sortedDates[i];
        const diff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
        } else {
            currentStreak = 1;
        }
    }

    const stats = {
        totalTx,
        failedTx,
        successRate,
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
        firstTxDate: firstTxDate.toLocaleDateString(),
        lastTxDate: lastTxDate.toLocaleDateString(),
        mostActiveDay,
        mostActiveMonth,
        currentStreak,
        longestStreak,
        daysUsed,
        weeksUsed,
        monthsUsed,
        yearsUsed,
        dailyTxCounts
    };


    await saveBlockchainStats(chain, stats);
    return stats;
}

async function saveBlockchainStats(chain, stats) {
    const storedData = JSON.parse(localStorage.getItem("blockchainStats")) || {};

    if (!storedData[chain.name]) {
        storedData[chain.name] = {
            totalTx: 0,
            failedTx: 0,
            successRate: "0.00",
            erc20SentTx: 0,
            erc20uniqueSent: 0,
            erc20ReceivedTx: 0,
            erc20uniqueReceived: 0,
            erc721SentTx: 0,
            erc721uniqueSentTx: 0,
            erc721ReceivedTx: 0,
            erc721uniqueReceivedTx: 0,
            erc1155SentTx: 0,
            erc1155uniqueSentTx: 0,
            erc1155ReceivedTx: 0,
            erc1155uniqueReceivedTx: 0,
            nftSentTx: 0,
            uniqueNftSentTx: 0,
            nftReceivedTx: 0,
            uniqueNftReceivedTx: 0,
            firstTxDate: "-",
            lastTxDate: "-",
            mostActiveDay: "-",
            mostActiveMonth: "-",
            currentStreak: 0,
            longestStreak: 0,
            daysUsed: 0,
            weeksUsed: 0,
            monthsUsed: 0,
            yearsUsed: 0,
            dailyTxCounts: {}
        };
    }

    storedData[chain.name] = {
        ...storedData[chain.name],
        ...stats,
    };

    storedData[chain.name].dailyTxCounts = stats.dailyTxCounts;

    localStorage.setItem("blockchainStats", JSON.stringify(storedData));
}


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function fetchERC20Transactions(chain) {
    await delay(200);

    const url = `http://localhost:3001/api/erc20-transactions?chain=${chain.name}&address=${connectedWalletAddress}`;

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
        const response = await fetch(`http://localhost:3001/api/erc721-transactions?chain=${chain.name}&address=${connectedWalletAddress}`);
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
        const response = await fetch(`http://localhost:3001/api/erc1155-transactions?chain=${chain.name}&address=${connectedWalletAddress}`);
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
        const fetchPromises = Object.entries(CONFIG.chains).map(async ([key, chain]) => {
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

function setupBlockchainStatsPopup(chainName) {
    let blockchainstats_popupOverlay = document.getElementById("blockchainstats-popup-overlay");
    const blockchainstats_popupTitle = document.getElementById("blockchainstats-popup-title");
    if (blockchainstats_popupTitle) {
        blockchainstats_popupTitle.textContent = `Total TX per Month (${chainName})`;
    }
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

    // This ensures that the element exists!
    let blockchainstats_popupDetails = document.getElementById("blockchainstats-popup-details");
    if (!blockchainstats_popupDetails) {
        console.error("Missing element: blockchainstats-popup-details");
        return;
    }

    const dailyTxCounts = getDailyTxCountsForChain(chainName);

    if (!dailyTxCounts || Object.keys(dailyTxCounts).length === 0) {
        console.warn(`No daily transactions found for chain "${chainName}".`);
        return;
    }

  //  console.log(`Popup for chain "${chainName}" is displayed.`);
    let userLocale = navigator.language || "en-US";
    let formatNumber = (num) => new Intl.NumberFormat(userLocale).format(num);
    let chainStats = JSON.parse(localStorage.getItem("blockchainStats") || "{}")[chainName] || {};

    blockchainstats_popupDetails.innerHTML = `
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
                    <td>${formatNumber(chainStats.erc20SentTx || 0)}</td>
                    <td>${formatNumber(chainStats.erc20uniqueSent || 0)}</td>
                    <td>${formatNumber(chainStats.erc20ReceivedTx || 0)}</td>
                    <td>${formatNumber(chainStats.erc20uniqueReceived || 0)}</td>
                </tr>
                <tr>
                    <th>ERC-721</th>
                    <td>${formatNumber(chainStats.erc721SentTx || 0)}</td>
                    <td>${formatNumber(chainStats.erc721uniqueSentTx || 0)}</td>
                    <td>${formatNumber(chainStats.erc721ReceivedTx || 0)}</td>
                    <td>${formatNumber(chainStats.erc721uniqueReceivedTx || 0)}</td>
                </tr>
                <tr>
                    <th>ERC-1155</th>
                    <td>${formatNumber(chainStats.erc1155SentTx || 0)}</td>
                    <td>${formatNumber(chainStats.erc1155uniqueSentTx || 0)}</td>
                    <td>${formatNumber(chainStats.erc1155ReceivedTx || 0)}</td>
                    <td>${formatNumber(chainStats.erc1155uniqueReceivedTx || 0)}</td>
                </tr>
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

    createMonthlyTransactionsRaster(dailyTxCounts, chainName);
    createDailyTransactionsCalendar(dailyTxCounts);

  //  console.log(`Popup für die Chain "${chainName}" wird angezeigt.`);
    blockchainstats_popupOverlay.style.display = "block"; // Make popup visible

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
                showDailyTransactionsForMonth(year, month, chainName);
            });


        }

        tableBody.appendChild(row);
    });
}



function getDailyTxCountsForChain(chainName) {
 //   console.log(`getDailyTxCountsForChain aufgerufen mit Chain: "${chainName}"`);

    // Prüfe, ob Daten im localStorage existieren
    const rawData = localStorage.getItem("blockchainStats");
    if (!rawData) {
        console.warn("⚠️ Keine Blockchain-Statistiken im localStorage gefunden.");
        return {};
    }

    //console.log("📂 Rohdaten aus localStorage geladen:", rawData);

    // JSON-Daten parsen
    let blockchainStatsdaily;
    try {
        blockchainStatsdaily = JSON.parse(rawData);
    } catch (error) {
        console.error("❌ Fehler beim Parsen der localStorage-Daten:", error);
        return {};
    }

    // Prüfen, ob die spezifische Chain existiert
    if (!blockchainStatsdaily || typeof blockchainStatsdaily !== "object") {
        console.error("❌ Unerwartetes Datenformat für blockchainStats:", blockchainStatsdaily);
        return {};
    }

    if (!blockchainStatsdaily[chainName]) {
        console.warn(`⚠️ Keine Daten für die Chain "${chainName}" gefunden.`);
   //     console.log("📌 Verfügbare Chains im localStorage:", Object.keys(blockchainStatsdaily));
        return {};
    }

    // Sicherstellen, dass `dailyTxCounts` existiert
    if (!blockchainStatsdaily[chainName].dailyTxCounts) {
        console.warn(`⚠️ Kein "dailyTxCounts" für "${chainName}" vorhanden.`);
  //      console.log("📌 Vorhandene Daten für diese Chain:", blockchainStatsdaily[chainName]);
        return {};
    }

 //   console.log(`✅ Daten für Chain "${chainName}" erfolgreich abgerufen:`, blockchainStatsdaily[chainName].dailyTxCounts);
    return blockchainStatsdaily[chainName].dailyTxCounts;
}


function createDailyTransactionsCalendar(dailyTxCounts) {
    const calendarGrid = document.getElementById("calendar-grid");
    const calendarTitle = document.getElementById("calendar-title");

    calendarGrid.innerHTML = '';  // Leere den Kalender
    calendarTitle.textContent = `Tägliche Transaktionen`;

  //  console.log("Erstelle Kalenderansicht für tägliche Transaktionen.");

    // Erstelle die Kalenderstruktur (hier für den aktuellen Monat)
    const currentMonth = new Date().getMonth();  // Aktuellen Monat holen
    const currentYear = new Date().getFullYear();  // Aktuelles Jahr holen

    // Bestimme den ersten und letzten Tag des Monats
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Die Anzahl der Tage im aktuellen Monat
    const daysInMonth = lastDayOfMonth.getDate();

    let gridContent = '';

    // Erstelle die Tage des Monats
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const txCount = dailyTxCounts[dateKey] || 0;

        gridContent += `
            <div class="calendar-day">
                <span class="calendar-day-number">${day}</span>
                <span class="calendar-tx-count">${txCount}</span>
            </div>
        `;

        //  console.log(`Datum: ${dateKey}, Transaktionen: ${txCount}`);
    }

    calendarGrid.innerHTML = gridContent;
 //   console.log("Kalenderansicht wurde befüllt.");
}


function closeCalendar() {
    document.getElementById("daily-transactions-calendar").style.display = "none";
    document.getElementById("monthly-transactions-raster").style.display = "block";
}


// document.addEventListener("DOMContentLoaded", createMonthlyTransactionsRaster);


function showDailyTransactionsForMonth(year, month, chainName) {
    const dailyTxCounts = getDailyTxCountsForChain(chainName);

    const dailyTransactions = Object.entries(dailyTxCounts)
        .filter(([date, count]) => date.startsWith(`${year}-${month.toString().padStart(2, "0")}`))
        .map(([date, count]) => ({ date, count }));

 //  console.log(`Tägliche Transaktionen für ${month}/${year} auf ${chainName}:`, dailyTransactions);

    document.getElementById("calendar-title").textContent = `Daily Transactions: ${chainName} (${month}/${year})`;

    const calendarGrid = document.getElementById("calendar-grid");
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
                    <td>${formatNumber(summedStats.erc20SentTx)}</td>
                    <td>${formatNumber(summedStats.erc20uniqueSent)}</td>
                    <td>${formatNumber(summedStats.erc20ReceivedTx)}</td>
                    <td>${formatNumber(summedStats.erc20uniqueReceived)}</td>
                </tr>
                <tr>
                    <td>ERC-721</td>
                    <td>${formatNumber(summedStats.erc721SentTx)}</td>
                    <td>${formatNumber(summedStats.erc721uniqueSentTx)}</td>
                    <td>${formatNumber(summedStats.erc721ReceivedTx)}</td>
                    <td>${formatNumber(summedStats.erc721uniqueReceivedTx)}</td>
                </tr>
                <tr>
                    <td>ERC-1155</td>
                    <td>${formatNumber(summedStats.erc1155SentTx)}</td>
                    <td>${formatNumber(summedStats.erc1155uniqueSentTx)}</td>
                    <td>${formatNumber(summedStats.erc1155ReceivedTx)}</td>
                    <td>${formatNumber(summedStats.erc1155uniqueReceivedTx)}</td>
                </tr>
            </tbody>
        </table>
        <br>
        <h2>Other Statistics</h2>
        <p><strong>Total Transactions:</strong> ${formatNumber(summedStats.totalTx)}</p>
        <p><strong>Failed Transactions:</strong> ${formatNumber(summedStats.failedTx)}</p>
        <p><strong>NFT Sent:</strong> ${formatNumber(summedStats.nftSentTx)}</p>
        <p><strong>NFT Received:</strong> ${formatNumber(summedStats.nftReceivedTx)}</p>
        <p><strong>Unique NFTs Sent:</strong> ${formatNumber(summedStats.uniqueNftSentTx)}</p>
        <p><strong>Unique NFTs Received:</strong> ${formatNumber(summedStats.uniqueNftReceivedTx)}</p>

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
    let totalChainsData = JSON.parse(localStorage.getItem("blockchainStats")) || {};
    let totalTxCounts = {};

    // Alle Chains durchgehen und Transaktionen summieren
    Object.values(totalChainsData).forEach(chainData => {
        if (!chainData.dailyTxCounts) return;

        Object.entries(chainData.dailyTxCounts).forEach(([date, count]) => {
            if (!totalTxCounts[date]) totalTxCounts[date] = 0;
            totalTxCounts[date] += count;
        });
    });

    return totalTxCounts;
}

function sumBlockchainStats() {
    const blockchainStats = JSON.parse(localStorage.getItem("blockchainStats")) || {};

    const totals = {
        erc20ReceivedTx: 0,
        erc20SentTx: 0,
        erc20uniqueReceived: 0,
        erc20uniqueSent: 0,
        erc721ReceivedTx: 0,
        erc721SentTx: 0,
        erc721uniqueReceivedTx: 0,
        erc721uniqueSentTx: 0,
        erc1155ReceivedTx: 0,
        erc1155SentTx: 0,
        erc1155uniqueReceivedTx: 0,
        erc1155uniqueSentTx: 0,
        failedTx: 0,
        nftReceivedTx: 0,
        nftSentTx: 0,
        totalTx: 0,
        uniqueNftReceivedTx: 0,
        uniqueNftSentTx: 0
    };

    Object.values(blockchainStats).forEach(chainStats => {
        Object.keys(totals).forEach(key => {
            totals[key] += chainStats[key] || 0;
        });
    });

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
        .map(([date, count]) => ({ date, count }));

  //  console.log(`Tägliche Transaktionen für ${month}/${year} (ALLE CHAINS):`, dailyTransactions);

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

function closeTotalCalendar() {
    document.getElementById("total-daily-transactions-calendar").style.display = "none";
    document.getElementById("total-transactions-raster").style.display = "block";
}



async function tokenblockscout(chain) {
 //   console.log(`tokenblockscout für ${chain.name}`);

    try {
        const response = await fetch(`http://localhost:3001/api/token-transactions?chain=${chain.name}&address=${connectedWalletAddress}`);
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


