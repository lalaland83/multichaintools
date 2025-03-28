window.CONFIG = {
    GRAPH: { 
        GRAPH_API_KEY: tempuse.GRAPH_API_KEY,
        NETWORKS: { 
            BASE: tempuse.GRAPH_NETWORKS_BASE,
            OPTIMISM: tempuse.GRAPH_NETWORKS_OPTIMISM,
            ARBITRUM: tempuse.GRAPH_NETWORKS_ARBITRUM,
            BSC: tempuse.GRAPH_NETWORKS_BSC,
            AVALANCHE: tempuse.GRAPH_NETWORKS_AVALANCHE,
            CELO: tempuse.GRAPH_NETWORKS_CELO,
            BLAST: tempuse.GRAPH_NETWORKS_BLAST,
            POLYGON: tempuse.GRAPH_NETWORKS_POLYGON,
            ETHEREUM: tempuse.GRAPH_NETWORKS_ETHEREUM
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
        coingecko_apiKey: tempuse.COINGECKO_APIKEY, 
        cacheDuration: 60 * 60 * 1000, 
        cachePricegecko: "tokenPriceCache" 
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
            apiKey: tempuse.explorer_ethereum_apiKey,
            blockscout: false
        },
        base: {
            chainId: 8453,
            name: "Base",
            apiBase: "https://api.basescan.org/api",
            explorer: "https://basescan.org",
            apiKey: tempuse.explorer_base_apiKey,
            blockscout: false
        },
        arbitrum: {
            chainId: 42161,
            name: "Arbitrum",
            apiBase: "https://api.arbiscan.io/api",
            explorer: "https://arbiscan.io",
            apiKey: tempuse.explorer_arbitrum_apiKey,
            blockscout: false
        },
        optimism: {
            chainId: 10,
            name: "Optimism",
            apiBase: "https://api-optimistic.etherscan.io/api",
            explorer: "https://optimistic.etherscan.io",
            apiKey: tempuse.explorer_optimism_apiKey,
            blockscout: false
        },
        scroll: {
            chainId: 534352,
            name: "Scroll",
            apiBase: "https://api.scrollscan.com/api",
            explorer: "https://scrollscan.com",
            apiKey: tempuse.explorer_scroll_apiKey,
            blockscout: false
        },
        linea: {
            chainId: 59144,
            name: "Linea",
            apiBase: "https://api.lineascan.build/api",
            explorer: "https://lineascan.build",
            apiKey: tempuse.explorerlinea_apiKey,
            blockscout: false
        },
        ink: {
            chainId: 57073,
            name: "INK",
            apiBase: "https://explorer.inkonchain.com/api",
            explorer: "https://explorer.inkonchain.com",
            apiKey: tempuse.explorer_ink_apiKey,
            blockscout: true
        },
        soneium: {
            chainId: 1868,
            name: "Soneium",
            apiBase: "https://soneium.blockscout.com/api",
            explorer: "https://soneium.blockscout.com",
            apiKey: tempuse.explorer_soneium_apiKey,
            blockscout: true
        },
        fuse: {
            chainId: 122,
            name: "Fuse",
            apiBase: "https://explorer.fuse.io/api",
            explorer: "https://explorer.fuse.io",
            apiKey: tempuse.explorer_fuse_apiKey,
            blockscout: true
        },
        unichain: {
            chainId: 130,
            name: "UniChain",
            apiBase: "https://api.uniscan.xyz/api",
            explorer: "https://uniscan.xyz",
            apiKey: tempuse.explorer_unichain_apiKey,
            blockscout: false
        },
        mantle: {
            chainId: 5000,
            name: "Mantle",
            apiBase: "https://api.mantlescan.xyz/api",
            explorer: "https://mantlescan.xyz",
            apiKey: tempuse.explorer_mantle_apiKey,
            blockscout: false
        },
        zora: {
            chainId: 7777777,
            name: "Zora",
            apiBase: "https://explorer.zora.energy/api",
            explorer: "https://explorer.zora.energy",
            apiKey: tempuse.explorer_zora_apiKey,
            blockscout: true
        },
        worldchain: {
            chainId: 480,
            name: "Worldchain",
            apiBase: "https://api.worldscan.org/api",
            explorer: "https://worldscan.org",
            apiKey: tempuse.explorer_worldchain_apiKey,
            blockscout: false
        },
        berachain: {
            chainId: 80094,
            name: "Berachain",
            apiBase: "https://api.berascan.com/api",
            explorer: "https://berascan.com",
            apiKey: tempuse.explorer_berachain_apiKey,
            blockscout: false
        },
        taiko: {
            chainId: 167000,
            name: "Taiko",
            apiBase: "https://api.taikoscan.io/api",
            explorer: "https://taikoscan.io",
            apiKey: tempuse.explorer_taiko_apiKey,
            blockscout: false
        },
        polygon: {
            chainId: 137,
            name: "Polygon",
            apiBase: "https://api.polygonscan.com/api",
            explorer: "https://polygonscan.com",
            apiKey: tempuse.explorer_polygon_apiKey,
            blockscout: false
        },
        bsc: {
            chainId: 56,
            name: "BNB S. Chain",
            apiBase: "https://api.bscscan.com/api",
            explorer: "https://www.bscscan.com",
            apiKey: tempuse.explorer_bsc_apiKey,
            blockscout: false
        },
    }
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
    }
};

// window.ABI.UNISWAP.FACTORY





let provider;
let signer;
let accounts;

let selectedNetwork;
let storedPositions;
let cachedData;

let connectedWalletAddress = localStorage.getItem("connectedWalletAddress") || null;

