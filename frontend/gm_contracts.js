const contracts = {
    10: {
        name: "Optimism",
        address: "0x19Be3FFD79E201476e4C1A049A34B0F154Fa08C8",
        responseAddress: "0x2bc71fc0cc0ea3897bcd626fc06593ef3b54947f",
        chainIdHex: "0xa",
        explorer: "https://optimistic.etherscan.io/tx/",
        deployEnabled: true
    },
    122: {
        name: "Fuse",
        address: "0xF268F002694a3A3e13e9765eE0096e5b3C82226b",
        responseAddress: "0xAdcfF12AcaEf0a43EA8Cd69817627552305226DE",
        chainIdHex: "0x7a",
        explorer: "https://explorer.fuse.io/tx/",
        deployEnabled: true
    },
    130: {
        name: "Unichain",
        address: "0xfe45133979612f4a156ea48309b3a9851a4aa76f",
        responseAddress: "0xf1e26724414167a5fb76f9191c8e285be8f281ce",
        chainIdHex: "0x82",
        explorer: "https://uniscan.xyz/tx/",
        deployEnabled: true
    },
    185: {
        name: "Mint",
        address: "0xFEeF9A11b1765C22AD2cc3Ad8bF46c50700c78a0",
        responseAddress: "0x204Bd0230591152D330370BCE0a3E03794ADDFF5",
        receiveAddress: "",
        chainIdHex: "0xb9",
        explorer: "https://mintscan.org/tx/",
        deployEnabled: true
    },
    324: {
        name: "ZkSync",
        address: "0x4fdd29e36b91fed68355c401946ccc5ff70b2bb0",
        responseAddress: "",
        chainIdHex: "0x144",
        explorer: "https://era.zksync.network/tx/",
        deployEnabled: false
    },
    480: {
        name: "World Chain",
        address: "0x5fb424a41a701f69250eafbfd02c9b6088a42ded",
        responseAddress: "0xec690bbcbdd0056f8228b886e1a0de1216210b92",
        chainIdHex: "0x1e0",
        explorer: "https://worldscan.org/tx/",
        deployEnabled: true
    },
    999: {
        name: "Hyper/Hyperliquid EVM",
        address: "0xFEeF9A11b1765C22AD2cc3Ad8bF46c50700c78a0",
        responseAddress: "0x75BBAEE0cC80CF92668D3ADec82CDEdc888335D3",
        chainIdHex: "0x3e7",
        explorer: "https://purrsec.com/tx/",
        deployEnabled: true
    },
    1135: {
        name: "Lisk",
        address: "0xeb50F03fe1eB48B7D09E1Bc3F54559B225eF2839",
        responseAddress: "0x1b89C49D70A0a219596a96103A4f5Ac0e1a35529",
        chainIdHex: "0x46f",
        explorer: "https://blockscout.lisk.com/tx/",
        deployEnabled: true
    },
    1750: {
        name: "Metal L2",
        address: "0xFEeF9A11b1765C22AD2cc3Ad8bF46c50700c78a0",
        responseAddress: "0xB30B1050383bed15b68181057Ab29d1357acB974",
        chainIdHex: "0x6d6",
        explorer: "https://explorer.metall2.com/tx/",
        deployEnabled: true
    },
    1868: {
        name: "Soneium",
        address: "0x0A2f7D1399491CeC3073c970BB209819214bE7D5",
        responseAddress: "0xd83Eec688A84870F8A40e3c96682Aa3B2864EE80",
        chainIdHex: "0x74c",
        explorer: "https://soneium.blockscout.com/tx/",
        deployEnabled: true
    },
    1923: {
        name: "Swell Network",
        address: "0xFEeF9A11b1765C22AD2cc3Ad8bF46c50700c78a0",
        responseAddress: "0xB30B1050383bed15b68181057Ab29d1357acB974",
        chainIdHex: "0x783",
        explorer: "https://explorer.swellnetwork.io/tx/",
        deployEnabled: true
    },
    5000: {
        name: "Mantle",
        address: "0x7ab46cf77895a195cbf5a5fdb7701605e808fb70",
        responseAddress: "0xdad288ebefb8e0c52f07bc2bbf1052ec3a8ed7d9",
        chainIdHex: "0x1388",
        explorer: "https://mantlescan.xyz/tx/",
        deployEnabled: true
    },
    7897: {
        name: "Arena-Z",
        address: "0xFEeF9A11b1765C22AD2cc3Ad8bF46c50700c78a0",
        responseAddress: "0xB30B1050383bed15b68181057Ab29d1357acB974",
        chainIdHex: "0x1ed9",
        explorer: "https://explorer.arena-z.gg/tx/",
        deployEnabled: true
    },
    8453: {
        name: "Base",
        address: "0x798b74361332c6dd2bd4dce9f9a7a4631634356d",
        responseAddress: "0x1752f12ebee5692d916ad3b35ca1861e6fa9a3cb",
        chainIdHex: "0x2105",
        explorer: "https://basescan.org/tx/",
        deployEnabled: true
    },
    10143: {
        name: "Monad (Testnet)",
        address: "0xc5a9e81e6B8D13467216a4318afC178DC6D2F3C1",
        responseAddress: "0x355adD6a56C3516dB56799Cfe2CC5605873BC12D",
        chainIdHex: "0x279f",
        explorer: "https://testnet.monadexplorer.com/tx/",
        deployEnabled: true
    },
    34443: {
        name: "Mode",
        address: "0xC656bbc9473C1381547f27A4874cCAd868DBd272",
        responseAddress: "0xd8CcdCd2D0AC84B568930D878FA897d303401CE4",
        chainIdHex: "0x868b",
        explorer: "https://explorer.mode.network/tx/",
        deployEnabled: true
    },
    55244: {
        name: "Superposition",
        address: "0x7C1adCa99703AA63C30C0f2cE23442d7e643FFA3",
        responseAddress: "0xB103e16BBe8faBc7C2Bd49A94a3222717b54816c",
        chainIdHex: "0xd7cc",
        explorer: "https://explorer.superposition.so/tx/",
        deployEnabled: true
    },
    57073: {
        name: "INK",
        address: "0x48dE809322fF8Cdcc9583c5AcE1315dBb9Db4D13",
        responseAddress: "0x0b30E9E582654353dB73a3A7B955b25D13ccd31a",
        chainIdHex: "0xdef1",
        explorer: "https://explorer.inkonchain.com/tx/",
        deployEnabled: true
    },
    59144: {
        name: "Linea",
        address: "0xcaafb0f34381506126a4b0edd82378f290b19349",
        responseAddress: "",
        chainIdHex: "0xe708",
        explorer: "https://lineascan.build/tx/",
        deployEnabled: false
    },
    60808: {
        name: "BOB",
        address: "0xF541Dc7404d8F064BBfa3c048d3166dCB6A1D054",
        responseAddress: "0xeC690bBCbDD0056f8228B886e1A0dE1216210B92",
        chainIdHex: "0xed88",
        explorer: "https://explorer.gobob.xyz/tx/",
        deployEnabled: true
    },
    80094: {
        name: "BERA",
        address: "0xb103e16bbe8fabc7c2bd49a94a3222717b54816c",
        responseAddress: "0x7edd031fa79fa1df0d99f1b937561f72082064bc",
        chainIdHex: "0x138de",
        explorer: "https://berascan.com/tx/",
        deployEnabled: true
    },
    42161: {
        name: "Arbitrum",
        address: "0x3D369aF85D6338b5038e76490FAD0122F8125Bc1",
        responseAddress: "",
        chainIdHex: "0xa4b1",
        explorer: "https://arbiscan.io/tx/",
        deployEnabled: true
    },
    534352: {
        name: "Scroll",
        address: "0x49a627e70916739dbc84c031ecb7a8d1aa43dc0a",
        responseAddress: "",
        chainIdHex: "0x82750",
        explorer: "https://scrollscan.com/tx/",
        deployEnabled: true
    },
    7777777: {
        name: "Zora",
        address: "0xDE28fa95D58eACD6A956A5d8667b4901B1827F38",
        responseAddress: "0xa02C55a3B6Db441D418626B1db310e12A724db9B",
        chainIdHex: "0x76adf1",
        explorer: "https://explorer.zora.energy/tx/",
        deployEnabled: true
    },
    43111: { 
        name: "Hemi", 
        address: "0xFEeF9A11b1765C22AD2cc3Ad8bF46c50700c78a0", 
        responseAddress: "0x75BBAEE0cC80CF92668D3ADec82CDEdc888335D3", 
        chainIdHex: "0xa867", explorer: "https://explorer.hemi.xyz/tx/", 
        deployEnabled: true 
    },
    254: {
        name: "Swan Chain Mainnet", 
        address: "0x75BBAEE0cC80CF92668D3ADec82CDEdc888335D3", 
        responseAddress: "0x8d0cc53aAA66A204457A3714C8EEc8E344436Db3", 
        chainIdHex: "0xfe", explorer: "https://swanscan.io/tx/", 
        deployEnabled: true 
    }
};

const abi = ["function sayGM()"];