const { Pool } = require('pg');
const fs = require('fs');
const path = require('path'); // <-- FEHLTE

require('dotenv').config(); // .env Variablen laden

const certPath = path.join(__dirname, 'ca.crt');
console.log("Lese Zertifikat von:", certPath);

try {
    const cert = fs.readFileSync(certPath);
    console.log("✅ Zertifikat erfolgreich geladen!");
} catch (error) {
    console.error("❌ Fehler beim Laden des Zertifikats:", error);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
});

(async () => {
    try {
        const client = await pool.connect();
        console.log("✅ Secure connection to the database established!");
        client.release();
    } catch (err) {
        console.error("❌ Database connection error:", err);
    }
})();



async function saveBlockchainStats(wallet, chain, stats) {

    try {
        console.log('Attempting to save blockchain stats for wallet:', wallet);

        // Überprüfen, ob dailyTxCounts vorhanden ist
        if (!stats.dailyTxCounts) {
            console.error('dailyTxCounts fehlt oder ist undefined');
            return;  // Oder eine alternative Fehlerbehandlung
        }

        // Convert JSON fields if necessary
        const dailyTxCounts = JSON.stringify(stats.dailyTxCounts);
   //     console.log('Converted dailyTxCounts:', dailyTxCounts);

        const query = `
            INSERT INTO wallet_chain_stats (
                wallet_address, chain, total_tx, failed_tx, success_rate,
                erc20_sent_tx, erc20_unique_sent, erc20_received_tx, erc20_unique_received,
                nft_sent_tx, unique_nft_sent_tx, nft_received_tx, unique_nft_received_tx,              
                daily_tx_counts, erc721_sent, erc721_unique_sent, erc721_received, erc721_unique_received,
                erc1155_sent, erc1155_unique_sent_tx, erc1155_received, erc1155_unique_received
            ) VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9,
                $18, $19, $20, $21,
                $22, $10, $11, $12, $13,
                $14, $15, $16, $17
            )

            ON CONFLICT (wallet_address, chain) 
            DO UPDATE SET 
                total_tx = EXCLUDED.total_tx,
                failed_tx = EXCLUDED.failed_tx,
                success_rate = EXCLUDED.success_rate,
                erc20_sent_tx = EXCLUDED.erc20_sent_tx,
                erc20_unique_sent = EXCLUDED.erc20_unique_sent,
                erc20_received_tx = EXCLUDED.erc20_received_tx,
                erc20_unique_received = EXCLUDED.erc20_unique_received,
                nft_sent_tx = EXCLUDED.nft_sent_tx,
                unique_nft_sent_tx = EXCLUDED.unique_nft_sent_tx,
                nft_received_tx = EXCLUDED.nft_received_tx,
                unique_nft_received_tx = EXCLUDED.unique_nft_received_tx,                
                daily_tx_counts = wallet_chain_stats.daily_tx_counts || EXCLUDED.daily_tx_counts,
                erc721_sent = EXCLUDED.erc721_sent, 
                erc721_unique_sent = EXCLUDED.erc721_unique_sent, 
                erc721_received = EXCLUDED.erc721_received, 
                erc721_unique_received = EXCLUDED.erc721_unique_received,
                erc1155_sent = EXCLUDED.erc1155_sent, 
                erc1155_unique_sent_tx = EXCLUDED.erc1155_unique_sent_tx,
                erc1155_received = EXCLUDED.erc1155_received,
                erc1155_unique_received = EXCLUDED.erc1155_unique_received;
        `;

        const values = [
            wallet, chain,
            stats.totalTx, stats.failedTx, stats.successRate,
            stats.erc20SentTx, stats.erc20uniqueSent, stats.erc20ReceivedTx, stats.erc20uniqueReceived,
            stats.erc721SentTx, stats.erc721uniqueSentTx, stats.erc721ReceivedTx, stats.erc721uniqueReceivedTx,
            stats.erc1155SentTx, stats.erc1155uniqueSentTx, stats.erc1155ReceivedTx, stats.erc1155uniqueReceivedTx,
            stats.nftSentTx, stats.uniqueNftSentTx, stats.nftReceivedTx, stats.uniqueNftReceivedTx,
            dailyTxCounts
        ];

        await pool.query(query, values);
        console.log(`✅ Successfully saved for Wallet: ${wallet} on ${chain}`);
    } catch (error) {
        console.error("❌ Error saving data:", error);
    }
}



module.exports = {
    saveBlockchainStats,
    pool
};

module.esport2 = {
    saveBlockchainStats,
    pool
};


