require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { saveBlockchainStats, pool } = require("./db");



// console.log("Pool object:", pool);


const app = express();
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});

app.use(cors());
app.use(express.json());

// Test-Route, um zu prüfen, ob das Backend läuft
app.get("/", (req, res) => {
    res.send("✅ Backend läuft!");
});


function getApiBase(chain) {

   // console.log(`🔍 getApiBase() called with chain: ${chain}`);

    const apiBases = {
        ethereum: "https://api.etherscan.io/api",
        base: "https://api.basescan.org/api",
        arbitrum: "https://api.arbiscan.io/api",
        optimism: "https://api-optimistic.etherscan.io/api",
        scroll: "https://api.scrollscan.com/api",
        linea: "https://api.lineascan.build/api",
        ink: "https://explorer.inkonchain.com/api",
        soneium: "https://soneium.blockscout.com/api",
        fuse: "https://explorer.fuse.io/api",
        unichain: "https://api.uniscan.xyz/api",
        mantle: "https://api.mantlescan.xyz/api",
        zora: "https://explorer.zora.energy/api",
        worldchain: "https://api.worldscan.org/api",
        berachain: "https://api.berascan.com/api",
        taiko: "https://api.taikoscan.io/api",
        polygon: "https://api.polygonscan.com/api",
        bsc: "https://api.bscscan.com/api",
        zetachain: "https://zetachain.blockscout.com/api",
    };

  //  console.log(`🔎 API Base Check: ${chain} -> ${apiBases[chain] || "❌ Not Found"}`);

    return apiBases[chain] || null;
}


app.get("/api/proxy", async (req, res) => {
    let { chain, address } = req.query;

    // Falls chain oder address nicht existiert, Fehler ausgeben
    if (!chain || !address) {
        console.error("❌ Fehlende Parameter:", { chain, address });
        return res.status(400).json({ error: "Missing chain or address parameter" });
    }

    // Sicherstellen, dass chain ein gültiger String ist
    chain = chain.toString().trim().toLowerCase();
    if (!chain) {
        console.error("❌ Ungültiger chain-Wert:", chain);
        return res.status(400).json({ error: "Invalid chain parameter" });
    }

    let apiKey = process.env[`EXPLORER_${chain.toUpperCase()}_APIKEY`];
    let apiBase = getApiBase(chain);

    console.log(`🔍 API Key for ${chain}:`, apiKey ? "✅ Loaded" : "❌ Missing!");
  //  console.log(`🔗 API Base for ${chain}:`, apiBase || "❌ Not Found!");

    if (!apiBase || !apiKey) {
        return res.status(400).json({ error: "Invalid chain or missing API key" });
    }

    // URLs für beide Calls
    const apiUrlTxList = `${apiBase}?module=account&action=txlist&address=${address}&apikey=${apiKey}`;
    const apiUrlTxListInternal = `${apiBase}?module=account&action=txlistinternal&address=${address}&apikey=${apiKey}`;

  //  console.log(`🌐 Fetching: ${apiUrlTxList}`);
  //  console.log(`🌐 Fetching: ${apiUrlTxListInternal}`);

    try {
        // Beide API-Abfragen parallel ausführen
        const [responseTxList, responseTxListInternal] = await Promise.all([
            fetch(apiUrlTxList),
            fetch(apiUrlTxListInternal)
        ]);

        // Text aus den Antworten extrahieren
        const [textTxList, textTxListInternal] = await Promise.all([
            responseTxList.text(),
            responseTxListInternal.text()
        ]);

        let dataTxList, dataTxListInternal;

        // JSON parsen und Fehler abfangen
        try {
            dataTxList = JSON.parse(textTxList);
        } catch (error) {
            console.error("❌ JSON Parse Error (txlist):", error);
            return res.status(500).json({ error: "Invalid API response format (txlist)" });
        }

        try {
            dataTxListInternal = JSON.parse(textTxListInternal);
        } catch (error) {
            console.error("❌ JSON Parse Error (txlistinternal):", error);
            return res.status(500).json({ error: "Invalid API response format (txlistinternal)" });
        }
/*
        console.log("📩 Raw API Response (txlist):", 
            JSON.stringify(dataTxList?.result?.slice(0, 5), null, 2) || "❌ No Data"
        );

        console.log("📩 Raw API Response (txlistinternal):", 
            JSON.stringify(dataTxListInternal?.result?.slice(0, 5), null, 2) || "❌ No Data"
        );
*/

        res.json({ txlist: dataTxList, txlistinternal: dataTxListInternal });

    } catch (error) {
        console.error("❌ Error fetching blockchain data:", error);
        res.status(500).json({ error: "Failed to fetch blockchain data" });
    }
});


app.get("/api/token-transactions", async (req, res) => {
    let { chain, address } = req.query;

    // Falls chain oder address nicht existiert, Fehler ausgeben
    if (!chain || !address) {
        console.error("❌ Fehlende Parameter:", { chain, address });
        return res.status(400).json({ error: "Missing chain or address parameter" });
    }

    // Sicherstellen, dass chain ein gültiger String ist
    chain = chain.toString().trim().toLowerCase();
    if (!chain) {
        console.error("❌ Ungültiger chain-Wert:", chain);
        return res.status(400).json({ error: "Invalid chain parameter" });
    }


    let apiKey = process.env[`EXPLORER_${chain.toUpperCase()}_APIKEY`];
    let apiBase = getApiBase(chain);

    const apiUrls = {
        erc20: `${apiBase}?module=account&action=tokentx&address=${address}&apikey=${apiKey}`,
        nfts: `${apiBase}?module=account&action=tokennfttx&address=${address}&apikey=${apiKey}`
    };

    try {
        const [erc20Response, nftResponse] = await Promise.all([
            fetch(apiUrls.erc20).then(res => res.json()),
            fetch(apiUrls.nfts).then(res => res.json())
        ]);

        // Original-API-Struktur beibehalten
        res.json({
            erc20: {
                status: erc20Response.status || "0",
                message: erc20Response.message || "No data",
                result: erc20Response.result || []
            },
            nfts: {
                status: nftResponse.status || "0",
                message: nftResponse.message || "No data",
                result: nftResponse.result || []
            }
        });
    } catch (error) {
        console.error("❌ Fehler beim Abrufen der Token-Transaktionen:", error);
        res.status(500).json({
            erc20: { status: "0", message: "Server error", result: [] },
            nfts: { status: "0", message: "Server error", result: [] }
        });
    }
});


app.get("/api/erc20-transactions", async (req, res) => {
    let { chain, address } = req.query;

        // Falls chain oder address nicht existiert, Fehler ausgeben
        if (!chain || !address) {
            console.error("❌ Fehlende Parameter:", { chain, address });
            return res.status(400).json({ error: "Missing chain or address parameter" });
        }
    
        // Sicherstellen, dass chain ein gültiger String ist
        chain = chain.toString().trim().toLowerCase();
        if (!chain) {
            console.error("❌ Ungültiger chain-Wert:", chain);
            return res.status(400).json({ error: "Invalid chain parameter" });
        }

    let apiKey = process.env[`EXPLORER_${chain.toUpperCase()}_APIKEY`];
    let apiBase = getApiBase(chain);

    let url = `${apiBase}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        res.json(data.result || []);
    } catch (error) {
        console.error(`❌ Fehler beim Abrufen der ERC-20 Transaktionen für ${chain}:`, error);
        res.status(500).json([]);
    }
});


app.get("/api/erc721-transactions", async (req, res) => {
    let { chain, address } = req.query;


        // Falls chain oder address nicht existiert, Fehler ausgeben
        if (!chain || !address) {
            console.error("❌ Fehlende Parameter:", { chain, address });
            return res.status(400).json({ error: "Missing chain or address parameter" });
        }
    
        // Sicherstellen, dass chain ein gültiger String ist
        chain = chain.toString().trim().toLowerCase();
        if (!chain) {
            console.error("❌ Ungültiger chain-Wert:", chain);
            return res.status(400).json({ error: "Invalid chain parameter" });
        }


    let apiKey = process.env[`EXPLORER_${chain.toUpperCase()}_APIKEY`];
    let apiBase = getApiBase(chain);

    let url = `${apiBase}?module=account&action=tokennfttx&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        res.json(data.result || []);
    } catch (error) {
        console.error("❌ Fehler beim Abrufen der ERC-721-Transaktionen:", error);
        res.status(500).json([]);
    }
});


app.get("/api/erc1155-transactions", async (req, res) => {
    let { chain, address } = req.query;

        // Falls chain oder address nicht existiert, Fehler ausgeben
        if (!chain || !address) {
            console.error("❌ Fehlende Parameter:", { chain, address });
            return res.status(400).json({ error: "Missing chain or address parameter" });
        }
    
        // Sicherstellen, dass chain ein gültiger String ist
        chain = chain.toString().trim().toLowerCase();
        if (!chain) {
            console.error("❌ Ungültiger chain-Wert:", chain);
            return res.status(400).json({ error: "Invalid chain parameter" });
        }

    let apiKey = process.env[`EXPLORER_${chain.toUpperCase()}_APIKEY`];
    let apiBase = getApiBase(chain);

    let url = `${apiBase}?module=account&action=token1155tx&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        res.json(data.result || []);
    } catch (error) {
        console.error("❌ Fehler beim Abrufen der ERC-1155-Transaktionen:", error);
        res.status(500).json([]);
    }
});


app.post("/api/saveBlockchainStats", async (req, res) => {
    try {
        const { wallet, chain, stats } = req.body;

        // Logge die eingehenden Daten
    //     console.log("Wallet:", wallet);
    //     console.log("chain:", chain);
   //      console.log("Received stats:", stats);

        if (!wallet || !chain) {
            console.error("❌ Invalid wallet or chain:", wallet, chain);
            return res.status(400).json({ success: false, error: "Invalid wallet or chain" });
        }

        // Weiter mit dem Speichern der Daten
        await saveBlockchainStats(wallet, chain, stats);
        res.json({ success: true, message: "Stats saved successfully" });
    } catch (error) {
        console.error("❌ Error saving blockchain stats:", error);
        res.status(500).json({ success: false, error: "Database error" });
    }
});


// Get all blockchain stats for a wallet

app.get("/api/getBlockchainStats/:wallet", async (req, res) => {
    const client = await pool.connect();
    try {
        const wallet = req.params.wallet;

        // 1️⃣ Temporäre Tabelle erstellen
        await client.query(`
            CREATE TEMP TABLE parsed_temp AS
            SELECT 
                wallet_address,
                chain,
                (tx_entry).key::DATE AS tx_date,
                (tx_entry).value::INTEGER AS tx_count
            FROM wallet_chain_stats,
            LATERAL jsonb_each_text(daily_tx_counts) AS tx_entry;
        `);

        // 2️⃣ Hauptabfrage mit Berechnungen + Originaldaten
        const result = await client.query(
            `
            WITH base_stats AS (
                SELECT 
                    wallet_address,
                    chain,
                    MIN(tx_date) AS firstTxDate,
                    MAX(tx_date) AS lastTxDate,
                    COUNT(DISTINCT tx_date) AS daysUsed,
                    COUNT(DISTINCT DATE_TRUNC('week', tx_date)) AS weeksUsed,
                    COUNT(DISTINCT DATE_TRUNC('month', tx_date)) AS monthsUsed,
                    COUNT(DISTINCT DATE_TRUNC('year', tx_date)) AS yearsUsed
                FROM parsed_temp
                GROUP BY wallet_address, chain
            ),
            streaks AS (
                SELECT 
                    wallet_address,
                    chain,
                    tx_date,
                    tx_date - LAG(tx_date) OVER (PARTITION BY wallet_address, chain ORDER BY tx_date) = 1 AS is_continuous
                FROM parsed_temp
            ),
            streak_groups AS (
                SELECT 
                    wallet_address,
                    chain,
                    tx_date,
                    SUM(CASE WHEN is_continuous THEN 0 ELSE 1 END) OVER (PARTITION BY wallet_address, chain ORDER BY tx_date) AS streak_id
                FROM streaks
            ),
            streak_lengths AS (
                SELECT 
                    wallet_address,
                    chain,
                    streak_id,
                    COUNT(*) AS streak_length
                FROM streak_groups
                GROUP BY wallet_address, chain, streak_id
            ),
            longest_streak_calc AS (
                SELECT 
                    wallet_address,
                    chain,
                    MAX(streak_length) AS longestStreak
                FROM streak_lengths
                GROUP BY wallet_address, chain
            ),
            current_streak_calc AS (
                SELECT 
                    wallet_address,
                    chain,
                    COUNT(*) AS currentStreak
                FROM (
                    SELECT 
                        wallet_address,
                        chain,
                        tx_date,
                        MAX(tx_date) OVER (PARTITION BY wallet_address, chain) AS last_tx_date,
                        ROW_NUMBER() OVER (PARTITION BY wallet_address, chain ORDER BY tx_date DESC) - 1 AS days_ago
                    FROM parsed_temp
                    WHERE tx_date <= CURRENT_DATE
                ) sub
                WHERE last_tx_date - days_ago * INTERVAL '1 day' = tx_date
                GROUP BY wallet_address, chain
            ),
            most_active_day_calc AS (
                SELECT 
                    wallet_address,
                    chain,
                    tx_date AS mostActiveDay
                FROM (
                    SELECT 
                        wallet_address,
                        chain,
                        tx_date,
                        SUM(tx_count) AS total_tx,
                        ROW_NUMBER() OVER (PARTITION BY wallet_address, chain ORDER BY SUM(tx_count) DESC, tx_date DESC) AS rn
                    FROM parsed_temp
                    GROUP BY wallet_address, chain, tx_date
                ) sub
                WHERE rn = 1
            ),
            most_active_month_calc AS (
                SELECT 
                    wallet_address,
                    chain,
                    month_start AS mostActiveMonth
                FROM (
                    SELECT 
                        wallet_address,
                        chain,
                        DATE_TRUNC('month', tx_date) AS month_start,
                        SUM(tx_count) AS total_tx,
                        ROW_NUMBER() OVER (PARTITION BY wallet_address, chain ORDER BY SUM(tx_count) DESC, DATE_TRUNC('month', tx_date) DESC) AS rn
                    FROM parsed_temp
                    GROUP BY wallet_address, chain, DATE_TRUNC('month', tx_date)
                ) sub
                WHERE rn = 1
            )
            SELECT 
                wcs.*, -- 👈 Hier werden ALLE Originaldaten aus wallet_chain_stats eingefügt!
                TO_CHAR(bs.firstTxDate, 'YYYY-MM-DD') AS firstTxDate, -- ✅ Nur Datum
                TO_CHAR(bs.lastTxDate, 'YYYY-MM-DD') AS lastTxDate,   -- ✅ Nur Datum
                bs.daysUsed,
                bs.weeksUsed,
                bs.monthsUsed,
                bs.yearsUsed,
                COALESCE(lsc.longestStreak, 0) AS longestStreak,
                COALESCE(csc.currentStreak, 0) AS currentStreak,
                TO_CHAR(mad.mostActiveDay, 'YYYY-MM-DD') AS mostActiveDay,  -- ✅ Nur Datum
                TO_CHAR(mam.mostActiveMonth, 'YYYY-MM-DD') AS mostActiveMonth -- ✅ Nur Datum
            FROM wallet_chain_stats wcs
            LEFT JOIN base_stats bs ON wcs.wallet_address = bs.wallet_address AND wcs.chain = bs.chain
            LEFT JOIN longest_streak_calc lsc ON wcs.wallet_address = lsc.wallet_address AND wcs.chain = lsc.chain
            LEFT JOIN current_streak_calc csc ON wcs.wallet_address = csc.wallet_address AND wcs.chain = csc.chain
            LEFT JOIN most_active_day_calc mad ON wcs.wallet_address = mad.wallet_address AND wcs.chain = mad.chain
            LEFT JOIN most_active_month_calc mam ON wcs.wallet_address = mam.wallet_address AND wcs.chain = mam.chain
            WHERE wcs.wallet_address = $1
            ORDER BY wcs.wallet_address, wcs.chain;
            `,
            [wallet]
        );

        // 3️⃣ Temporäre Tabelle aufräumen
        await client.query("DROP TABLE parsed_temp;");

        // Ergebnis zurücksenden
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("❌ Error fetching blockchain stats:", error);
        res.status(500).json({ success: false, error: "Database error" });
    } finally {
        client.release();
    }
});




/*
app.get("/getBlockchainStats/:wallet", async (req, res) => {
    try {
        const wallet = req.params.wallet;
        const result = await pool.query(
            "SELECT * FROM wallet_chain_stats WHERE wallet_address = $1",
            [wallet]
        );

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("❌ Error fetching blockchain stats:", error);
        res.status(500).json({ success: false, error: "Database error" });
    }
});
*/

// Get stats for a specific chain
app.get("/api/getChainStats/:wallet/:chain", async (req, res) => {
    try {
        const { wallet, chain } = req.params;
        const result = await pool.query(
            "SELECT * FROM wallet_chain_stats WHERE wallet_address = $1 AND chain = $2",
            [wallet, chain]
        );

        res.json({ success: true, data: result.rows.length > 0 ? result.rows[0] : null });
    } catch (error) {
        console.error("❌ Error fetching chain stats:", error);
        res.status(500).json({ success: false, error: "Database error" });
    }
});

app.post("/api/github-trigger", async (req, res) => {
    try {
        console.log("Trigger Request gestartet...");

        const username = process.env.USERNAME;
        const repoCheck = process.env.REPO_CHECK; // für die bla.json-Prüfung
        const repoTrigger = process.env.REPO; // für das private Trigger-Repo
        const workflowFile = process.env.WORKFLOW_FILE;
        const token = process.env.PAT_PUSH;
        const branch = process.env.BRANCH;

        const fileUrl = `https://api.github.com/repos/${username}/${repoCheck}/contents/bla.json?ref=${branch}`;

        // 👉 Schritt 1: Existenz prüfen
        const fileRes = await fetch(fileUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json",
            },
        });

        console.log("Status bei Datei-Prüfung:", fileRes.status);

        if (fileRes.status !== 200) {
            console.log("bla.json nicht gefunden. Abbruch.");
            return res.status(404).json({ error: "bla.json not found" });
        }

        const fileData = await fileRes.json();
        const fileSha = fileData.sha;

        // 👉 Schritt 2: Workflow im privaten Repo auslösen
        const triggerRes = await fetch(`https://api.github.com/repos/${username}/${repoTrigger}/actions/workflows/${workflowFile}/dispatches`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json",
            },
            body: JSON.stringify({ ref: branch }),
        });

        const triggerBody = await triggerRes.text();
        console.log("GitHub Trigger Response:", triggerBody);

        if (!triggerRes.ok) {
            return res.status(triggerRes.status).json({ error: "Fehler beim Triggern", details: triggerBody });
        }

        // 👉 Schritt 3: bla.json löschen
        const deleteRes = await fetch(fileUrl, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json",
            },
            body: JSON.stringify({
                message: "Remove bla.json after trigger",
                sha: fileSha,
            }),
        });

        const deleteBody = await deleteRes.text();
        console.log("Löschen Response:", deleteBody);

        if (!deleteRes.ok) {
            return res.status(deleteRes.status).json({ error: "Trigger erfolgreich, aber bla.json konnte nicht gelöscht werden", details: deleteBody });
        }

        return res.status(200).json({ message: "✅ Workflow ausgelöst & bla.json gelöscht!" });
    } catch (error) {
        console.error("Fehler:", error);
        return res.status(500).json({ error: "Interner Serverfehler" });
    }
});


