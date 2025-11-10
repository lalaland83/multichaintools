
provider = new ethers.providers.Web3Provider(window.ethereum);

function createHyperlanePage() {

    const pageContainer = document.createElement('div');
    pageContainer.id = "HyperlaneMessagePage";
    pageContainer.className = "page";
    pageContainer.style.display = 'none';

    pageContainer.innerHTML = `
        <style>
            .hyper-container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background: #1a1a1a;
                border-radius: 12px;
            }
            .hyper-title {
                text-align: center;
                color: #d1d5db;
                font-size: 24px;
                margin-bottom: 20px;
            }
            .hyper-form {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            .hyper-form-group {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            .hyper-form-group label {
                color: #d1d5db;
                font-size: 14px;
            }
            .hyper-form-group select,
            .hyper-form-group textarea,
            .hyper-form-group input[type="text"] {
                background: #2a2d35;
                color: #d1d5db;
                border: 1px solid #3a3f4b;
                border-radius: 8px;
                padding: 8px;
                font-size: 14px;
                width: 100%;
                box-sizing: border-box;
            }
            .hyper-form-group select {
                max-width: 200px;
            }
            .hyper-form-group textarea {
                resize: vertical;
            }
            .hyper-form-group input[type="text"] {
                max-width: 100px;
            }
            .hyper-button-group {
                display: flex;
                gap: 10px;
                justify-content: center;
            }
            .hyper-chains-list {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 10px;
                margin-top: 20px;
            }
            .hyper-chains-list li {
                background: #2a2d35;
                padding: 10px;
                border-radius: 8px;
                color: #d1d5db;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            @media (max-width: 500px) {
                .hyper-container {
                    max-width: 90%;
                    padding: 15px;
                }
                .hyper-form-group select,
                .hyper-form-group textarea {
                    max-width: 100%;
                }
            }
        </style>
        <div class="hyper-container">
            <h2 class="hyper-title">Hyperlane Message</h2>
            <div class="hyper-form">
                <div class="hyper-form-group">
                    <label for="chainDropdownhype">Source Chain</label>
                    <select id="chainDropdownhype"></select>
                </div>
                <div class="hyper-form-group">
                    <label for="messageInput">Message</label>
                    <textarea id="messageInput" rows="2" cols="50">I am gay</textarea>
                </div>
                <div class="hyper-form-group">
                    <label for="additionalFees">Additional Fees</label>
                    <input type="text" id="additionalFees" value="0" placeholder="0">
                </div>
            </div>
            <div class="hyper-button-group">
                <button id="sendMessageButton" class="message-btn" onclick="sendHyperlaneMessage()">📤 Send</button>
                <button id="clearMessageButton" class="message-btn" onclick="clearHyperlaneMessage()">❌ Clear</button>
            </div>
            <div id="chainsListContainer">
                <h3>Available Chains</h3>
                <ul id="chainsList" class="hyper-chains-list"></ul>
            </div>
        </div>
    `;

    document.body.appendChild(pageContainer);

    populateSendChainsDropdown();

    populateChainsList();

    // Event-Listener für Additional Fees Input
    const additionalFeesInput = document.getElementById("additionalFees");
    if (!additionalFeesInput) {
        console.error("[createHyperlanePage] Additional Fees Input not found");
        return;
    }

    additionalFeesInput.addEventListener("input", (e) => {
        const cleanedValue = e.target.value.replace(/[^0-9,.]/g, "").replace(",", ".");
        e.target.value = cleanedValue;
    });

    const dropdown = document.getElementById("chainDropdownhype");
    console.log("[createHyperlanePage] Suche Dropdown:", dropdown);
    if (!dropdown) {
        console.error("[createHyperlanePage] Dropdown 'chainDropdownhype' not found");
        return;
    }

    dropdown.addEventListener("change", async (e) => {

        const selectedChain = e.target.value;

        if (!selectedChain) {
            console.warn("[chainDropdownhype] No chain selected");
            await populateChainsList();
            return;
        }

        const chainConfig = window.CONFIG.hyperlane[selectedChain];
        if (!chainConfig) {
            console.warn(`[chainDropdownhype] no config found for ${selectedChain} `);
            await populateChainsList();
            return;
        }

        try {
            await populateChainsList(selectedChain);

            await switchToChainHyper(selectedChain);
        } catch (err) {
            console.error(`[chainDropdownhype] Error on ${selectedChain}:`, err);
        }
    });
}




async function sendHyperlaneMessage() {
    const selectedChains = getSelectedChains();
    const message = document.getElementById("messageInput").value;
    const config = window.CONFIG?.hyperlane || {};

    if (!message || selectedChains.length === 0) {
        console.log("Error: No chains selected or message is empty!");
        return;
    }


    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    for (const chain of selectedChains) {
        const destConfig = config[chain] || {};
        const sourceChain = getSelectedSendChain();
        const sourceConfig = config[sourceChain] || {};

        if (!destConfig.domain || !destConfig.receive) {
            console.warn(`Missing domain or receive for destination chain: ${chain}`);
            continue;
        }
        if (!sourceConfig.send || !sourceConfig.mail) {
            console.warn(`Missing send or mail for source chain: ${sourceChain}`);
            continue;
        }

        try {
            const fee = await fetchNativeFee(chain);
            if (!fee) {
                console.warn(`No fee retrieved for ${chain}`);
                continue;
            }

            const feeWithMarkup = fee.mul(111).div(100); // 11% Aufschlag
            let additionalFeesWei = ethers.BigNumber.from("0");
            const additionalFeesInput = document.getElementById("additionalFees")?.value || "0";
            try {
                const cleanedAdditional = additionalFeesInput.replace(",", ".");
                if (!isNaN(cleanedAdditional) && cleanedAdditional !== "") {
                    additionalFeesWei = ethers.utils.parseEther(cleanedAdditional);
                }
            } catch (err) {
                console.warn(`[sendHyperlaneMessage] Error additional Fees: ${additionalFeesInput}`, err);
            }

            const totalFeeWei = feeWithMarkup.add(additionalFeesWei);
            const totalFee = Number(ethers.utils.formatEther(totalFeeWei)).toFixed(6);

            const contract = new ethers.Contract(sourceConfig.send, [
                "function sendMessage(address _mailbox, uint32 _destinationChainId, address _receiver, string _message) payable returns ()"
            ], signer);

            const tx = await contract.sendMessage(
                sourceConfig.mail,
                destConfig.domain,
                destConfig.receive,
                message,
                { value: totalFeeWei }
            );

            await tx.wait();

            const explorerLink = `https://explorer.hyperlane.xyz/?search=${tx.hash}`;
            const label = document.querySelector(`#chain-${chain} + label`);
            if (label) {
                label.dataset.explorerLink = explorerLink;
                label.textContent = `${capitalize(chain)} – Fee: ${totalFee} ${sourceConfig.native || 'Unknown'} `;
                const linkElement = document.createElement("a");
                linkElement.href = explorerLink;
                linkElement.textContent = `(Explorer)`;
                linkElement.style.marginLeft = "5px";
                linkElement.style.color = "#4da8ff";
                linkElement.target = "_blank";
                label.appendChild(linkElement);
            } else {
                console.warn(`Label for chain ${chain} not found`);
            }
        } catch (err) {
            console.error(`Error sending to ${chain}:`, err);
            continue;
        }
    }
}


function getSelectedChains() {
    const checkboxes = document.querySelectorAll("#chainsList input[type=checkbox]:checked");
    const selectedChains = Array.from(checkboxes).map(checkbox => checkbox.value);
    return selectedChains;
}


function clearHyperlaneMessage() {
    document.getElementById("messageInput").value = '';
    alert("Message cleared!");
}

function showHyperlaneMessagePage() {
    if (!document.getElementById("HyperlaneMessagePage")) {
        createHyperlanePage();
    } else {
    }

    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    const hyperlanePage = document.getElementById("HyperlaneMessagePage");
    hyperlanePage.style.display = 'block';
}



async function populateChainsList(sourceChain = "") {
    const chainsListContainer = document.getElementById("chainsList");

    if (!chainsListContainer) {
        console.error("[populateChainsList] chainsList-Container not found");
        return;
    }

    chainsListContainer.innerHTML = "";

    const sourceConfig = window.CONFIG.hyperlane[sourceChain] || {};
    const nativeCurrency = sourceConfig.native || "Unknown";

    const receiveChains = Object.keys(window.CONFIG?.hyperlane || {})
        .filter(chain =>
            chain !== sourceChain &&
            window.CONFIG?.hyperlane[chain]?.receive &&
            window.CONFIG.hyperlane[chain].receive !== ""
        );

    for (const chain of receiveChains) {

        const listItem = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = chain;
        checkbox.id = `chain-${chain}`;

        const label = document.createElement("label");
        label.htmlFor = checkbox.id;
        label.textContent = `${capitalize(chain)} – Fee: n/a`;

        listItem.appendChild(checkbox);
        listItem.appendChild(label);
        chainsListContainer.appendChild(listItem);

        checkbox.addEventListener("change", async (e) => {

            if (e.target.checked) {
                try {
                    const fee = await fetchNativeFee(chain);
                    let additionalFeesWei = ethers.BigNumber.from("0");

                    const updateFeeDisplay = async () => {
                        const additionalFeesInput = document.getElementById("additionalFees")?.value || "0";
                        try {
                            const cleanedAdditional = additionalFeesInput.replace(",", ".");
                            if (!isNaN(cleanedAdditional) && cleanedAdditional !== "") {
                                additionalFeesWei = ethers.utils.parseEther(cleanedAdditional);
                                console.log(`[populateChainsList] Additional Fees in wei: ${additionalFeesWei.toString()}`);
                            } else {
                                additionalFeesWei = ethers.BigNumber.from("0");
                            }
                        } catch (err) {
                            console.warn(`[populateChainsList] no valid Additional Fees: ${additionalFeesInput}`, err);
                            additionalFeesWei = ethers.BigNumber.from("0");
                        }

                        if (fee) {
                            const feeWithMarkup = fee.mul(111).div(100); // 11% Aufschlag
                            const totalFee = feeWithMarkup.add(additionalFeesWei);
                            const feeFormatted = Number(ethers.utils.formatEther(totalFee)).toFixed(6);
                            label.textContent = `${capitalize(chain)} – Fee: ${feeFormatted} ${nativeCurrency}`;
                            label.dataset.explorerLink = "";
                        } else {
                            console.warn(`[populateChainsList] no fee for ${chain} `);
                            label.textContent = `${capitalize(chain)} – Fee: n/a`;
                            label.dataset.explorerLink = "";
                        }
                    };

                    await updateFeeDisplay();

                    const additionalFeesInput = document.getElementById("additionalFees");
                    if (additionalFeesInput) {
                        additionalFeesInput.addEventListener("input", updateFeeDisplay);
                    }
                } catch (err) {
                    console.error(`[populateChainsList] Error for catching fee on ${chain}:`, err);
                    label.textContent = `${capitalize(chain)} – Fee: n/a`;
                    label.dataset.explorerLink = "";
                }
            } else {
                label.textContent = `${capitalize(chain)} – Fee: n/a`;
                label.dataset.explorerLink = "";
            }
        });
    }
}


async function fetchNativeFee(destinationChain) {
    const sourceChain = getSelectedSendChain();

    const contractAddress = window.CONFIG.hyperlane[sourceChain]?.mail;
    const abi = window.ABI?.hyperlanemsg;
    if (!abi || !contractAddress) {
        console.warn("[fetchNativeFee] ABI or Adresse missing", sourceChain);
        return null;
    }

    const destinationConfig = window.CONFIG.hyperlane[destinationChain];
    if (!destinationConfig || !destinationConfig.domain || !destinationConfig.receive) {
        console.warn("[fetchNativeFee] destination config error:", destinationChain);
        return null;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Prüfe Netzwerk
    const network = await provider.getNetwork();
    if (network.chainId !== window.CONFIG.hyperlane[sourceChain].domain) {
        console.warn("[fetchNativeFee] wrong chain! want:", window.CONFIG.hyperlane[sourceChain].domain, "Found:", network.chainId);
    }

    const contract = new ethers.Contract(contractAddress, abi, provider);

    // Prüfe, ob Contract existiert
    const code = await provider.getCode(contractAddress);
    if (code === "0x") {
        console.error("[fetchNativeFee] no contract:", contractAddress);
        return null;
    }

    const message = document.getElementById("messageInput").value || "Hallo Chain";
    const destinationDomain = destinationConfig.domain;
    const receiverAddress = destinationConfig.receive;
    const encodedMessage = ethers.utils.defaultAbiCoder.encode(["string"], [message]);
    const receiverBytes32 = ethers.utils.hexZeroPad(ethers.utils.getAddress(receiverAddress), 32);

    try {
        const fee = await contract.quoteDispatch(destinationDomain, receiverBytes32, encodedMessage, { gasLimit: 200000 });
        return fee;
    } catch (err) {
        console.error("[fetchNativeFee] error on quoteDispatch:", err);
        return null;
    }
}




function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getSelectedSendChain() {
    const possibleIds = ["chainDropdownhype", "sourceChainDropdown", "sendChainSelect"];
    for (const id of possibleIds) {
        const el = document.getElementById(id);
        if (el && el.value) {
            return el.value;
        }
    }
    console.warn("[getSelectedSendChain] No selected chain found in known dropdowns.");
    return null;
}


async function switchToChainHyper(chainName) {
    const chainConfig = window.CONFIG.hyperlane?.[chainName];
    if (!chainConfig || !chainConfig.chainid) {
        console.warn(`[switchToChainHyper] no Chain-Config or chainId for '${chainName}' .`);
        return;
    }

    const chainId = chainConfig.chainid;
    const chainIdHex = "0x" + chainId.toString(16);

    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: chainIdHex }],
        });
    } catch (switchError) {
        console.error(`[switchToChainHyper] error switching '${chainName}'`, switchError);
    }
}


function populateSendChainsDropdown() {
    const dropdown = document.getElementById("chainDropdownhype");

    if (!dropdown) {
        console.error("[populateSendChainsDropdown] Dropdown 'chainDropdownhype' not found");
        return;
    }

    dropdown.innerHTML = '<option value="">Select a chain</option>';
    const sendChains = Object.keys(window.CONFIG?.hyperlane || {})
        .filter(chain => window.CONFIG?.hyperlane[chain]?.send && window.CONFIG.hyperlane[chain].send !== "");


    sendChains.forEach(chain => {
        const option = document.createElement("option");
        option.value = chain;
        option.textContent = chain.charAt(0).toUpperCase() + chain.slice(1);
        dropdown.appendChild(option);
    });


}
