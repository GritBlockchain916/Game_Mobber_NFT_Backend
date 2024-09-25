const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const router = express.Router()
const jwt = require("jsonwebtoken");
const { User } = require('../user/user.model')
const validator = require('./auth.validator')
const web3 = require("../../web3");
const { getNFTswithImage } = require('../../metaplex');
const { NFT } = require('../base/nft.model');
const conn = web3.connection;
router.post('/auth/login', login)
router.post('/auth/loginWithWallet', loginWallet)
router.post('/auth/register', register)

async function login(req, res, next) {
    try {
        console.log("login ----", req.body);
        await validator.login(req);

        const { username, wallet } = req.body;

        let user = await User.findOne({ name: username });
        // console.log("---1:", user);
        if (!user) {


            user = new User({
                // email,
                name: username,
                wallet: wallet
            });
            await user.save();
            // console.log("---2:", user);
        }
        else {

            // console.log("---3:", user);
            // const isMatch = await user.compareWallet(wallet);
            console.log("wallet: ", wallet);
            console.log("user.wallet", user.wallet);
            if (wallet != user.wallet)
                return res.json({ code: '03', data: [], message: "User name already exist" });
        }

        let nfts = await getNFTswithImage(conn, wallet)
        let count = 0;
        // if user have not one nft .
        if (nfts.length == 0) return res.json({ code: "03", message: "You should to buy nfts to play this game." })
        for (let nft of nfts) {
            console.log("nft collection address ===", nft)
            const one = await NFT.findOne({ address: nft.collection })
            if(one) count ++;
        }
        // if user have not one nft including Supported NFT in system.
        if(count == 0) return res.json({ code: "03", message: "You should to buy nfts to play this game." })
        
        const token = jwt.sign({ id: user._id, username: user.name, role: user.role }, process.env.JWT_SECRET, {
            noTimestamp: true,
            expiresIn: '1h',
        })
        console.log("---4:", token);
        res.json({ code: '00', token, message: '' })

    } catch (err) {
        console.log(err)
        res.json({ code: '03', message: 'Login failed' });
    }
}

async function loginWallet(req, res, next) {
    try {
        console.log("login ----", req.body);
        await validator.loginWallet(req);

        const { wallet } = req.body;

        let user = await User.findOne({ wallet: wallet });
        console.log("---1:", user);
        if (!user) {

            return res.json({ code: '03', data: [], message: "User not registered" });
            console.log("---2:", user);
        }
        const token = jwt.sign({ id: user._id, username: user.name, role: user.role }, process.env.JWT_SECRET, {
            noTimestamp: true,
            expiresIn: '1h',
        })
        return res.json({ code: '00', token:token, username:user.name, message: "" });

    } catch (err) {
        console.log(err)
        res.json({ code: '03', message: 'Login failed' });
    }
}


async function register(req, res) {
    try {
        await validator.register(req);
        // Check if the user already exists
        const { username, password, email } = req.body;
        let user = await User.findOne({ name: username });
        if (user) {
            return res.json({ code: '03', message: 'User already exists' });
        }

        // Create new user instance
        user = new User({
            // email,
            name: username,
            password,  // Password will be hashed in the model pre-save hook
        });
        console.log("user ======", user)
        // Save the user to the database
        await user.save();

        const token = jwt.sign({ id: user._id, username: user.name }, process.env.JWT_SECRET, {
            noTimestamp: true,
            expiresIn: '1h',
        })
        res.json({ code: '00', token: token, message: 'User registered successfully' })
    } catch (err) {
        console.log("error:", err.message)
        res.json(err.message);
    }
}

module.exports = router;