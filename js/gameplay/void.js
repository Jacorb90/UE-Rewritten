const voidReqs = [33, 100]

function playerVoidData() { return {
    unl: false,
    active: false,
    upgs: {},
    fabric: new Decimal(0),
    repUpgs: {},
}}

function canUnlockVoid() { return player.depth.gte(voidReqs[0]) && player.annihilation.energy.gte(voidReqs[1]) };
function unlockVoid() {
    if (player.void.unl) return;
    if (!canUnlockVoid()) return;
    player.void.unl = true;
}

function enterVoid() {
    if (!player.void.unl) return;
    player.void.active = !player.void.active;
    annihilate(true, false);
}

function getVoidUpgTier(id) {
    return player.void.upgs[id]||0
}

function voidUpgActive(id) {
    let tier = getVoidUpgTier(id);
    if (tier==0) return false;
    else if (tier==1) return player.void.active;
    else return true;
}

function getSTFabricGainSlowdownPower() {
    let power = new Decimal(1)
    if (voidUpgActive(35)) power = Decimal.sub(1, tmp.anh.upgs[35].voidEff)
    return power;
}

function getSTFabricGain() {
    let gain = Decimal.pow(2, player.size.log2().sqrt()).sub(1).div(player.time.times(getSTFabricGainSlowdownPower()).div(4).plus(1).sqrt().times(10));
    gain = gain.times(tmp.void.upgs[2].eff);
    if (voidUpgActive(12)) gain = gain.times(tmp.anh.upgs[12].voidEff);
    if (voidUpgActive(21)) gain = gain.times(tmp.anh.upgs[21].voidEff);
    if (voidUpgActive(24)) gain = gain.times(tmp.anh.upgs[24].voidEff.stf);
    if (voidUpgActive(36)) gain = gain.times(tmp.anh.upgs[36].voidEff);
    if (hasDupEff(0)) gain = gain.times(tmp.dup.eff[0]);
    if (hasDupUnl(3)) gain = gain.times(tmp.bat[1].eff[7]);
    return gain;
}

function getVoidUpgMaxTier() {
    return hasAQUpg(54) ? 3 : 2;
}

function voidLoop(diff) {
    if (!player.void.active) player.void.fabric = player.void.fabric.plus(tmp.void.stGain.times(tmp.ph.col[6].eff.eff).times(diff));
    else player.void.fabric = player.void.fabric.plus(tmp.void.stGain.times(diff));
}

const void_rep_upgs = {
    amt: 3,
    1: {
        title: "Universe of Darkness",
        desc: "Increase Universe Essence gain & Universe Growth Speed by 20%.",
        cost(l) { return Decimal.pow(2, Decimal.pow(1.5, l).sub(1)).div(hasAQUpg(22)?AQUpgEff(22):1).div(hasDupEff(6)?tmp.dup.eff[6]:1) },
        eff(l) { return Decimal.pow(1.2, l) },
        targ() { return player.void.fabric.times(hasAQUpg(22)?AQUpgEff(22):1).times(hasDupEff(6)?tmp.dup.eff[6]:1).max(1).log2().plus(1).log(1.5).plus(1).floor() },
        dispEff(e) { return "+"+formatWhole(e.sub(1).times(100))+"%" },
    },
    2: {
        title: "Continuum Error",
        desc: "Double Space-Time Fabric gain.",
        cost(l) { 
            if (l.gte(4)) l = Decimal.pow(4, l.log(4).pow(1.03))
            return Decimal.pow(5, l.times(.6).plus(1).pow(1.1)).div(hasAQUpg(22)?AQUpgEff(22):1).div(hasDupEff(6)?tmp.dup.eff[6]:1)
        },
        eff(l) { return Decimal.pow(2, l) },
        targ() { 
            let r = player.void.fabric.times(hasAQUpg(22)?AQUpgEff(22):1).times(hasDupEff(6)?tmp.dup.eff[6]:1).max(1).log(5).root(1.1).sub(1).div(.6);
            if (r.gte(4)) r = Decimal.pow(4, r.log(4).root(1.03));
            return r.plus(1).floor();
        },
        dispEff(e) { return formatWhole(e)+"x" },
    },
    3: {
        title: "Temporal Tear",
        desc: "Triple Annihilation Energy gain.",
        cost(l) { return Decimal.pow(10, l.pow(1.4)).times(80).div(hasAQUpg(22)?AQUpgEff(22):1).div(hasDupEff(6)?tmp.dup.eff[6]:1) },
        eff(l) { return Decimal.pow(3, l) },
        targ() { return player.void.fabric.times(hasAQUpg(22)?AQUpgEff(22):1).times(hasDupEff(6)?tmp.dup.eff[6]:1).div(80).max(1).log10().root(1.4).plus(1).floor() },
        dispEff(e) { return formatWhole(e)+"x" },
    },
}

function getVoidRepUpgPower() {
    let power = new Decimal(1);
    if (voidUpgActive(32)) power = power.times(getVoidUpgTier(32)>2?1.32:((hasAnhUpg(31)&&getVoidUpgTier(32)>1)?1.25:1.2))
    if (hasAQUpg(41)) power = power.times(AQUpgEff(41));
    return power;
}

function buyVoidRepUpg(x, auto=false) {
    if (!player.void.unl) return;
    if (!auto) tmp.void.upgs[x].lvl = player.void.repUpgs[x]||new Decimal(0)
    let cost = void_rep_upgs[x].cost(tmp.void.upgs[x].lvl)
    if (player.void.fabric.lt(cost)) return;
    let old = getUniverseEssenceGainMult();

    player.void.fabric = player.void.fabric.sub(cost)
    player.void.repUpgs[x] = Decimal.add(player.void.repUpgs[x]||0, 1)

    if (x==1) loadUniverseEssenceAmt(old, old.times(1.2));
}
function maxVoidRepUpg(x, auto=false) {
    if (!player.void.unl) return;
    if (!auto) tmp.void.upgs[x].lvl = player.void.repUpgs[x]||new Decimal(0)
    let targ = void_rep_upgs[x].targ();
    const oldU = player.void.repUpgs[x]||0;
    if (targ.lte(oldU)) return;
    let old = getUniverseEssenceGainMult();

    player.void.repUpgs[x] = Decimal.max(player.void.repUpgs[x]||0, targ);

    if (x==1) {
        if ((voidUpgActive(14)||voidUpgActive(16))&&hasAnhUpg(22)) setUniverseEssence()
        else loadUniverseEssenceAmt(old, old.times(Decimal.pow(1.2, targ.sub(oldU))));
    }
}
function maxAllVoidRepUpgs(auto=false) {
    for (let i=1; i<=void_rep_upgs.amt; i++) {
        maxVoidRepUpg(i, auto);
    }
}

function getExtraVoidRepUpgs() {
    let e = new Decimal(0)
    if (tmp.aq&&tmp.ph&&hasAQUpg(43)) e = tmp.ph.col[7].eff.eff;
    return e;
}