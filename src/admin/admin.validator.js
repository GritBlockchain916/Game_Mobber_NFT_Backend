module.exports = {
    setRewardRate
}

async function setRewardRate(req) {
    const { rate, mode } = req.body;
    if (rate === undefined || rate === "")
        throw {code: '02', message: "rate is null"}
    if (!isFinite(rate))
        throw { code: '02', message: "rate must be number"}
}

async function setSocialMsg(req) {
    const { msg} = req.body;
    if (rate === undefined || rate === "")
        throw {code: '02', message: "message is null"}
}