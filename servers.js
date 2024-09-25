/********************************************************************** The Road to Valhalla! ************************************************************************
 *                                                                                                                                                                   *
 *  📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌           *
 *  📌                                                                                                                                                  📌         *
 *  📌                                                                                                                                                  📌        *
 *  📌     📌            📌    📌📌         📌           📌       📌         📌📌        📌             📌                      📌📌             📌        *
 *  📌      📌          📌    📌  📌        📌           📌       📌        📌  📌       📌             📌                     📌  📌            📌       *
 *  📌       📌        📌    📌    📌       📌           📌       📌       📌    📌      📌             📌                    📌    📌           📌       *
 *  📌        📌      📌    📌      📌      📌           📌       📌      📌      📌     📌             📌                   📌      📌          📌       *
 *  📌         📌    📌    📌📌📌📌📌     📌            📌📌📌📌📌    📌📌📌📌📌    📌              📌                  📌📌📌📌📌         📌       *
 *  📌          📌  📌    📌          📌    📌           📌       📌    📌         📌   📌              📌                 📌          📌        📌       *
 *  📌           📌📌    📌            📌   📌           📌       📌   📌           📌  📌              📌                📌            📌       📌       *
 *  📌            📌    📌              📌  📌📌📌📌📌 📌        📌  📌            📌 📌📌📌📌📌    📌📌📌📌📌📌   📌              📌      📌       *
 *  📌                                                                                                                                                  📌      *
 *  📌                                                                                                                                                  📌      *
 *  📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌📌      *
 *                                                                                                                                                             *
 *  Project Type  : CrossyGame with NFT management                                                                                                            *
 *   Project ID   : 2024-2                                                                                                                                   *
 *   Client Info  : Private                                                                                                                                 *
 *    Developer   : Rothschild (Nickname)                                                                                                                  *
 *   Source Mode  : 100% Private                                                                                                                          *
 *   Description  : CrossyGame project with NFT as a service.                                                                                            *
 *  Writing Style : P0413-K0408-K1206                                                                                                                   *
 *                                                                                                                                                     *
 ********************************************************************** The Road to Valhalla! *********************************************************
 */

// Sample Libraries
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv")
const { getNFTswithImage, getNFTOne } = require('./metaplex');
const { REWARD_TOKEN, getWalletTokenBalance } = require('./simple');
const user = require("./src/user")
const auth = require("./src/auth")
const base = require("./src/base")
const adminRouter = require("./src/admin")
// --- DB ---
const { db_init } = require("./db/db.js");
const User = require("./db/User.js");
const PVE = require("./db/PVE.js");
const PVP = require("./db/PVP.js");
const NFT = require("./db/NFT.js");
const Room = require("./db/NFT.js");
db_init();
dotenv.config();

const token = '43uhykFm8Y9gLvHrWs7r7w1HCKu6vikDi7j394FaSfNz'
// const admin = "7GrU15pFFsWvJvNyihX9nvuCBDYumYjbd8WFsQWkd9G6";
const admin = process.env.ADMIN_WALLET

// Personal informations

const rooms = [];
// Global variables : MBC-on mobile responsive
const app = express();
app.use(cors())

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT')
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization'
    )
    next()
})


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '../../frontend', 'dist')));

const server = http.createServer(app);

const { Connection } = require('@solana/web3.js');

const conn = new Connection("https://mainnet.helius-rpc.com/?api-key=5c2e7676-8a44-414f-9ea6-97004d81bcb8");


app.get('/api/nft_images/:wallet', async (req, res) => {
    console.log(req.params.wallet)
    const images = await getNFTswithImage(conn, req.params.wallet)
    res.json({ images });
});
app.get('/api/wallet_info/:wallet', async (req, res) => {
    try {
        console.log(req.params.wallet)
        let nfts = await getNFTswithImage(conn, req.params.wallet)
        let tokenAmount = await getWalletTokenBalance(conn, req.params.wallet, REWARD_TOKEN)
        let rlt = { isAdmin: admin == req.params.wallet, tokenAmount, nfts };
        console.log(rlt);
        res.json(rlt);
    } catch (error) {
        console.log("error======>", error)
        res.json({ code: '04', error: error })
    }

});
app.get('/api/nft_one/:mint', async (req, res) => {
    console.log(req.params.mint)
    let nft = await getNFTOne(conn, req.params.mint)
    res.json({ nft });
});
app.get('/api/admin_data/:wallet', async (req, res) => {
    console.log(req.params.wallet)
    res.json({
        "taxWallet": admin,
        "token": REWARD_TOKEN,
        "taxPerUnit": 0.5,
        "nfts": [
            { "model": '1', "address": "2gE6Rw6Vszet7dvUnsVxaRHvtC8C8dWmB9YPijfESeVh", "name": "GH EXP Shard", "symbol": "", "image": "https://static2.mooar.com/mooarbox/shards/EXP100.png" },
            { "model": '2', "address": "B3tNFwDPE9U3t1zpCZ6kstFhPGCm8Ua1oTVrBRjxYzmu", "name": "GH Weapon Shard", "symbol": "", "image": "https://static2.mooar.com/mooarbox/shards/WEAPON100.png" }, { "address": "4Pb9A8oekvSxAk6PXq5aqagKk7SjZg1YzWamtQVEy7DR", "name": "MOOAR Sneaker", "symbol": "", "image": "https://static2.mooar.com/mooarbox/shards/Sneaker100.png" }, { "address": "DRJc1uKeUZHUWrWcpPdJjEU4zjprNdZjd911At1kM7dm", "name": "GH Pet Shard", "symbol": "", "image": "https://static2.mooar.com/mooarbox/shards/PET100.png" },
            { "model": '3', "address": "9FdEVNDomPrhAGCuiLAghYeFYK9ZWxiZDhQvv35P9jGE", "name": "Kuku shard", "symbol": "", "image": "https://static2.mooar.com/mooarbox/shards/Kuku100.png" },
            { "model": '4', "address": "4SjWaewxmfefn3YfbLP6PxwPCLHkQW5J8o2UghivGSh2", "name": "BAYC Shard", "symbol": "", "image": "https://static2.mooar.com/mooarbox/shards/BAYC100.png" }
        ]
    });
});
app.post('/api/add_new_token', async (req, res) => {
    res.json({})
})
app.use("/api/v1", user);
app.use("/api/v1", auth);
app.use("/api/v1", base);
app.use("/api/v1", adminRouter);

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '../NFT_Game', 'web-build')));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../NFT_Game", 'web-build', 'index.html'));
})

const io = socketIo(server, {
    cors: {
        origin: "*", // Or specify your allowed origins
        methods: ["GET", "POST"],
        credentials: true
    },
    allowEIO3: true,
    transports: ['websocket', 'polling']
});
io.on('connection', (socket) => {
    socket.on('message', (dataString) => {
        let data = JSON.parse(dataString);
        let index;
        switch (data.cmd) {
            /*
                cmd: 'ACTION_CREATE_ROOM',
                player1: cUserName,
                map: globalMap
            */

            case "ACTION_CREATE_ROOM":
                // Add room information to the rooms array
                // Name : ROOM_Name : socket.id is the room name for the test
                // Player1 : The guy who create the room :: will add the name of the player but now socket.id for test
                // Player2 : The guy who would like to join.
                // Map : The map to be used on the MULTI-players
                // Status : 0 : No play, 1 : Someone Joined, 2 : Playing now...
                console.log("Creating Room with userName : ", data.player1);
                index = rooms.findIndex(room => room.player1 === data.player1);



                // MBC - This logic is for test
                if (index != -1) {
                    // socket.emit('ROOM', { cmd: "SIGNAL_ROOM_CREATED", status : false, msg : "You already created room !" });
                    rooms.splice(index, 1);
                }
                // console.log("create amount = ", data.amount);
                rooms.push({
                    name: socket.id,
                    player1: data.player1, player1_id: socket.id,
                    player2: undefined, player2_id: undefined,
                    status: 0,
                    map: data.map,
                    score1: 0,
                    score2: 0,
                    amount: 0,
                    deposit1: false,
                    deposit2: false,
                });
                // console.log("rooms: ", rooms);
                socket.emit('ROOM', {
                    cmd: "SIGNAL_ROOM_CREATED",
                    status: true,
                    name: socket.id,
                    players: [{
                        player_name: data.player1,
                        player_id: socket.id,
                        player_state: 1
                    }, {
                        player_name: undefined,
                        player_id: undefined,
                        player_state: 0
                    }]
                });
                console.log("---c room --", rooms);
                break;

            /*
                cmd: 'ACTION_JOIN_GAME',
                name: serverId,
                player2: userName
            */
            case "ACTION_JOIN_GAME":
                console.log("Joing game", data);
                // Finding the room
                index = rooms.findIndex(room => room.name === data.name);
                // If room exists
                if (index != -1) {
                    // If game not started
                    console.log(rooms[index].status);
                    if (rooms[index].status == 0) {
                        // Player2 Joined the Game : state to JOIN
                        rooms[index].status = 1;
                        rooms[index].player2 = data.player2;
                        rooms[index].player2_id = socket.id;

                        const player1Socket = io.sockets.sockets.get(rooms[index].player1_id);
                        // Notice Server
                        if (player1Socket) {
                            player1Socket.emit("ROOM", {
                                status: true,
                                cmd: 'SIGNAL_ROOM_JOINED',
                                name: rooms[index].name,
                                globalMap: rooms[index].map,
                                role: 'server',
                                amount: rooms[index].amount,
                                players: [
                                    { player_name: rooms[index].player1, player_id: rooms[index].player1_id, player_state: 1 },
                                    { player_name: rooms[index].player2, player_id: rooms[index].player2_id, player_state: 1 }
                                ]
                            });
                        }

                        // Notice Client
                        socket.emit("ROOM", {
                            status: true,
                            cmd: 'SIGNAL_ROOM_JOINED',
                            globalMap: rooms[index].map,
                            role: 'client',
                            amount: rooms[index].amount,
                            players: [
                                { player_name: rooms[index].player1, player_id: rooms[index].player1_id, player_state: 1 },
                                { player_name: rooms[index].player2, player_id: rooms[index].player2_id, player_state: 1 }
                            ]
                        });
                        rooms[index].status = 1;
                        console.log("Joined:", rooms[index]);
                    }
                }
                else {
                    console.log("No ROOM with that name :", data);
                    // Notice Client
                    socket.emit("ROOM", {
                        cmd: 'SIGNAL_ROOM_JOINED',
                        status: false,
                        msg: "Invalid link, please check your link."
                    });
                }
                break;
            case "CLIENT_JOIN_EXIT":
                index = rooms.findIndex(room => room.player2_id === socket.id);
                if (index != -1) {
                    rooms[index].player2 = undefined;
                    rooms[index].player2_id = undefined;
                    rooms[index].player_state = 0;
                    rooms[index].status = 0;
                    const otherPlayer = io.sockets.sockets.get(rooms[index].player1_id);
                    otherPlayer.emit('ROOM', {
                        cmd: "SIGNAL_ROOM_CREATED",
                        status: 0,
                        name: socket.id,
                        players: [{
                            player_name: data.player1,
                            player_id: socket.id,
                            player_state: 1
                        }, {
                            player_name: undefined,
                            player_id: undefined,
                            player_state: 0
                        }]
                    });
                }
                break;
            case "CLOSE_ROOM":
                // Find the room index in the array
                index = rooms.findIndex(room => room.player1_id === socket.id);
                if (index !== -1) {
                    if (rooms[index].player2_id != undefined) {
                        const otherPlayer = io.sockets.sockets.get(rooms[index].player2_id);
                        otherPlayer.emit('ROOM', { cmd: "ROOM_CLOSED", msg: data.name + " is Closed!" });
                    }
                    rooms.splice(index, 1);

                }

                break;
            case "GET_SERVERS":
                const ret_servers = [];
                for (let i = 0; i < rooms.length; i++) {
                    let cur = rooms[i];
                    cur.mine = false;
                    if (cur.name == socket.id)
                        cur.mine = true;
                    ret_servers.push(cur);
                }
                socket.emit('ROOM', { cmd: "GOT_SERVERS", servers: ret_servers });
                break;
            case "GET_AMOUNT":
                index = rooms.findIndex(room => room.name === data.name);
                console.log("GET_AMOUNT index=", index);
                console.log("rooms: ", rooms);
                console.log("data.name: ", data.name);
                if (index != -1)
                    socket.emit('ROOM', { cmd: "RETURN_AMOUNT", serverAmount: rooms[index].amount });
                break;
            case "CLIENT_PLAY_AGAIN":
                index = rooms.findIndex(room => room.player2_id === socket.id);
                console.log("agin index = ", index);
                if (index !== -1) {
                    const otherPlayer = io.sockets.sockets.get(rooms[index].player1_id);
                    otherPlayer.emit("ROOM", { cmd: "CLIENT_PLAY_AGAIN_APPROVED" });
                }
                break;
            case "TOKEN_DEPOSITED":
                console.log("otherCharacter = ", data.otherCharacter);
                if (data.role == 'server') {

                    index = rooms.findIndex(room => room.name === socket.id);
                    console.log("Request of TOKEN_DEPOSITED___________________:", socket.id);
                    if (index !== -1) {
                        const otherPlayer = io.sockets.sockets.get(rooms[index].player2_id);
                        rooms[index].deposit1 = true;
                        otherPlayer.emit("ROOM", { cmd: "OTHER_DEPOSITED", otherCharacter:data.otherCharacter});
                    }
                }
                if (data.role == 'client') {
                    index = rooms.findIndex(room => room.player2_id === socket.id);
                    if (index !== -1) {
                        const otherPlayer = io.sockets.sockets.get(rooms[index].player1_id);
                        rooms[index].deposit2 = true;
                        otherPlayer.emit("ROOM", { cmd: "OTHER_DEPOSITED", otherCharacter:data.otherCharacter});
                    }
                }
                break;
            case "OTHER_GAME_OVER":
                if (data.role == 'server') {

                    index = rooms.findIndex(room => room.name === socket.id);
                    console.log("OTHER_GAME_OVER:", socket.id);
                    if (index !== -1) {
                        const otherPlayer = io.sockets.sockets.get(rooms[index].player2_id);

                        otherPlayer.emit("ROOM", { cmd: "OTHER_IS_OVER" });
                    }
                }
                if (data.role == 'client') {
                    index = rooms.findIndex(room => room.player2_id === socket.id);
                    if (index !== -1) {
                        const otherPlayer = io.sockets.sockets.get(rooms[index].player1_id);
                        otherPlayer.emit("ROOM", { cmd: "OTHER_IS_OVER" });
                    }
                }
                break;
            case "CHAT_TEXT":
                if (data.role == 'server') {
                    index = rooms.findIndex(room => room.name === socket.id);
                    if (index !== -1) {
                        const otherPlayer = io.sockets.sockets.get(rooms[index].player2_id);

                        otherPlayer.emit("ROOM", { cmd: "CHAT_TEXT", text: data.text });
                    }
                }
                if (data.role == 'client') {
                    index = rooms.findIndex(room => room.player2_id === socket.id);
                    if (index !== -1) {
                        const otherPlayer = io.sockets.sockets.get(rooms[index].player1_id);
                        otherPlayer.emit("ROOM", { cmd: "CHAT_TEXT", text: data.text });
                    }
                }
                break;
            case "ACTION_START_GAME":
                console.log("Request of start_game___________________:", socket.id);
                // console.log("data : ", data);
                if (data.role == 'server') {
                    // console.log("rooms = ", rooms);
                    index = rooms.findIndex(room => room.name === socket.id);

                    console.log("index = ", index);
                    if (index !== -1) {
                        console.log(data);
                        const otherPlayer = io.sockets.sockets.get(rooms[index].player2_id);
                        // console.log("other : ", otherPlayer);
                        if (otherPlayer) {
                            otherPlayer.emit("ROOM", { cmd: "START_GAME_APPROVED" });
                        }
                        socket.emit("ROOM", { cmd: "START_GAME_APPROVED" });
                    }
                }
                // MBC-if the starting strategy changed
                // else if (data.role == 'client') {
                //     index = rooms.findIndex(room => room.player2 === socket.id);
                //     if (index !== -1) {
                //         console.log(data);
                //         const otherPlayer = io.sockets.sockets.get(rooms[index].player1);
                //         // console.log("other : ", otherPlayer);
                //         if (otherPlayer) {
                //             otherPlayer.emit("START_GAME_APPROVED", { msg: "Start Game ! OK !" });
                //         }
                //         socket.emit("START_GAME_APPROVED", { msg: "Start Game ! OK !" });
                //     }
                // }
                break;
            case "GO_TO_DEPOSIT":
                console.log("Request of to deposit screen___________________:", socket.id);
                // console.log("data : ", data);
                if (data.role == 'server') {
                    // console.log("rooms = ", rooms);
                    index = rooms.findIndex(room => room.name === socket.id);

                    console.log("index = ", index);
                    if (index !== -1) {
                        console.log(data);
                        const otherPlayer = io.sockets.sockets.get(rooms[index].player2_id);
                        // console.log("other : ", otherPlayer);
                        if (otherPlayer) {
                            otherPlayer.emit("ROOM", { cmd: "TO_DEPOSIT_PAGE" });
                        }
                        socket.emit("ROOM", { cmd: "TO_DEPOSIT_PAGE" });
                    }
                }
                break;
            case "START_GAME":
                console.log("Request of start_game___________________:", socket.id);
                console.log("data : ", data);
                if (data.role == 'server') {
                    index = rooms.findIndex(room => room.name === socket.id);
                    if (index !== -1) {
                        console.log(data);
                        const otherPlayer = io.sockets.sockets.get(rooms[index].player2_id);
                        // console.log("other : ", otherPlayer);
                        if (otherPlayer) {
                            otherPlayer.emit("ROOM", { cmd: "START_GAME_APPROVED" });
                        }
                        socket.emit("ROOM", { cmd: "START_GAME_APPROVED" });
                    }
                }
                // MBC-if the starting strategy changed
                // else if (data.role == 'client') {
                //     index = rooms.findIndex(room => room.player2 === socket.id);
                //     if (index !== -1) {
                //         console.log(data);
                //         const otherPlayer = io.sockets.sockets.get(rooms[index].player1);
                //         // console.log("other : ", otherPlayer);
                //         if (otherPlayer) {
                //             otherPlayer.emit("START_GAME_APPROVED", { msg: "Start Game ! OK !" });
                //         }
                //         socket.emit("START_GAME_APPROVED", { msg: "Start Game ! OK !" });
                //     }
                // }
                break;
            case "REGISTER_SCORE":
                console.log("Request of register_score___________________:", socket.id);
                console.log("data : ", data);
                let otherPlayer;
                if (data.role == 'server') {
                    index = rooms.findIndex(room => room.name === socket.id);
                    if (index !== -1) {
                        otherPlayer = io.sockets.sockets.get(rooms[index].player2_id);
                        rooms[index].score1 = data.score;
                    }
                }
                if (data.role == 'client') {
                    index = rooms.findIndex(room => room.player2_id === socket.id);
                    if (index !== -1) {
                        otherPlayer = io.sockets.sockets.get(rooms[index].player1_id);
                        rooms[index].score2 = data.score;
                    }
                }



                if (index !== -1) {
                    console.log("score : ", rooms[index].score1, rooms[index].score2)
                    if (rooms[index].score1 !== 0 && rooms[index].score2 !== 0) {
                        socket.emit("ROOM", { cmd: "MATCH_RESULT", score1: rooms[index].score1, score2: rooms[index].score2 });
                        otherPlayer.emit("ROOM", { cmd: "MATCH_RESULT", score1: rooms[index].score1, score2: rooms[index].score2 });
                        rooms[index].score1 = 0;
                        rooms[index].score2 = 0;
                    }
                    otherPlayer.emit("ROOM", { cmd: "OTHER_PLAYER_OVER"});
                }
                break;
            case "PLAY_GAME":
                console.log("Request of play_game___________________:", socket.id);
                console.log("data : ", data);
                if (data.role == 'server') {
                    index = rooms.findIndex(room => room.name === socket.id);
                    if (index !== -1) {
                        // console.log(data);
                        const otherPlayer = io.sockets.sockets.get(rooms[index].player2_id);
                        // console.log("other : ", otherPlayer);
                        if (otherPlayer) {
                            otherPlayer.emit("PLAY_GAME_APPROVED", { role: 'client' });
                            console.log("Sent to the other player: client");
                        }
                        socket.emit("PLAY_GAME_APPROVED", { role: data.role });
                        console.log("Sent to the server:", data.role);
                    }
                }
                // MBC-if the starting strategy changed
                // else if (data.role == 'client') {
                //     index = rooms.findIndex(room => room.player2 === socket.id);
                //     if (index !== -1) {
                //         console.log(data);
                //         const otherPlayer = io.sockets.sockets.get(rooms[index].player1);
                //         // console.log("other : ", otherPlayer);
                //         if (otherPlayer) {
                //             otherPlayer.emit("START_PLAY_GAME_APPROVED", { msg: "Start Game ! OK !" });
                //         }
                //         socket.emit("START_PLAY_GAME_APPROVED", { msg: "Start Game ! OK !" });
                //     }
                // }
                break;
            case "MOVE_PERSON":
                if (data.role == 'server') {
                    index = rooms.findIndex(room => room.name === socket.id);
                    // console.log("GOOD!!!", data);
                    // console.log({ direction: data.direction, role: data.role, align: data.align });
                    let opRole = data.role == 'server' ? 'client' : 'server';
                    if (index != -1) {
                        // socket.emit("MOVE_PERSON_APPROVED", { direction: data.direction, role: data.role, align: data.align });
                        if (rooms[index].player2) {
                            const otherPlayer = io.sockets.sockets.get(rooms[index].player2_id);
                            otherPlayer.emit("MOVE_PERSON_APPROVED", { direction: data.direction, role: opRole, align: data.align });
                            console.log({ direction: data.direction, role: opRole, align: data.align });
                        }
                    }
                } else if (data.role == 'client') {
                    // index of the second player
                    index = rooms.findIndex(room => room.player2_id === socket.id);
                    // console.log("GOOD!!!", data);
                    // console.log({ direction: data.direction, role: data.role, align: data.align });
                    let opRole = data.role == 'server' ? 'client' : 'server';
                    if (index != -1) {
                        // socket.emit("MOVE_PERSON_APPROVED", { direction: data.direction, role: data.role, align: data.align });
                        if (rooms[index].player2) {
                            const otherPlayer = io.sockets.sockets.get(rooms[index].player1_id);
                            otherPlayer.emit("MOVE_PERSON_APPROVED", { direction: data.direction, role: opRole, align: data.align });
                            console.log({ direction: data.direction, role: opRole, align: data.align });
                        }
                    }
                }
                break;
            case "SET_BET_AMOUNT":
                index = rooms.findIndex(room => room.name === socket.id);
                console.log("cmd - SET_BET_AMOUNT", data);
                if (index != -1) {
                    rooms[index].amount = data.amount;
                    if (rooms[index].player2) {
                        const otherPlayer = io.sockets.sockets.get(rooms[index].player2_id);
                        otherPlayer.emit("ROOM", { cmd: "SET_BET_AMOUNT", amount: data.amount });

                    }
                }
                break;
            case "MOVE_PERSON":
                index = rooms.findIndex(room => room.name === socket.id);
                console.log("Let's move : ", data);
                break;
            case "END_ROOM":
                console.log("End_Room :", data);
                index = rooms.findIndex(room => room.name === socket.id);
                // If server click the end room.
                if (index != -1) {
                    if (rooms[index].player2 != undefined) {
                        const otherPlayer = io.sockets.sockets.get(rooms[index].player2_id);
                        if (otherPlayer) {
                            otherPlayer.emit("END_ROOM", {
                                who: 'server'
                            });
                        }
                    }
                    rooms.splice(index, 1);
                    socket.emit("END_ROOM", {
                        who: 'server'
                    });
                } else {
                    console.log("Client quits the room");
                    // When the client would like to quit from the room
                    index = rooms.findIndex(room => room.player2_id === socket.id);
                    if (index != -1) {
                        rooms[index].player2 = undefined;
                        rooms[index].player2_id = undefined;
                        rooms[index].status = 0;
                        console.log("say server that client quits");
                        const otherPlayer = io.sockets.sockets.get(rooms[index].player1_id);
                        otherPlayer.emit("END_ROOM", {
                            who: 'client'
                        })
                        console.log("say client that server kicked you");
                        socket.emit("END_ROOM", {
                            who: 'server'
                        });
                    }
                }
                break;
            case "END_GAME":
                console.log("End_Game :", data);
                index = rooms.findIndex(room => room.name === socket.id);
                // If server click the end game.
                if (index != -1) {
                    if (rooms[index].player2 != undefined) {
                        const otherPlayer = io.sockets.sockets.get(rooms[index].player2_id);
                        otherPlayer.emit("ROOM", {
                            cmd: 'END_GAME'
                        });
                    }
                    // rooms[index].player2 = undefined;
                    rooms[index].status = 1;
                    // rooms.splice(index, 1);
                    socket.emit("ROOM", {
                        cmd: 'END_GAME'
                    });
                }
                // else {
                //     index = rooms.findIndex(room => room.player2 === socket.id);
                //     // Client end game
                //     if (index != -1) {
                //         if (rooms[index].player1 != undefined) {
                //             const otherPlayer = io.sockets.sockets.get(rooms[index].player1);
                //             otherPlayer.emit("ROOM", {
                //                 cmd: 'END_GAME'
                //             });
                //         }
                //         rooms[index].player2 = undefined;
                //         rooms[index].status = 0;
                //         socket.emit("ROOM", {
                //             cmd: 'END_GAME'
                //         });
                //     }
                // }
                break;
            default:
                // Handle any other commands here
                console.log("Unknown command: " + data.cmd);
                break;
        }
    });
    socket.on('disconnect', () => {
        console.log("Someone disconnected !");
        let index = rooms.findIndex(room => room.player1_id === socket.id);
        // Server disconnected
        console.log(rooms);
        if (index !== -1) {
            // Notice client

            const player2Socket = io.sockets.sockets.get(rooms[index].player2_id);
            // Notice Server
            if (player2Socket) {
                player2Socket.emit("ROOM", {
                    status: true,
                    cmd: 'SIGNAL_ROOM_JOINED',
                    role: 'client',
                    players: [
                        { player_name: undefined, player_id: undefined, player_state: 0 },
                        { player_name: undefined, player_id: undefined, player_state: 0 }
                    ]
                });
            }

            rooms.splice(index, 1);
            console.log("removed the room");
        }
        index = rooms.findIndex(room => room.player2_id === socket.id);
        // Client disconnected
        if (index !== -1) {
            rooms[index].player2 = undefined;
            rooms[index].player2_id = undefined;
            rooms[index].status = 0;

            // Notice to the server that client is out
            const player1Socket = io.sockets.sockets.get(rooms[index].player1_id);
            // Notice Server
            if (player1Socket) {
                player1Socket.emit("ROOM", {
                    status: true,
                    cmd: 'SIGNAL_ROOM_JOINED',
                    name: rooms[index].name,
                    globalMap: rooms[index].map,
                    role: 'server',
                    players: [
                        { player_name: rooms[index].player1, player_id: rooms[index].player1_id, player_state: 1 },
                        { player_name: rooms[index].player2, player_id: rooms[index].player2_id, player_state: 0 }
                    ]
                });
            }

            console.log("remove client user info");
        }
    });
});
const PORT = process.env.PORT || 7001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

