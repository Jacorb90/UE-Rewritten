const quarks_unl_req = new Decimal(9)
const quark_types = ["red", "green", "blue"]

function playerQuarksData(fullReset=true) { return {
    unl: (!fullReset && hasAnhUpg(15)),
    red: new Decimal(0),
    green: new Decimal(0),
    blue: new Decimal(0),
    charge: new Decimal(0),
}}

function unlockQuarks() {
    if (player.quarks.unl) return;
    if (player.depth.lt(quarks_unl_req)) return;
    player.quarks.unl = true;
}

function getGlobalQKGainMult() {
    let mult = new Decimal(1)
    if (hasAnhUpg(21)) mult = tmp.anh.upgs[21].eff
    if (voidUpgActive(16) && player.quarks.unl && tmp.glu) mult = Decimal.mul(mult, tmp.glu.pow(getVoidUpgTier(16)>2 ? 1e6 : 1).pow(getVoidUpgTier(12)>2 ? 1.5625 : ((hasAnhUpg(31)&&getVoidUpgTier(12)>1)?1.25:1)));
    return mult;
}

function getQuarkGain(type) {
    if (!player.quarks.unl) return new Decimal(0);
    let gain = tmp.qk.eff[quark_types[(quark_types.indexOf(type)+2)%quark_types.length]];
    if (player.aq.unl && gain.gte(1)) gain = Decimal.mul(gain, tmp.aq.eff[type].max(1));
    if (hasDupEff(3)) gain = gain.times(tmp.dup.eff[3]);
    return gain;
}

function quarkLoop(diff) {
    for (let c=0;c<quark_types.length;c++) player.quarks[quark_types[c]] = player.quarks[quark_types[c]].plus(tmp.qk.gain[quark_types[c]].times(diff));
}

function getQuarkChargeCost() {
    let c = player.quarks.charge;
    if (c.gte(10)) c = Decimal.pow(10, c.log10().pow(2).times(2).sub(1));
    let cost = Decimal.pow(2.5, c.pow(1.2));
    if (player.hadrons.boosters.gte(4)||hasAnhUpg(15)) cost = cost.div(tmp.upgs[41].eff)
    return cost;
}

function getQuarkChargeTarget() {
    let n = tmp.qk.net;
    if (player.hadrons.boosters.gte(4)||hasAnhUpg(15)) n = n.times(tmp.upgs[41].eff)
    let t = n.max(0.5).log(2.5).root(1.2);
    if (t.gte(10)) t = Decimal.pow(10, t.log10().plus(1).div(2).sqrt());
    return t.plus(1).floor()
}

function buyQuarkCharge(auto=false, max=false) {
    if (!player.quarks.unl) return;
    if (!auto) {
        tmp.qk.net = player.quarks.red.plus(player.quarks.blue).plus(player.quarks.green)
        tmp.qk.chargeCost = getQuarkChargeCost();
    }
    if (tmp.qk.net.lt(tmp.qk.chargeCost)) return;
    if (!max) {
        subTotalQuarks(tmp.qk.chargeCost);
        player.quarks.charge = player.quarks.charge.plus(1);
    } else player.quarks.charge = player.quarks.charge.max(getQuarkChargeTarget())
}

function subTotalQuarks(x) {
    for (g=0; g<3; g++) player.quarks[quark_types[g]] = player.quarks[quark_types[g]].sub(player.quarks[quark_types[g]].div(tmp.qk.net).times(x).min(player.quarks[quark_types[g]]))
}

function getGluonGrowthMult() {
    let mult = tmp.upgs[22].eff;
    if (hasAnhUpg(14)) mult = mult.times(10);
    return mult;
}

function getGluonSizeRatio() {
    if (!player.quarks.unl) return new Decimal(0);

    let ratio = Decimal.sub(1, Decimal.div(1, tmp.qk.net.times(getGluonGrowthMult()).plus(1).log10().plus(1).sqrt()))
    return ratio;
}

function getGluonEff() {
    let size = tmp.qk.gluon.size;
    if (size.gte(300)) size = Decimal.pow(300, size.log(300).cbrt().plus(1)).sqrt();
    return size.times(2).plus(1).log2().plus(1).log2().max(1).times(tmp.upgs[31].eff.mul.plus(1).pow(tmp.upgs[31].eff.pow.div(2).times(tmp.had.boostEff.min(1.75))).times(tmp.had.boostEff.max(1.75).sub(.75)))
}

function getGluonProportionSize() {
    let size = player.size
    if (size.gte(1e6)) size = Decimal.pow(1e6, size.log(1e6).sqrt());
    if (size.gte(1e4)) size = size.times(1e8).cbrt();
    return size;
}

function softcapQKAmt(x) {
    if (x.gte(1e100)) x = x.times(1e100).sqrt();
    if (x.gte(1e50)) x = Decimal.pow(1e50, x.log(1e50).sqrt());
    return x;
}

function getQuarkEffExp(type) {
    let exp = tmp.qk.eff.charge.plus(tmp.qk.eff.addedCharge.sub(1)).times(tmp.had.boostEff).times(tmp.qk.eff.multiplyExp)
    if (type=="g" && player.photons.unl) exp = exp.times(tmp.ph.col[3].eff.eff); 
    return exp;
}

function getQuarkChargeEff() {
    let eff = player.quarks.charge.div(10);
    if (voidUpgActive(34)) eff = eff.times(getVoidUpgTier(34)>2?3:((hasAnhUpg(31)&&getVoidUpgTier(34)>1)?2.5:2));
    return eff.plus(1);
}

function getGluonScaleName() {
    let scale = 0;
    if (player.size.gte(1e4)) scale = 1;
    if (player.size.gte(1e6)) scale = 2;
    return ["", "Folded ", "Compressed "][scale]
}