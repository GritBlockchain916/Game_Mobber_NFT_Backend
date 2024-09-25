const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const router = express.Router()
const { getNFTswithImage, getNFTOne, getMeta } = require('../../metaplex');
const { REWARD_TOKEN, getWalletTokenBalance } = require("../../simple");
const web3 = require("../../web3")
const { User } = require('../user/user.model');
const { NFT } = require("./nft.model");
const { Reward } = require("../base/reward.model");
const { Character } = require("../base/character.model");
const validator = require("./base.validator");
const { Social } = require('./social.model');
const conn = web3.connection;

router.get('/base/reward/rate', getRewardRate)

router.get('/base/social/get', getTwitterMsg)
router.get('/base/character', getCharacter)
router.get('/base/nfts', getNFTs)
router.get('/base/deposit/address', (req, res) => {
    res.json({ code: '00', 
        data: {
            depositAddress: process.env.ADMIN_WALLET, 
            tokenAddress: process.env.TOKEN_ADDRESS 
        }, 
        message: null}
    )
})

async function getRewardRate(req, res, next){
    // console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@get reword");
    try {
        await validator.getRewardRate(req);
        let { mode } = req.query;
        mode = mode ? mode : "PVP"
        let rewards = await Reward.findOne({mode: mode});
        res.json({code:'00', data: { rate: rewards?.rate, id: rewards?.id }, message: null})
    } catch(err) {
        res.json({code: '02', message: err.message});
    }
}
async function getTwitterMsg(req, res, next) {
    try {
        // console.log("$$$$$$$$$$$$$$$$$$$$$$get twitter msg");
        let social = await Social.find()
        let message = "";
        if(social.length > 0){
            message = social[0].message;
            
        }else{
            message = "";
        }
        res.json({ code: '00', data: message, message: null})
    } catch (error) {
        console.log("error=", error);
        res.json({ code: '02', message: error.message});
    }
}

async function getCharacter(req, res, next) {
    try {
        let character = await Character.find();
        let result = character.map(item => {return { 
            id: item.id,
            name: item.name,
            symbol: item.symbol,
            image: item.image,
            address: item.address
        }})
        res.json({ code: '00', data: result, message: null })
    } catch (error) {
        res.json({ code: '02', message: error.message })
    }
}

async function getNFTs(req, res, next){
    try {
        let nfts = await NFT.find().populate("character");
        let result = [];
        for( let nft of nfts){
            let nftMeta = await getMeta(conn, nft.address)
            result.push({
                id: nft.address,
                address: nft.address,
                character: nft.character,
                image: nftMeta?.json?.image,
                metaJson: nftMeta,
            })
        }
        res.json({code: '00', data: result, message:null})
    } catch (error) {
        res.json({ code: '02', message: error.message })
    }
}

module.exports = router;