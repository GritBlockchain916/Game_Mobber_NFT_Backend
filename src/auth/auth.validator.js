module.exports = {
    login,
    register,
    loginWallet
}

async function login(req) {
    const { username, wallet } = req.body;
    if ( username === undefined || username === "" )
        throw {code: '02', message: "Username is null"}
    if ( wallet === undefined || wallet === "" )
        throw {code: '02', message: "Wallet address is null"}
}

async function loginWallet(req) {
    const { wallet } = req.body;
    if ( wallet === undefined || wallet === "" )
        throw {code: '02', message: "Wallet address is null"}
}

async function register(req) {
    const { username, password, email } = req.body;
    if ( username === undefined || username === "" )
        throw {code: '02', message: "Username is null"}
    if ( password === undefined || password === "" )
        throw {code: '02', message: "Password222 is null"}
}