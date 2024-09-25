module.exports = {
    getWalletInfo,    
    updateScoreAndClaimToken,
    depositToken,
}

async function getWalletInfo(req) {
    const { wallet } = req.params;
    if (wallet === undefined || wallet === "")
        throw {code: '02', message: "wallet address is null"}
}


async function updateScoreAndClaimToken(req) {
    const { wallet, score, mode } = req.body;
    if (wallet === undefined ||  wallet === "")
        throw { code: '02', message: "wallet address is null" }
    if (score === undefined || score === "" || !isFinite(score))
        throw { code: "02", message: "score is invalid"}
    if (score === undefined || score === "" )
        throw { code: "02", message: "mode is invalid"}
}

async function depositToken(req) {
    const { wallet, amount } = req.body;
    if (wallet === undefined ||  wallet === "")
        throw { code: '02', message: "wallet address is null" }
    if (amount === undefined || amount === "" || !isFinite(score))
        throw { code: '02', message: "amount is invalid" }
}