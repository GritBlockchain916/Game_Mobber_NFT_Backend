const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const router = express.Router()
const { getNFTswithImage, getNFTOne } = require('../../metaplex');
const { REWARD_TOKEN, getWalletTokenBalance, transferToken } = require("../../simple");
const web3 = require("../../web3")
const { User } = require('./user.model')
const { Reward } = require("../base/reward.model")
const service = require('./user.service')
const validator = require('./user.validator')
const jwt = require("jsonwebtoken")
const { isValidUser, log } = require("../auth/middleware");
const { NFT } = require('../base/nft.model');

const conn = web3.connection;

router.get('/user/wallet_info/:wallet', getWalletInfo)
router.get("/user/wallet/token/balance/:wallet", getWalletTokenAmount)
router.get('/user/info', isValidUser, getUserInfo)
router.get('/user/score/list', getScoreList)
// router.post('/user/score/update', isValidUser, updateScoreAndClaimToken)
router.post('/user/score/update', isValidUser, updateScore)
router.post('/user/token/claim', isValidUser, claimToken)
router.patch('/user/nft/update/:nftCollection', isValidUser, updateMyNFT)

const admin = process.env.ADMIN_WALLET
const admin1 = process.env.ADMIN_WALLET1

async function getWalletInfo(req, res, next) {
    try {
        await validator.getWalletInfo(req)
        const { wallet } = req.params;
        let nfts = await getNFTswithImage(conn, wallet)
        let tokenAmount = await getWalletTokenBalance(conn, wallet, REWARD_TOKEN)
        let rlt = { isAdmin: (admin == wallet || admin1 == wallet), tokenAmount, nfts };
        res.json({ code: '00', data: rlt, message: null })
    } catch (err) {
        res.json({ code: '02', message: err.message });
    }
}

function parseToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                // reject(err);  // Reject the promise with the error
                resolve(null)
            } else {
                resolve(decoded);  // Resolve the promise with the decoded payload
            }
        });
    });
}

async function getScoreList(req, res, next) {
    try {
        let { sortBy, limit, page } = req.query
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Extract token after 'Bearer'
        let loginUser = null;
        if (token)
            loginUser = await parseToken(token)

        page = page || 0;
        limit = limit || 10;
        sortBy = sortBy || "top10";

        let skip = page * limit;
        let scoreList = [];

        if (sortBy == "top10") {
            scoreList = await User.find().sort({ scores: -1 }).limit(10);
        } else if (sortBy === "global") {
            if (loginUser) {
                // console.log("Validated case ====", loginUser)
                let myScore = await User.findById(loginUser.id)
                let greaterPlayers = await User.find({ scores: { $gt: myScore.scores } }).sort({ scores: 1 }).limit(limit / 2);
                let smallerPlayers = await User.find({ scores: { $lt: myScore.scores } }).sort({ scores: -1 }).limit(limit / 2);
                scoreList = greaterPlayers;
                scoreList.push(myScore)
                scoreList = [...scoreList, ...smallerPlayers]
            } else
                scoreList = await User.find().sort({ scores: -1 }).skip(skip).limit(limit);
        }
        let result = scoreList.map(({ _id, name, scores }) => ({ id: _id, name, scores }))
        res.json({ code: '00', data: result, message: null });
    } catch (error) {
        res.json({ code: '02', message: error.message })
    }
}
// async function updateScoreAndClaimToken(req, res, next) {
async function updateScore(req, res, next) {
    try {

        const loginUser = req.body.user;
        const { wallet, score, mode } = req.body

        // let rate = await Reward.findOne({mode:"PVE"});
        // if(rate) rate = rate.rate;

        let user = await User.findById(loginUser.id);
        console.log("user=>", user)
        if (parseFloat(score) <= parseFloat(user.scores)) {
            return res.json({ code: '03', data: null, message: "Is not top score" })
        } else {
            // transfer token to user as a reward
            // console.log("reward rate ===", rate)
            // const tokenAmount = score * rate;
            // console.log("token Amount====", tokenAmount)
            // await transferToken(conn, process.env.ADMIN_PRIVATE_KEY, wallet, process.env.TOKEN_ADDRESS, tokenAmount);

            // Update user's score
            user.scores = score;
            await user.save();

            // log({
            //     role: "user",
            //     user: loginUser.id, 
            //     wallet, 
            //     action: "updateScoreAndClaimToken", 
            //     model: "User", 
            //     result: `PVE token reward amount: ${tokenAmount}`
            // })

            res.json({
                code: '00', data: {
                    id: user.id,
                    username: user.name,
                    score: user.scores,
                    // reward: tokenAmount
                }, message: null
            })
        }
    } catch (error) {
        res.json({ code: '02', message: error.message })
    }
}

async function claimToken(req, res, next) {
    try {

        const loginUser = req.body.user;
        const { wallet, score, mode } = req.body

        console.log("claimToken, amount:", score);

        let rate = await Reward.findOne({ mode: "PVE" });
        if (rate) rate = rate.rate;
        // const tokenAmount = score * rate;
        let user = await User.findById(loginUser.id);

        // transfer token to user as a reward
        let tokenAmount = 0;
        if (mode == 0) {
            tokenAmount = score * rate;
        }
        else {
            tokenAmount = score * 0.75;
        }

        console.log("claim token amount: ", tokenAmount);
        await transferToken(conn, process.env.ADMIN_PRIVATE_KEY, wallet, process.env.TOKEN_ADDRESS, tokenAmount.toFixed(4));

        // Log add.............
        log({
            role: "user",
            user: loginUser.id,
            wallet,
            action: "updateScoreAndClaimToken",
            model: "User",
            result: `PVP token reward amount: ${tokenAmount}`
        })

        res.json({
            code: '00', data: {
                id: user.id,
                username: user.name,
                score: score,
                reward: tokenAmount
            }, message: null
        })

    } catch (error) {
        res.json({ code: '02', message: error.message })
    }
}

async function getUserInfo(req, res, next) {
    try {
        const user = req.body.user;
        const admin = process.env.ADMIN_WALLET;
        const { wallet } = req.params
        let info = await User.findById(user.id);

        let nft = await NFT.findOne({ address: info.nft }).populate("character");
        let character = nft?.character.length > 0 ? nft?.character[0] : "";
        let result = {
            username: info.name,
            id: info.id,
            score: info.scores,
            // isAdmin: info.role == "admin",
            nft: info.nft,
            character: character,
        }
        res.json({ code: '00', data: result, message: null })
    } catch (error) {
        res.json({ code: '02', message: error.message })
    }
}

async function getWalletTokenAmount(req, res, next) {
    try {
        const { wallet } = req.params;
        let tokenBalance = await getWalletTokenBalance(conn, wallet, REWARD_TOKEN)
        res.json({ code: '00', data: tokenBalance, message: null })
    } catch (error) {
        res.json({ code: '02', message: error.message })
    }
}

async function updateMyNFT(req, res, next) {
    try {
        const loginUser = req.body.user;
        const { nftCollection } = req.params
        let user = await User.findById(loginUser.id);
        user.nft = nftCollection;
        await user.save();

        let nft = await NFT.findOne({ address: nftCollection }).populate("character");
        let character = nft.character.length > 0 ? nft.character[0] : "";
        let result = {
            username: user.name,
            id: user.id,
            score: user.scores,
            isAdmin: user.role == "admin",
            nft: user.nft,
            character: character,
        }
        log({
            role: "user",
            user: loginUser.id,
            wallet,
            action: "updateNFT",
            model: "User",
            result: `Changed character : ${character.name}`
        })
        res.json({ code: '00', data: result, message: null })
    } catch (error) {
        res.json({ code: '02', message: error.message })
    }
}

module.exports = router;