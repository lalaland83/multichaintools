window.CONFIG = {
    GRAPH: {
        GRAPH_API_KEY: "",
        NETWORKS: {
            BASE: "",
            OPTIMISM: "",
            ARBITRUM: "",
            BSC: "",
            AVALANCHE: "",
            CELO: "",
            BLAST: "",
            POLYGON: "",
            ETHEREUM: ""
        }

    },
    UNISWAP: {
        BASE: {
            NONFUNGIBLE_POSITION_MANAGER: "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1",
            FACTORY: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD"
        },
        OPTIMISM: {
            NONFUNGIBLE_POSITION_MANAGER: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
            FACTORY: "0x1F98431c8aD98523631AE4a59f267346ea31F984"
        },
        ARBITRUM: {
            NONFUNGIBLE_POSITION_MANAGER: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
            FACTORY: "0x1F98431c8aD98523631AE4a59f267346ea31F984"
        },
        BSC: {
            NONFUNGIBLE_POSITION_MANAGER: "0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613",
            FACTORY: "0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7"
        },
        AVALANCHE: {
            NONFUNGIBLE_POSITION_MANAGER: "0x655C406EBFa14EE2006250925e54ec43AD184f8B",
            FACTORY: "0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD"
        },
        CELO: {
            NONFUNGIBLE_POSITION_MANAGER: "0x3d79EdAaBC0EaB6F08ED885C05Fc0B014290D95A",
            FACTORY: "0xAfE208a311B21f13EF87E33A90049fC17A7acDEc"
        },
        BLAST: {
            NONFUNGIBLE_POSITION_MANAGER: "0xB218e4f7cF0533d4696fDfC419A0023D33345F28",
            FACTORY: "0x792edAdE80af5fC680d96a2eD80A44247D2Cf6Fd"
        },
        POLYGON: {
            NONFUNGIBLE_POSITION_MANAGER: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
            FACTORY: "0x1F98431c8aD98523631AE4a59f267346ea31F984"
        },
        ETHEREUM: {
            NONFUNGIBLE_POSITION_MANAGER: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
            FACTORY: "0x1F98431c8aD98523631AE4a59f267346ea31F984"
        },
    },
    COINGECKO: {
        coingecko_apiKey: "", // Setze deinen API-Key hier ein
        cacheDuration: 60 * 60 * 1000, // 1 Stunde in Millisekunden
        cachePricegecko: "tokenPriceCache" // Cache-Key für localStorage
    },
    RPC: {
        BASE: "https://mainnet.base.org",
        OPTIMISM: "https://mainnet.optimism.io",
        ARBITRUM: "https://arb1.arbitrum.io/rpc",
        BSC: "https://bsc-dataseed.binance.org",
        AVALANCHE: "https://api.avax.network/ext/bc/C/rpc",
        CELO: "https://forno.celo.org",
        BLAST: "https://rpc.blast.io",
        POLYGON: "https://polygon-rpc.com",
        ETHEREUM: "https://eth.llamarpc.com"
    },
    chains: {
        ethereum: {
            chainId: 1,
            name: "Ethereum",
            apiBase: "https://api.etherscan.io/api",
            explorer: "https://etherscan.io",
            apiKey: "",
            blockscout: false
        },
        base: {
            chainId: 8453,
            name: "Base",
            apiBase: "https://api.basescan.org/api",
            explorer: "https://basescan.org",
            apiKey: "",
            blockscout: false
        },
        arbitrum: {
            chainId: 42161,
            name: "Arbitrum",
            apiBase: "https://api.arbiscan.io/api",
            explorer: "https://arbiscan.io",
            apiKey: "",
            blockscout: false
        },
        optimism: {
            chainId: 10,
            name: "Optimism",
            apiBase: "https://api-optimistic.etherscan.io/api",
            explorer: "https://optimistic.etherscan.io",
            apiKey: "",
            blockscout: false
        },
        scroll: {
            chainId: 534352,
            name: "Scroll",
            apiBase: "https://api.scrollscan.com/api",
            explorer: "https://scrollscan.com",
            apiKey: "",
            blockscout: false
        },
        linea: {
            chainId: 59144,
            name: "Linea",
            apiBase: "https://api.lineascan.build/api",
            explorer: "https://lineascan.build",
            apiKey: "",
            blockscout: false
        },
        ink: {
            chainId: 57073,
            name: "INK",
            apiBase: "https://explorer.inkonchain.com/api",
            explorer: "https://explorer.inkonchain.com",
            apiKey: "",
            blockscout: true
        },
        soneium: {
            chainId: 1868,
            name: "Soneium",
            apiBase: "https://soneium.blockscout.com/api",
            explorer: "https://soneium.blockscout.com",
            apiKey: "",
            blockscout: true
        },
        fuse: {
            chainId: 122,
            name: "Fuse",
            apiBase: "https://explorer.fuse.io/api",
            explorer: "https://explorer.fuse.io",
            apiKey: "",
            blockscout: true
        },
        unichain: {
            chainId: 130,
            name: "UniChain",
            apiBase: "https://api.uniscan.xyz/api",
            explorer: "https://uniscan.xyz",
            apiKey: "",
            blockscout: false
        },
        mantle: {
            chainId: 5000,
            name: "Mantle",
            apiBase: "https://api.mantlescan.xyz/api",
            explorer: "https://mantlescan.xyz",
            apiKey: "",
            blockscout: false
        },
        zora: {
            chainId: 7777777,
            name: "Zora",
            apiBase: "https://explorer.zora.energy/api",
            explorer: "https://explorer.zora.energy",
            apiKey: "",
            blockscout: true
        },
        worldchain: {
            chainId: 480,
            name: "Worldchain",
            apiBase: "https://api.worldscan.org/api",
            explorer: "https://worldscan.org",
            apiKey: "",
            blockscout: false
        },
        berachain: {
            chainId: 80094,
            name: "Berachain",
            apiBase: "https://api.berascan.com/api",
            explorer: "https://berascan.com",
            apiKey: "",
            blockscout: false
        },
        taiko: {
            chainId: 167000,
            name: "Taiko",
            apiBase: "https://api.taikoscan.io/api",
            explorer: "https://taikoscan.io",
            apiKey: "",
            blockscout: false
        },
        polygon: {
            chainId: 137,
            name: "Polygon",
            apiBase: "https://api.polygonscan.com/api",
            explorer: "https://polygonscan.com",
            apiKey: "",
            blockscout: false
        },
        bsc: {
            chainId: 56,
            name: "BSC",
            apiBase: "https://api.bscscan.com/api",
            explorer: "https://www.bscscan.com",
            apiKey: "",
            blockscout: false
        },
        zetachain: {
            chainId: 7000,
            name: "Zetachain",
            apiBase: "https://zetachain.blockscout.com/api",
            explorer: "https://zetachain.blockscout.com",
            apiKey: "",
            blockscout: true
        },
    },
    layerZero: {
        sendChains: {
            arbitrum: "0",
            base: "0",
            berachain: "0x80e78957367e40c22fa61b7e5d7c31c10b8e4457",
            bsc: "0",
            ethereum: "0",
            fuse: "0",
            ink: "0",
            linea: "0",
            mantle: "0",
            optimism: "0",
            polygon: "0",
            scroll: "0",
            soneium: "0",
            taiko: "0",
            unichain: "0",
            worldchain: "0",
            zetachain: "0",
            zora: "0"
        },
        receiveChains: { //EIP Number
            abstract: 30324,
            aptos: 30108,
            arbitrum: 30110,
            celo: 30125,
            flare: 30295,
            fraxtal: 30255,
            fuse: 30138
            // weitere Ziel-Chains ...
        }
    },
    hyperlane: {
        arbitrum: {
            domain: 42161,
            chainid: 42161,
            mail: "0x979Ca5202784112f4738403dBec5D0F3B9daabB9",
            send: "0x203823eb6422e991abb8ec6c862a649e9fd2d5ca",
            receive: "0x33456b6ae0579a7d72764f4318e53d4602654775",
            native: "ETH"
        },
        base: {
            domain: 8453,
            chainid: 8453,
            mail: "0xeA87ae93Fa0019a82A727bfd3eBd1cFCa8f64f1D",
            send: "0xc326da22e0d4ca8c16e23307c082a85fa16224a3",
            receive: "0x89ba3667b8ff11b856c23a4511cb567492c4da36",
            native: "ETH"
        },
        berachain: {
            domain: 80094,
            chainid: 80094,
            mail: "0x7f50C5776722630a0024fAE05fDe8b47571D7B39",
            send: "0xcbf65f7f96f0362baf235f9bd34f675fe6ef2201",
            receive: "0x72fcc8f83d6467cab84cc362904257c7ced289db",
            native: "Bera"
        },
        fuse: {
            domain: 122,
            chainid: 122,
            mail: "0x3071D4DA6020C956Fe15Bfd0a9Ca8D4574f16696",
            send: "", //0x37585fCab1872F4c87DaBe004F3aF5faeF3653f3
            receive: "0x4AD5eD03aB593f86CeBF3DEC7e7c81e1eC0C1e31",
            native: "Fuse"
        },
        hemi: {
            domain: 43111,
            chainid: 43111,
            mail: "0x3a464f746D23Ab22155710f44dB16dcA53e0775E",
            send: "", //0xd74f12aCbE0deb4bDB69aC7d072e55985A64cdd5
            receive: "0x75Ca19256cCd5252d2749E6Fd18ece0B20F8c82B",
            native: "ETH"
        },
        ink: {
            domain: 57073,
            chainid: 57073,
            mail: "0x7f50C5776722630a0024fAE05fDe8b47571D7B39",
            send: "0xAB4A5E1099639a5651f8899b1c271287E4b478cD",
            receive: "0xB11a2B7Dc3F570af7d945f62bbc255DA9C8C51b1",
            native: "ETH"
        },
        mantle: {
            domain: 5000,
            chainid: 5000,
            mail: "0x398633D19f4371e1DB5a8EFE90468eB70B1176AA",
            send: "", //0x4259310065fb944bc9eb5fb40e1811ce20b658fb
            receive: "0x5c002b9e45750dd5c24048bb0b8911307f4b9049",
            native: "MNT"
        },
        mint: {
            domain: 185,
            chainid: 185,
            mail: "0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7",
            send: "", //0xE211b7Bf44a68bE316c17a9acd7fC5F48AE4C5E1
            receive: "0x48dE809322fF8Cdcc9583c5AcE1315dBb9Db4D13",
            native: "ETH"
        },
        optimism: {
            domain: 10,
            chainid: 10,
            mail: "0xd4C1905BB1D26BC93DAC913e13CaCC278CdCC80D",
            send: "0x37afd545f4c58caa548acd9d3deb01fb54c46ec9",
            receive: "0x125a4a2f51d2eaed841edbab98bfd3d1c146e5e7",
            native: "ETH"
        },
        scroll: {
            domain: 534352,
            chainid: 534352,
            mail: "0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7",
            send: "0x63092ebd304983c1d64c247556886c76180ebcd7",
            receive: "0x377ffde7b2485a571d846d60781988ce15f7e59d",
            native: "ETH"
        },
        soneium: {
            domain: 1868,
            chainid: 1868,
            mail: "0x3a464f746D23Ab22155710f44dB16dcA53e0775E",
            send: "0xdFc28b710312f657aEe6fC6b94052cfbF18C4a20",
            receive: "0x348F9F233ef3e95Bfd07b8AB447AFC28bea5012F",
            native: "ETH"
        },
        sonic: {
            domain: 146,
            chainid: 146,
            mail: "0x3a464f746D23Ab22155710f44dB16dcA53e0775E",
            send: "", //0x8d0cc53aaa66a204457a3714c8eec8e344436db3
            receive: "0x75bbaee0cc80cf92668d3adec82cdedc888335d3",
            native: "S"
        },
        unichain: {
            domain: 130,
            chainid: 130,
            mail: "0x3a464f746D23Ab22155710f44dB16dcA53e0775E",
            send: "0x773cf00e8bd60bc0d2193ad2c4b6a94465819bf3",
            receive: "0x0b97d65bff8abdfd4f2981d5b4cca95d83ed9df5",
            native: "ETH"
        }
    },

};

// window.CONFIG.chains.(chain).apiKey
// window.CONFIG.GRAPH.NETWORKS.(chain)
// window.CONFIG.GRAPH.GRAPH_API_KEY

window.ABI = {
    UNISWAP: {
        POSITION_MANAGER: [
            //read
            "function balanceOf(address owner) view returns (uint256)",
            "function baseURI() pure returns (string)",
            "function DOMAIN_SEPARATOR() view returns (bytes32)",
            "function factory() view returns (address)",
            "function getApproved(uint256 tokenId) view returns (address)",
            "function isApprovedForAll(address owner, address operator) view returns (bool)",
            "function name() view returns (string)",
            "function ownerOf(uint256 tokenId) view returns (address)",
            "function PERMIT_TYPEHASH() view returns (bytes32)",
            "function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)",
            "function supportsInterface(bytes4 interfaceId) view returns (bool)",
            "function symbol() view returns (string)",
            "function tokenByIndex(uint256 index) view returns (uint256)",
            "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
            "function tokenURI(uint256 tokenId) view returns (string)",
            "function totalSupply() view returns (uint256)",
            "function WETH9() view returns (address)",
            //write
            "function approve(address to, uint256 tokenId) nonpayable returns ()",
            "function burn(uint256 tokenId) payable returns ()",
            "function collect((uint256 tokenId, address recipient, uint128 amount0Max, uint128 amount1Max) params) payable returns (uint256 amount0, uint256 amount1)",
            "function createAndInitializePoolIfNecessary(address token0, address token1, uint24 fee, uint160 sqrtPriceX96) payable returns (address pool)",
            "function decreaseLiquidity((uint256 tokenId, uint128 liquidity, uint256 amount0Min, uint256 amount1Min, uint256 deadline) params) payable returns (uint256 amount0, uint256 amount1)",
            "function increaseLiquidity((uint256 tokenId, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, uint256 deadline) params) payable returns (uint128 liquidity, uint256 amount0, uint256 amount1)",
            "function mint((address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline) params) payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
            "function multicall(bytes[] data) payable returns (bytes[] results)",
            "function permit(address spender, uint256 tokenId, uint256 deadline, uint8 v, bytes32 r, bytes32 s) payable returns ()",
            "function refundETH() payable returns ()",
            "function safeTransferFrom(address from, address to, uint256 tokenId) nonpayable returns ()",
            "function safeTransferFrom(address from, address to, uint256 tokenId, bytes _data) nonpayable returns ()",
            "function selfPermit(address token, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) payable returns ()",
            "function selfPermitAllowed(address token, uint256 nonce, uint256 expiry, uint8 v, bytes32 r, bytes32 s) payable returns ()",
            "function selfPermitAllowedIfNecessary(address token, uint256 nonce, uint256 expiry, uint8 v, bytes32 r, bytes32 s) payable returns ()",
            "function selfPermitIfNecessary(address token, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) payable returns ()",
            "function setApprovalForAll(address operator, bool approved) nonpayable returns ()",
            "function sweepToken(address token, uint256 amountMinimum, address recipient) payable returns ()",
            "function transferFrom(address from, address to, uint256 tokenId) nonpayable returns ()",
            "function uniswapV3MintCallback(uint256 amount0Owed, uint256 amount1Owed, bytes data) nonpayable returns ()",
            "function unwrapWETH9(uint256 amountMinimum, address recipient) payable returns ()"
        ],
        FACTORY: [
            //read
            "function feeAmountTickSpacing(uint24) view returns (int24)",
            "function getPool(address, address, uint24) view returns (address)",
            "function owner() view returns (address)",
            "function parameters() view returns (address factory, address token0, address token1, uint24 fee, int24 tickSpacing)",
            //write
            "function createPool(address tokenA, address tokenB, uint24 fee) nonpayable returns (address pool)",
            "function enableFeeAmount(uint24 fee, int24 tickSpacing) nonpayable returns ()",
            "function setOwner(address _owner) nonpayable returns ()"
        ],
        POOL: [
            //read
            "function factory() view returns (address)",
            "function fee() view returns (uint24)",
            "function feeGrowthGlobal0X128() view returns (uint256)",
            "function feeGrowthGlobal1X128() view returns (uint256)",
            "function liquidity() view returns (uint128)",
            "function maxLiquidityPerTick() view returns (uint128)",
            "function observations(uint256) view returns (uint32 blockTimestamp, int56 tickCumulative, uint160 secondsPerLiquidityCumulativeX128, bool initialized)",
            "function observe(uint32[] secondsAgos) view returns (int56[] tickCumulatives, uint160[] secondsPerLiquidityCumulativeX128s)",
            "function positions(bytes32) view returns (uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)",
            "function protocolFees() view returns (uint128 token0, uint128 token1)",
            "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
            "function snapshotCumulativesInside(int24 tickLower, int24 tickUpper) view returns (int56 tickCumulativeInside, uint160 secondsPerLiquidityInsideX128, uint32 secondsInside)",
            "function tickBitmap(int16) view returns (uint256)",
            "function tickSpacing() view returns (int24)",
            "function ticks(int24) view returns (uint128 liquidityGross, int128 liquidityNet, uint256 feeGrowthOutside0X128, uint256 feeGrowthOutside1X128, int56 tickCumulativeOutside, uint160 secondsPerLiquidityOutsideX128, uint32 secondsOutside, bool initialized)",
            "function token0() view returns (address)",
            "function token1() view returns (address)",
            //write
            "function burn(int24 tickLower, int24 tickUpper, uint128 amount) nonpayable returns (uint256 amount0, uint256 amount1)",
            "function collect(address recipient, int24 tickLower, int24 tickUpper, uint128 amount0Requested, uint128 amount1Requested) nonpayable returns (uint128 amount0, uint128 amount1)",
            "function collectProtocol(address recipient, uint128 amount0Requested, uint128 amount1Requested) nonpayable returns (uint128 amount0, uint128 amount1)",
            "function flash(address recipient, uint256 amount0, uint256 amount1, bytes data) nonpayable returns ()",
            "function increaseObservationCardinalityNext(uint16 observationCardinalityNext) nonpayable returns ()",
            "function initialize(uint160 sqrtPriceX96) nonpayable returns ()",
            "function mint(address recipient, int24 tickLower, int24 tickUpper, uint128 amount, bytes data) nonpayable returns (uint256 amount0, uint256 amount1)",
            "function setFeeProtocol(uint8 feeProtocol0, uint8 feeProtocol1) nonpayable returns ()",
            "function swap(address recipient, bool zeroForOne, int256 amountSpecified, uint160 sqrtPriceLimitX96, bytes data) nonpayable returns (int256 amount0, int256 amount1)"
        ]
    },
    l0message: [
        "function quote(uint32 _dstEid, string _message, bytes _options, bool _payInLzToken) view returns ((uint256 nativeFee, uint256 lzTokenFee) fee, uint256 total)",
        "function send(uint32 _dstEid, string _message, bytes _options) payable returns ((bytes32 guid, uint64 nonce, (uint256 nativeFee, uint256 lzTokenFee) fee) receipt)"
    ],
    hyperlanemsg: [
        "function quoteDispatch(uint32 destinationDomain, bytes32 recipientAddress, bytes messageBody) view returns (uint256 fee)",
        "function sendMessage(address _mailbox, uint32 _destinationChainId, address _receiver, string _message) payable returns ()"
    ],
};



// window.ABI.UNISWAP.FACTORY

let provider;
let signer;
let accounts;

let selectedNetwork;
let storedPositions;
let cachedData;

let connectedWalletAddress = localStorage.getItem("connectedWalletAddress") || null;




function getApiBase(chain) {
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
    return apiBases[chain] || null;
}



