module.exports = {
    getRewardRate
}

async function getRewardRate(req) {
    const { mode } = req.query;
    if (mode == undefined || mode == "")
        throw { code: '02', message: 'mode is null' }
}