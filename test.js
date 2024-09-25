const { transferToken } = require("./simple")
const web3 = require("./web3")
const dotenv = require("dotenv")
dotenv.config();

const conn = web3.connection;
const wallet = "8gxNnsvD1FPgkFcHHZ4mDfHFbLhUEKThJrk1xrCXY25N";
const tokenAmount = 1920 * 0.003;

async function test() {
    await transferToken(conn, process.env.ADMIN_PRIVATE_KEY, wallet, process.env.TOKEN_ADDRESS, tokenAmount)    
}

test();