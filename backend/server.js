require("dotenv").config();
const express = require("express");
const cors = require("cors");

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

    console.log(`🔍 getApiBase() called with chain: ${chain}`);


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
    };

    console.log(`🔎 API Base Check: ${chain} -> ${apiBases[chain] || "❌ Not Found"}`);

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
    console.log(`🔗 API Base for ${chain}:`, apiBase || "❌ Not Found!");

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
