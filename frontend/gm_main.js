async function renderChainButtons() {
    const container = document.getElementById("chainsContainer");
    container.innerHTML = "";

    for (const chainId in contracts) {
        const chain = contracts[chainId];

        const addressLink = chain.explorer.replace('/tx/', '/address/') + chain.address;
        const internalLink = chain.explorer.replace('/tx/', '/address/') + chain.responseAddress;

        const chainDiv = document.createElement("div");
        chainDiv.classList.add("chain-container");

        chainDiv.innerHTML = `<p><strong>${chain.name}</strong><br>
            <a href="${addressLink}" target="_blank" class="chain-link">GM Contract |</a> 
            <a href="${internalLink}" target="_blank" class="chain-link">Internal Transaction Contract</a></p>
            <div class="button-container">
                <button onclick="handleButtonClick(${chainId})" id="gmButton-${chainId}" disabled>⏳ Checking chain...</button>
                <span id="status-${chainId}">Waiting for action...</span>
            </div>
        `;

        // "Get Response"-Button hinzufügen
        if (chain.responseAddress && chain.responseAddress !== "") {
            const responseDiv = document.createElement("div");
            responseDiv.classList.add("button-container");

            responseDiv.innerHTML = `
                <button id="responseButton-${chainId}" onclick="sendResponse(${chainId})" disabled>⚡ Get Internal Transaction</button>
                <span id="response-status-${chainId}">Waiting for action...</span>
            `;

            chainDiv.appendChild(responseDiv);
        }

        // ✅ Button: "Send to Receiver" (falls `receiveAddress` existiert)
        if (chain.receiveAddress && chain.receiveAddress !== "") {
            const sendDiv = document.createElement("div");
            sendDiv.classList.add("button-container");

            sendDiv.innerHTML = `
                <button id="sendButton-${chainId}" onclick="sendToReceiver(${chainId})" disabled>⚡ Send to Receiver</button>
                <span id="send-status-${chainId}">Waiting for transaction...</span>
            `;

            chainDiv.appendChild(sendDiv);
        }

     //   container.appendChild(chainDiv);
    

        // ✅ Neuer Button: "Deploy Contract"
        if (chain.deployEnabled) {
            const deployDiv = document.createElement("div");
            deployDiv.classList.add("button-container");

            deployDiv.innerHTML = `
                <button id="deployButton-${chainId}" onclick="deployContract(${chainId})" disabled>🚀 Deploy Contract (cheap)</button>
                <span id="deploy-status-${chainId}">Waiting for action...</span>
            `;

            chainDiv.appendChild(deployDiv);
        }


        // ✅ Neuer Button: "Deploy Contract2"
        if (chain.deployEnabled) {
            const deployDiv2 = document.createElement("div");
            deployDiv2.classList.add("button-container");

            deployDiv2.innerHTML = `
                <button id="deployButton2-${chainId}" onclick="deployContract2(${chainId})" disabled>🚀 Deploy Contract (10k characters)</button>
                <span id="deploy-status2-${chainId}">Waiting for action...</span>
            `;

            chainDiv.appendChild(deployDiv2);
        }


        container.appendChild(chainDiv);
    }

    await checkCurrentChain();
}


async function checkCurrentChain() {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    const network = await provider.getNetwork();

    // **Prüfen, ob eine Wallet verbunden ist**
    if (!localStorage.getItem("walletConnected") || !signer) {
        console.log("🚫 Keine Wallet verbunden, deaktiviere GM-Buttons.");
        disableGMButtons();
        return;
    }



    for (const chainId in contracts) {
        const button = document.getElementById(`gmButton-${chainId}`);
        const responseButton = document.getElementById(`responseButton-${chainId}`);
        const sendButton = document.getElementById(`sendButton-${chainId}`);
        const deployButton = document.getElementById(`deployButton-${chainId}`);
        const deployButton2 = document.getElementById(`deployButton2-${chainId}`);


        if (!button) continue;

        if (parseInt(chainId) === network.chainId) {
            // Aktivieren, wenn die richtige Chain aktiv ist
            button.innerText = "🚀 Say GM";
            button.onclick = () => sendGM(chainId);
            button.disabled = false;

            if (responseButton) responseButton.disabled = false;
            if (sendButton) sendButton.disabled = false;
            if (deployButton) deployButton.disabled = false;
            if (deployButton2) deployButton2.disabled = false;


        } else {
            // Deaktivieren, wenn falsche Chain aktiv ist
            button.innerText = `🔄 Switch to ${contracts[chainId].name}`;
            button.onclick = () => switchToChain(chainId);
            button.disabled = false;

            if (responseButton) responseButton.disabled = true;
            if (sendButton) sendButton.disabled = true;
            if (deployButton) deployButton.disabled = true;
            if (deployButton2) deployButton2.disabled = true;


        }
    }
}



async function deployContract(chainId) {
    try {
        const statusSpan = document.getElementById(`deploy-status-${chainId}`);
        statusSpan.innerText = "Deploying...";

        const feeAmount = ethers.utils.parseEther("0.000005"); // 0.000005 ETH

        const bytecode = "60806040525f34116100485760405162461bcd60e51b815260206004820152600d60248201526c09aeae6e840e6cadcc8408aa89609b1b60448201526064015b60405180910390fd5b6040515f90732e7520254060d925608e96cc7a1d43cc6c6d93839034908381818185875af1925050503d805f811461009b576040519150601f19603f3d011682016040523d82523d5f602084013e6100a0565b606091505b50509050806100f15760405162461bcd60e51b815260206004820152601e60248201527f5472616e7366657220746f206665655265636569766572206661696c65640000604482015260640161003f565b50603e806100fe5f395ff3fe60806040525f80fdfea2646970667358221220c590444caa5a2acdf6e1fb36e1b4a46ed2e883ed310f585b851799750341e1a564736f6c63430008140033";

        const abi = ["constructor() payable"];

        const factory = new ethers.ContractFactory(abi, bytecode, signer);

        console.log("Fee Amount (ETH):", ethers.utils.formatEther(feeAmount));

        const contract = await factory.deploy({ value: feeAmount });
        await contract.deployed();

        const receipt = await contract.deployTransaction.wait();
        const contractAddress = receipt.contractAddress;
        const txHash = contract.deployTransaction.hash;

        console.log("Contract deployed at:", contractAddress);

        statusSpan.innerHTML = `✅ Deployed! 
            <a href="${contracts[chainId].explorer.replace('/tx/', '/address/')}${contractAddress}" target="_blank">📜 Contract</a> | 
            <a href="${contracts[chainId].explorer}${txHash}" target="_blank">🔗 Transaction</a>`;

    } catch (error) {
        console.error("Deployment failed:", error);
        document.getElementById(`deploy-status-${chainId}`).innerText = `❌ Deployment failed! <br> ${error.message}`;
    }
}

async function deployContract2(chainId) {
    try {
        const statusSpan = document.getElementById(`deploy-status2-${chainId}`);
        statusSpan.innerText = "Deploying...";

        const feeAmount = ethers.utils.parseEther("0.00001");
        const bytecode = "60806040525f34116100485760405162461bcd60e51b815260206004820152600d60248201526c09aeae6e840e6cadcc8408aa89609b1b60448201526064015b60405180910390fd5b6040515f90732e7520254060d925608e96cc7a1d43cc6c6d93839034908381818185875af1925050503d805f811461009b576040519150601f19603f3d011682016040523d82523d5f602084013e6100a0565b606091505b50509050806100f15760405162461bcd60e51b815260206004820152601e60248201527f5472616e7366657220746f206665655265636569766572206661696c65640000604482015260640161003f565b50610c49806100ff5f395ff3fe608060405234801561000f575f80fd5b5060043610610743575f3560e01c80638db2ad66116103b7578063cb4afe83116101f5578063e97bdf0e1161011f578063f11fe479116100b4578063f947ca8111610084578063f947ca8114610ae7578063fd821f8514610aee578063fdcf8a6114610af5578063ffc21ccb14610afc575f80fd5b8063f11fe47914610acb578063f16493c814610ad2578063f26dbba514610ad9578063f737643a14610ae0575f80fd5b8063ec5fe940116100ef578063ec5fe94014610a97578063ede9ba8b14610a9e578063ef44041c14610abd578063ef97b5f914610ac4575f80fd5b8063e97bdf0e14610a7b578063e9c7c03d14610a82578063e9f4ebc914610a89578063eb40fae114610a90575f80fd5b8063d93f8c4811610195578063e26856a311610165578063e26856a314610a5f578063e32a2a8714610a66578063e48f6e2014610a6d578063e542f1ea14610a74575f80fd5b8063d93f8c4814610a43578063de58bf6c14610a4a578063deca674614610a51578063e0dc4d3914610a58575f80fd5b8063cd097896116101d0578063cd09789614610a27578063d22d8dbe14610a2e578063d79620dc14610a35578063d871256614610a3c575f80fd5b8063cb4afe8314610a12578063cb94f97d14610a19578063cb97d4b614610a20575f80fd5b8063b0f4dcc7116102e1578063c3d45e9511610276578063c67acd3711610246578063c67acd37146109f6578063c6e4dab2146109fd578063c78223e314610a04578063c9b2662814610a0b575f80fd5b8063c3d45e95146109da578063c4767c71146109e1578063c4f9d713146109e8578063c5deb43e146109ef575f80fd5b8063bebd2a33116102b1578063bebd2a33146109be578063bf95525d146109c5578063c01e1433146109cc578063c28d1847146109d3575f80fd5b8063b0f4dcc7146109a2578063b39003cb146109a9578063be0d7484146109b0578063bebc08aa146109b7575f80fd5b80639b32bafe11610357578063aac2e3d411610327578063aac2e3d41461097a578063ab35ec6314610981578063aefb26d914610994578063b01e792b1461099b575f80fd5b80639b32bafe1461095e5780639dbd01c6146109655780639fe7aa011461096c578063aaba44b014610973575f80fd5b806390b35ea31161039257806390b35ea314610942578063922fc1d81461094957806392b002a71461095057806399793d5d14610957575f80fd5b80638db2ad661461092d5780638f27d8ae146109345780639013ac1a1461093b575f80fd5b806359de02b4116105845780636f099cfa116104ae5780637dcf613a1161044357806385b069461161041357806385b0694614610911578063876d4ed7146109185780638bb58c191461091f5780638d17e24e14610926575f80fd5b80637dcf613a146108f55780638210006f146108fc5780638338f1a3146109035780638427c2841461090a575f80fd5b8063743020711161047e57806374302071146108d957806376a3ffbf146108e0578063775cbebd146108e75780637c59a364146108ee575f80fd5b80636f099cfa146108bd578063709e295b146108c4578063732c1e3d146108cb57806373bdf2a5146108d2575f80fd5b80635f95db86116105245780636877a068116104f45780636877a068146108a1578063699a1133146108a85780636ae55881146108af5780636b9d4d76146108b6575f80fd5b80635f95db8614610885578063613d04341461088c5780636577544a146108935780636692ed661461089a575f80fd5b80635c88ca6b1161055f5780635c88ca6b146108695780635da22e5f146108705780635f6f05bd146108775780635f7b715a1461087e575f80fd5b806359de02b4146108545780635ae49bf61461085b5780635bf7685914610862575f80fd5b80632ebadfd71161067057806349e46e7f116106055780634dc6bc16116105d55780634dc6bc16146108385780634f9d1fd61461083f578063536652ba146108465780635892c1061461084d575f80fd5b806349e46e7f1461081c5780634a199107146108235780634b1a4d221461082a5780634c222ce114610831575f80fd5b8063446bb48c11610640578063446bb48c14610800578063458e8e5914610807578063492cf68b1461080e578063497059ee14610815575f80fd5b80632ebadfd7146107e45780632ebeec6b146107eb57806339a9640b146107f25780633d6c7781146107f9575f80fd5b80630dca6082116106e657806319772ad9116106b657806319772ad9146107c85780631a2c7e6f146107cf57806326501bad146107d65780632c058df8146107dd575f80fd5b80630dca6082146107865780630f0db7781461079b57806313ae4e2c146107ba578063184c9f67146107c1575f80fd5b8063078e9b4a11610721578063078e9b4a1461076a57806307df8d1c1461077157806309ab6333146107785780630d0f58101461077f575f80fd5b80630251d29814610747578063037c3e321461075c57806305f4132314610763575b5f80fd5b60475b60405190815260200160405180910390f35b603a61074a565b601261074a565b602361074a565b602561074a565b607161074a565b602c61074a565b610799610794366004610bc8565b610b03565b005b6107996107a9366004610bc8565b5f9182526064602052604090912055565b600d61074a565b602861074a565b600461074a565b601561074a565b605661074a565b600c61074a565b603f61074a565b601761074a565b601f61074a565b605561074a565b602061074a565b602b61074a565b603161074a565b606061074a565b603361074a565b601661074a565b605e61074a565b602f61074a565b601461074a565b600a61074a565b605c61074a565b602461074a565b601961074a565b605b61074a565b604661074a565b606961074a565b606e61074a565b600961074a565b604a61074a565b605d61074a565b603b61074a565b607261074a565b606361074a565b605361074a565b603d61074a565b607061074a565b607761074a565b602761074a565b601e61074a565b605161074a565b603061074a565b604961074a565b604b61074a565b603961074a565b605f61074a565b603e61074a565b603261074a565b600361074a565b607661074a565b600561074a565b607461074a565b606561074a565b605961074a565b601061074a565b600261074a565b603861074a565b605261074a565b606f61074a565b605761074a565b602661074a565b606461074a565b601d61074a565b606261074a565b604c61074a565b606661074a565b61074a61098f366004610be8565b610b67565b602961074a565b603661074a565b604d61074a565b605061074a565b603461074a565b604561074a565b604f61074a565b601c61074a565b606d61074a565b602d61074a565b604261074a565b600b61074a565b604461074a565b607861074a565b600661074a565b606761074a565b604861074a565b607361074a565b601a61074a565b601b61074a565b605a61074a565b604161074a565b602a61074a565b602261074a565b604e61074a565b606a61074a565b605861074a565b601861074a565b601161074a565b603561074a565b602e61074a565b607561074a565b603c61074a565b606c61074a565b604361074a565b606161074a565b606b61074a565b600f61074a565b61074a610aac366004610be8565b5f9081526064602052604090205490565b604061074a565b600e61074a565b600761074a565b605461074a565b603761074a565b600161074a565b601361074a565b606861074a565b600861074a565b602161074a565b60648210610b4e5760405162461bcd60e51b8152602060048201526013602482015272496e646578206f7574206f6620626f756e647360681b60448201526064015b60405180910390fd5b805f8360648110610b6157610b61610bff565b01555050565b5f60648210610bae5760405162461bcd60e51b8152602060048201526013602482015272496e646578206f7574206f6620626f756e647360681b6044820152606401610b45565b5f8260648110610bc057610bc0610bff565b015492915050565b5f8060408385031215610bd9575f80fd5b50508035926020909101359150565b5f60208284031215610bf8575f80fd5b5035919050565b634e487b7160e01b5f52603260045260245ffdfea26469706673582212202c67f7420bd844de5f885437d6f0b14c5cd728a41695f71d6be4468bec095dee64736f6c63430008140033";

        const abi = ["constructor() payable"];

        const factory = new ethers.ContractFactory(abi, bytecode, signer);

        console.log("Fee Amount (ETH):", ethers.utils.formatEther(feeAmount));

        const contract = await factory.deploy({ value: feeAmount });
        await contract.deployed();

        const receipt = await contract.deployTransaction.wait();
        const contractAddress = receipt.contractAddress;
        const txHash = contract.deployTransaction.hash;

        console.log("Contract deployed at:", contractAddress);

        statusSpan.innerHTML = `✅ Deployed! 
            <a href="${contracts[chainId].explorer.replace('/tx/', '/address/')}${contractAddress}" target="_blank">📜 Contract</a> | 
            <a href="${contracts[chainId].explorer}${txHash}" target="_blank">🔗 Transaction</a>`;

    } catch (error) {
        console.error("Deployment failed:", error);
        document.getElementById(`deploy-status2-${chainId}`).innerText = `❌ Deployment failed! <br> ${error.message}`;
    }
}




async function sendToReceiver(chainId) {
    try {
        const chain = contracts[chainId];
        if (!chain || !chain.receiveAddress) {
            throw new Error("No receiver contract available.");
        }

         provider = new ethers.providers.Web3Provider(window.ethereum);
         signer = provider.getSigner();

        const abi = [
            {
                "inputs": [],
                "name": "fundResponder",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            }
        ];

        const contract = new ethers.Contract(chain.receiveAddress, abi, signer);

        // Dynamischer ETH-Betrag basierend auf aktuellem Gaspreis
        const gasPrice = await provider.getGasPrice();
        const gasLimit = 100000; // Manuell festgelegtes Limit, leicht erhöht für Sicherheit

        const value = gasPrice.mul(gasLimit).mul(11).div(10); // +10% Puffer

        // Transaktion senden mit manuellem Gaslimit
        const tx = await contract.fundResponder({ value, gasLimit });
        const explorerLink = `${contracts[chainId].explorer}${tx.hash}`;

        document.getElementById(`send-status-${chainId}`).innerHTML = `✅ TX sent: <a href="${explorerLink}" target="_blank">View TX</a>`;
    } catch (error) {
        document.getElementById(`send-status-${chainId}`).innerText = `❌ Error: ${error.message}`;
    }
}

        
        async function sendGM(chainId) {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            const contract = new ethers.Contract(contracts[chainId].address, abi, signer);
            try {
                const tx = await contract.sayGM();
                const explorerLink = `${contracts[chainId].explorer}${tx.hash}`;
                document.getElementById(`status-${chainId}`).innerHTML = `✅ TX sent: <a href="${explorerLink}" target="_blank">View TX</a>`;
            } catch (error) {
                document.getElementById(`status-${chainId}`).innerText = `❌ Error: ${error.message}`;
            }
        }

        if (window.ethereum) {
            window.ethereum.on("chainChanged", async () => {
                setTimeout(async () => {
                    await checkCurrentChain();
                }, 1000);
            });
        }


async function sendResponse(chainId) {
    try {
        const chain = contracts[chainId];
        if (!chain || !chain.responseAddress) {
            throw new Error("No response contract available.");
        }

            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();

        // Definiere ABI falls nicht global vorhanden
        const abi = [
            {
                "inputs": [],
                "name": "trigger",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            }
        ];

        const contract = new ethers.Contract(chain.responseAddress, abi, signer);

        // Stelle sicher, dass contract eine trigger-Funktion hat
        if (typeof contract.trigger !== "function") {
            throw new Error("contract.trigger is not a function");
        }

        // Aktuellen Gaspreis abrufen
        const gasPrice = await provider.getGasPrice();
        const gasLimit = 50000; // Feste Gasmenge, die der Contract erwartet

        // Berechne den Gesamtbetrag (Gaspreis * Gaslimit * 1.1)
        const value = gasPrice.mul(gasLimit).mul(11).div(10);

        // Transaktion senden mit dynamischem Value
        const tx = await contract.trigger({ value });
        const explorerLink = `${contracts[chainId].explorer}${tx.hash}`;

        document.getElementById(`response-status-${chainId}`).innerHTML = `✅ TX sent: <a href="${explorerLink}" target="_blank">View TX</a>`;
    } catch (error) {
        document.getElementById(`response-status-${chainId}`).innerText = `❌ Error: ${error.message}`;
    }
}





