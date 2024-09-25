const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const router = express.Router()
const { getNFTswithImage, getNFTOne } = require('../../metaplex');
const { REWARD_TOKEN, getWalletTokenBalance } = require("../../simple");
const { connection } = require("../../web3")
const validator = require('./nft.validator')

const conn = connection;

router.get('/nft/images/:wallet', getImages);
router.get('/nft/mint/:mint', getOneNFT);

async function getImages(req, res, next){
    try {
        await validator.getImages(req)
        const { wallet } = req.params;
        console.log("wallet address = ", wallet)
        const images = await getNFTswithImage(conn, wallet)
        res.json({code: '00', data: images, message: null})
    } catch(err) {
        res.json(err);
    }
}

async function getOneNFT(req, res, next) {
    try {
        await validator.getOneNFT(req);
        const { wallet } = req.params;
        const nft = await getNFTOne(conn, wallet)
        res.json({code: '00', data: nft, message: null})
    }catch(err) {
        res.json(err);
    }
}


module.exports = router;