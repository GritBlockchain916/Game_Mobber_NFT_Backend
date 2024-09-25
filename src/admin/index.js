const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const router = express.Router()
const { getNFTswithImage, getNFTOne, getMeta } = require('../../metaplex');
const { REWARD_TOKEN, getWalletTokenBalance } = require("../../simple");
const web3 = require("../../web3")
const { User } = require('../user/user.model');
const { NFT } = require("../base/nft.model");
const { Reward } = require("../base/reward.model");
const { Social} = require("../base/social.model");
const { Character } = require("../base/character.model");
const validator = require("./admin.validator");
const { ObjectId } = require('../base/BaseSchema');
const { isValidAdmin, log } = require('../auth/middleware');

const conn = web3.connection;

router.get('/admin/dashboard/data/:wallet', isValidAdmin, getDashboardData)

// router.post('/admin/reward/rate', isValidAdmin, setRewardRate)
router.patch('/admin/reward/rate', isValidAdmin, updateRewardRate)
router.patch('/admin/social/update', isValidAdmin, setTwitterMsg)

router.post('/admin/character/add', isValidAdmin, createCharacter)
router.post('/admin/character/update', isValidAdmin, updateCharacter)

// add nft token contract and character
router.post("/admin/nft/create", isValidAdmin, createNFT)
router.post("/admin/nft/update", isValidAdmin, updateNFT)
router.post("/admin/nft/delete", isValidAdmin, deleteNFT)

async function getDashboardData(req, res, next){
    console.log("ASDFljLKDFJL")
    try {
        let nfts = await NFT.find().populate("character");
        let result = [];
        for( let nft of nfts){
            let nftMeta = await getMeta(conn, nft.address)
            let characters = []
            for(let character of nft.character){
                characters.push({
                    id: character.id,
                    name: character.name,
                })
            }
            result.push({
                id: nft.id,
                address: nft.address,
                // characters: characters,
                character: characters.length > 0 ? characters[0] : {},
                image: nftMeta?.json?.image,
                // metaJson: nftMeta,
            })
        }
        let rate = await Reward.findOne({mode: "PVE"});
        const social = await Social.find()
        let message = "";
        if(social.length > 0){
            message = social[0].message;
            
        }else{
            message = "";
        }
        return res.json({code:'00', data: {
            taxWallet: process.env.ADMIN_WALLET,
            token: process.env.TOKEN_ADDRESS,
            taxPerUnit: 0.5,
            nfts: result,
            rate: rate?.rate,
            xText: message,
        }})
    } catch(err) {
        console.log(err)
        return res.status(500).json(err.message);
    }
}

async function updateRewardRate(req, res, next) {
    try {
        await validator.setRewardRate(req);
        const user = req?.body?.user;
        const {rate, mode, wallet} = req.body;
        let reward = await Reward.findOne({mode: "PVE"})
        if(reward){
            console.log("here"); 
            reward.rate = rate;
            reward.mode = "PVE";
            await reward.save();
        }else{
            reward = new Reward ({
                rate, mode 
            });
            await reward.save();
        }
        log({
            role: "admin",
            user: user?.id, 
            wallet, 
            action: "setRewardRate", 
            model: "Reward", 
            result: `Setted reward : ${rate}`
        })
        res.json({ code: '00', data: reward, message: null})
    } catch (error) {
        res.json({ code: '02', message: error.message});
    }
}

async function setTwitterMsg(req, res, next) {
    try {
        console.log("settwiter");
        const user = req?.body?.user;
        const {msg, wallet} = req.body;
        let twitter = await Social.findOne({})
        console.log("tt = ",twitter);
        if(twitter){
            console.log("here2"); 
            twitter.message = msg;
            await twitter.save();
        }else{
            twitter = new Social ({
                msg
            });
            await twitter.save();
        }
        log({
            role: "admin",
            user: user?.id, 
            wallet, 
            action: "setTwitterMsg", 
            model: "Social", 
            result: `Setted Social : ${msg}`
        })
        res.json({ code: '00', data: msg, message: null})
    } catch (error) {
        console.log(error)
        res.json({ code: '02', message: error.message});
    }
}

async function updateRewardRate(req, res, next) {
    try {
        await validator.setRewardRate(req);
        const user = req?.body?.user;
        const {rate, mode, wallet} = req.body;
        let reward = await Reward.findOne({mode: "PVE"})
        if(reward){
            console.log("here"); 
            reward.rate = rate;
            reward.mode = "PVE";
            await reward.save();
        }else{
            reward = new Reward ({
                rate, mode 
            });
            await reward.save();
        }
        log({
            role: "admin",
            user: user?.id, 
            wallet, 
            action: "setRewardRate", 
            model: "Reward", 
            result: `Setted reward : ${rate}`
        })
        res.json({ code: '00', data: reward, message: null})
    } catch (error) {
        res.json({ code: '02', message: error.message});
    }
}


// async function updateRewardRate(req, res, next) {
//     try {
//         const { rate, mode, id } = req.body;
//         let rateData;
//         if(id){
//             rateData = await Reward.findById(id);
//             rateData.rate = rate
//             await rateData.save()
//         }else{
//             rateData = new Reward({
//                 rate: rate,
//                 mode: "PVE",
//             })
//             await rateData.save();
//         }
//         res.json({ code: '00', data: rateData, message: null})
//     } catch (error) {
//         res.json({ code: '03', message: error.message})
//     }
// }

async function createCharacter(req, res, next) {
    try{
        const { address, name, symbol, image } = req.body;
        let character = new Character({
            name,
            symbol,
            address,
            image,
        })
        await character.save();
        res.json({ code: '00', data: character, message: null })
    }catch(err){
        res.json({ code: '02', message: err.message })
    }
}

async function updateCharacter(req, res, next) {
    try {
        const {id, address, name, symbol, image} = req.body
        let character = await Character.findById(id);
        character.name = name;
        character.symbol = symbol;
        character.image = image;
        character.address = address;
        await character.save()
        return res.json({ code: '00', data: {}, message: null })
    } catch(err) {
        res.json({ code: '02', message: err.message })
    }
}

async function createNFT(req, res, next){
    try {
        const { nftMintAddress, character, wallet } = req.body;
        const user = req.body.user
        let nft = new NFT({
            address: nftMintAddress,
            character: character,
        })
        await nft.save();
        let nftMeta = await getMeta(conn, nft.address)
        nft = {
            id: nft.id,
            address: nft.address,
            character: nft.character, 
            image: nftMeta?.json?.image
        }
        log({
            role: "admin",
            user: user?.id, 
            wallet, 
            action: "createNFT", 
            model: "NFT", 
            result: `Created NFT : ${nft.id}, ${nft.address}`
        })        
        res.json({ code: '00', data: nft, message: null })
    } catch (error) {
        res.json({ code: '02', message: error.message })
    }
}
async function updateNFT(req, res, next){
    try {
        const { nftId, character, wallet } = req.body;
        const user = req.body.user;
        let nft = await NFT.findById(nftId)
        nft.character = [character];
        await nft.save();
        let nft_info = await NFT.findById(nftId).populate("character");
        let result = {
            id: nft.id,
            address: nft.address,
            character: nft_info?.character.length > 0 ? nft_info?.character[0] : {}, 
        }
        log({
            role: "admin",
            user: user?.id, 
            wallet, 
            action: "updateNFT", 
            model: "NFT", 
            result: `Updated character of NFT : ${nft_info?.character.length > 0 ? nft_info?.character[0]?.name : ""}`
        })
        res.json({ code: '00', data: result, message: null })
    } catch (error) {
        res.json({ code: '02', message: error.message })
    }
}

async function deleteNFT(req, res, next){
    try {
        const { nftId, wallet } = req.body;
        const user = req.body.user;
        let nft = await NFT.findByIdAndDelete(nftId)
        log({
            role: "admin",
            user: user?.id, 
            wallet, 
            action: "deleteNFT", 
            model: "NFT", 
            result: `Deleted NFT : ${nft.id}`
        })
        res.json({ code: '00', data: nft, message: null })
    } catch (error) {
        res.json({ code: '02', message: error.message })
    }
}

module.exports = router;