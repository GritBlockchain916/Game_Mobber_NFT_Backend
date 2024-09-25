module.exports = {
    getImages,    
    getOneNFT,
}

async function getImages(req) {
    const { wallet } = req.params;
    if (wallet === undefined || wallet === "")
        throw {code: '02', message: "wallet address is null"}
}

async function getOneNFT(req) {
    const { wallet } = req.params;
    if (wallet === undefined || wallet === "")
        throw {code: '02', message: "wallet address is null"}
}