const aq_unl = 1e80

function playerAQData() { return {
    unl: false,
    red: new Decimal(0),
    green: new Decimal(0),
    blue: new Decimal(0),
    energy: new Decimal(0),
    charge: new Decimal(0),
    upgs: [],
}}

function unlockAQ() {
    if (player.aq.unl) return;
    if (!player.photons.unl) return;
    if (player.photons.matter.lt(aq_unl)) return;
    player.photons.matter = player.photons.matter.sub(aq_unl);
    player.aq.unl = true;
    showTab("Quarks", "normal");
}

function getAntiGluonScaleName() {
    let scale = 0;
    if (player.size.gte(1e19)) scale = 1;
    if (player.size.gte(1e23)) scale = 2;
    return ["", "Folded ", "Compressed "][scale]
}

function getAQEffRoot(type) {
    let exp = tmp.aq.chargeEff;
    return exp;
}

function getGlobalAQGainMult() {
    let mult = new Decimal(1);
    if (hasAQUpg(11)) mult = mult.times(AQUpgEff(11));
    return mult;
}

function getAQGain(type) {
    if (!player.aq.unl) return new Decimal(0);
    let gain = Decimal.div(1, tmp.aq.eff["anti"+quark_types[(quark_types.indexOf(type)+2)%quark_types.length]]);
    if (hasDupEff(3)) gain = gain.times(tmp.dup.eff[3]);
    return gain;
}

function getAntiGluonGrowthMult() {
    let mult = new Decimal(1);
    if (hasAQUpg(12)) mult = mult.times(AQUpgEff(12));
    return mult;
}

function getAntiGluonSizeRatio() {
    if (!player.aq.unl) return new Decimal(0);

    let ratio = Decimal.sub(1, Decimal.div(1, tmp.aq.net.times(getAntiGluonGrowthMult()).plus(1).log10().div(2).plus(1).cbrt()))
    return ratio;
}

function getAntiGluonEff() {
    let size = tmp.aq.gluon.size;
    let eff = Decimal.pow(10, size.plus(1).log10().sqrt());
    if (hasAQUpg(21)) eff = eff.pow(AQUpgEff(21));
    if (isNaN(eff.mag)) return new Decimal(1);
    return eff;
}

function getAntiGluonProportionSize() {
    let size = player.size.div(1e15)
    if (size.gte(1e8)) size = Decimal.pow(1e8, size.log(1e8).sqrt());
    if (size.gte(1e4)) size = size.times(1e8).cbrt();
    return size;
}

function AQLoop(diff) {
    for (let c=0;c<quark_types.length;c++) player.aq[quark_types[c]] = player.aq[quark_types[c]].plus(tmp.aq.gain[quark_types[c]].times(diff));
    player.aq.energy = player.aq.energy.plus(getAQEnergyGain().times(diff));
}

function getAQEnergyGain() {
    let gain = tmp.aq.net.div(3).cbrt();
    if (hasAQUpg(11)) gain = gain.times(AQUpgEff(11));
    if (hasAQUpg(21)) gain = gain.times(tmp.aq.gluon.eff);
    if (hasDupEff(3)) gain = gain.times(tmp.dup.eff[3]);
    return gain;
}

const aq_upgs = {
    rows: 5,
    cols: 5,
    11: {
        unl() { return player.aq.unl },
        type: "aq",
        desc: "Antiquark & Anti-Energy gain are boosted by Photonic Matter.",
        cost: new Decimal(50),
        eff(p) { return player.photons.matter.plus(1).log10().div(20).plus(1).pow(p) },
        dispEff(e) { return "Currently: "+format(e)+"x" },
    },
    12: {
        unl() { return player.aq.upgs.includes(11) },
        type: "aq",
        desc: "The Anti-Gluon grows faster based on bought Hadronic Boosters.",
        cost: new Decimal(750),
        eff(p) { return player.hadrons.boosters.times(p).div(100).plus(1).pow(3) },
        dispEff(e) { return "Currently: "+format(e.cbrt())+"x" },
    },
    13: {
        unl() { return player.aq.upgs.includes(12) },
        type: "annihilation",
        desc: "Universe Essence strengthens AU18's exponent formula.",
        cost: new Decimal(1e6),
        eff(p) { return player.essence.times(p).div(1e3).plus(1).log2().plus(1).sqrt() },
        dispEff(e) { return "Currently: "+format(e.sqrt().sub(1).times(100))+"% stronger" },
    },
    14: {
        unl() { return player.aq.upgs.includes(13) },
        type: "universe",
        desc: "Anti-Red Quarks slow down Universal Slowdown.",
        cost: new Decimal(2e9),
        eff(p) { return player.aq.red.plus(1).log10().times(p).plus(1) },
        dispEff(e) { return "Currently: /"+format(e) },
    },
    15: {
        unl() { return hasDupUnl(0) },
        type: "annihilation",
        desc: "Gain Annihilation Energy over time.",
        cost: new Decimal("6.666e24"),
        eff(p) { return p },
        dispEff(e) { return "Currently: " + format(e.times(100)) + "% of AE gain/s" },
    },
    21: {
        unl() { return player.aq.upgs.includes(11) },
        type: "aq",
        desc: "The Anti-Gluon effect is raised to an exponent, and it affects Anti-Energy gain.",
        cost: new Decimal(1e3),
        eff(p) { return p.times(3) },
        dispEff(e) { return "Currently: ^"+format(e) },
    },
    22: {
        unl() { return player.aq.upgs.includes(21) },
        type: "photons",
        desc: "Photon Generators cheapen themselves & Rebuyable Void Upgrades.",
        cost: new Decimal(2e6),
        eff(p) { return Decimal.pow(2, (tmp.ph?tmp.ph.tgl:new Decimal(0)).times(p).sqrt()) },
        dispEff(e) { return "Currently: /"+format(e) },
    },
    23: {
        unl() { return player.aq.upgs.includes(22) },
        type: "prestige",
        desc: "Universal Upgrade 10's effect is raised to an exponent.",
        cost: new Decimal(5e9),
        eff(p) { return p.times(50) },
        dispEff(e) { return "Currently: ^"+format(e) },
    },
    24: {
        unl() { return player.aq.upgs.includes(23) },
        type: "photons",
        desc: "Anti-Green Quarks boost the gain of all Photons before UV.",
        cost: new Decimal(1e18),
        eff(p) { return player.aq.green.plus(1).log10().plus(1).pow(p.times(4)) },
        dispEff(e) { return "Currently: "+format(e)+"x" },
    },
    25: {
        unl() { return hasDupUnl(0) },
        type: "ultrawaves",
        desc: "Wave Accelerators are slightly stronger.",
        cost: new Decimal("1.234e25"),
        eff(p) { return p.sub(1).div(5).plus(1).sqrt() },
        dispEff(e) { return "Currently: " + format(e.sub(1).times(100)) + "% stronger" },
    },
    31: {
        unl() { return player.aq.upgs.includes(21) },
        type: "hadrons",
        desc: "UV Photons strengthen the Hadron effect.",
        cost: new Decimal(2e8),
        eff(p) { return player.photons.colors[6].amt.plus(1).log10().times(p).root(1.5) },
        dispEff(e) { return "Currently: "+format(e.sub(1).times(100))+"% stronger" },
    },
    32: {
        unl() { return player.aq.upgs.includes(31) },
        type: "prestige",
        desc: "Space-Time Fabric boosts Universe Essence gain.",
        cost: new Decimal(1e10),
        eff(p) { return player.void.fabric.plus(1).log10().div(3).times(p).plus(1).cbrt() },
        dispEff(e) { return "Currently: "+format(e)+"x" },
    },
    33: {
        unl() { return player.aq.upgs.includes(32) },
        type: "photons",
        desc: "UV Photons have their own unique effect.",
        cost: new Decimal(5e17),
        eff(p) { return p.sub(1) },
        dispEff(e) { return "Effect Power: "+format(e.times(100))+"%" },
    },
    34: {
        unl() { return player.aq.upgs.includes(33) },
        type: "universe",
        desc: "Anti-Blue Quarks reduce the Dimensional Depth req base.",
        cost: new Decimal(1.5e22),
        eff(p) { return player.aq.blue.plus(1).log10().times(p).plus(1).log2().plus(1) },
        dispEff(e) { return "Currently: "+format(e)+"th root" },
    },
    35: {
        unl() { return hasDupUnl(0) },
        type: "hadrons",
        desc: "Multiply Hadronic Booster gain based on Total Ultrawaves.",
        cost: new Decimal("1e62"),
        eff(p) { return (tmp.ph?.uwt ?? getTotalUltrawaves()).div(100).times(p).plus(1) },
        dispEff(e) { return "Currently: " + format(e) + "x" },
    },
    41: {
        unl() { return player.aq.upgs.includes(31) },
        type: "void",
        desc: "Space-Time Fabric strengthens Void Rebuyable Upgrades.",
        cost: new Decimal(5e12),
        eff(p) { return player.void.fabric.plus(1).log10().times(p).plus(1).log10().div(10).plus(1) },
        dispEff(e) { return "Currently: "+format(e.sub(1).times(100))+"% stronger" },
    },
    42: {
        unl() { return player.aq.upgs.includes(41) },
        type: "universe",
        desc: "Anti-Energy boosts Universe Growth Speed",
        cost: new Decimal(1.5e18),
        eff(p) { return player.aq.energy.div(1e16).plus(1).log2().times(p).plus(1).pow(1.5) },
        dispEff(e) { return "Currently: "+format(e)+"x" },
    },
    43: {
        unl() { return player.aq.upgs.includes(42) },
        type: "ultrawaves",
        desc: "Unlock X-Ray Photons & Ultrawaves.",
        cost: new Decimal(2e19),
        eff(p) { return p.sub(1).times(100) },
        dispEff(e) { return "Effect Power: "+format(e)+"%" },
    },
    44: {
        unl() { return player.aq.upgs.includes(43) },
        type: "photons",
        desc: "Wave Accelerators affect UV Photons.",
        cost: new Decimal(2.222e22),
    },
    45: {
        unl() { return hasDupUnl(0) },
        type: "annihilation",
        desc: "Annihilation Energy effect formula is more efficient.",
        cost: new Decimal("1e64")
    },
    51: {
        unl() { return hasDupUnl(0) },
        type: "photons",
        desc: "Hadronic Boosters strengthen Photon effects.",
        cost: new Decimal("2.4e24"),
        eff(p) { return tmp.had ? tmp.had.boostEff.max(1).log10().div(10).times(p).plus(1) : 1 },
        dispEff(e) { return "Currently: " + format(e.sub(1).times(100)) + "% stronger" },
    },
    52: {
        unl() { return hasDupUnl(0) },
        type: "aq",
        desc: "Unlock Antiquark Charge.",
        cost: new Decimal("1.5e25"),
        eff(p) { return p.sub(1).times(100) },
        dispEff(e) { return "Effect Power: "+format(e)+"%" },
    },
    53: {
        unl() { return hasDupUnl(0) },
        type: "universe",
        desc: "Universal Compaction starts later based on Total Duplicator Essence.",
        cost: new Decimal("1e63"),
        eff(p) { return player.dup.totalEssence.plus(player.dup.totalEssencePM).div(5).times(p).plus(1) },
        dispEff(e) { return "Currently: " + format(e) + "x later" },
    },
    54: {
        unl() { return hasDupUnl(0) },
        type: "void",
        desc: "Void Upgrades can be bought a third time in The Void, boosting their effects.",
        cost: new Decimal("1e64")
    },
    55: {
        unl() { return player.aq.upgs.includes(52) },
        type: "duplicators",
        desc: "Duplicator Essence is consumed faster based on Antiquark Charge.",
        cost: new Decimal("1e45"),
        eff(p) { return player.aq.charge.times(p).div(10).plus(1) },
        dispEff(e) { return "Currently: " + format(e) + "x" }
    }
}

function getAQUpgPower() {
    let power = player.aq.energy.plus(1).log10().plus(1).log10().plus(1);
    return power;
}

function hasAQUpg(id) {
    return player.aq.unl && aq_upgs[id].unl() && player.aq.upgs.includes(id)
}

function AQUpgEff(id) {
    return tmp.aq ? tmp.aq.upgs[id] : aq_upgs[id].eff?.(getAQUpgPower())
}

function buyAQUpg(id) {
    if (!player.aq.unl) return;
    if (player.aq.upgs.includes(id)) return;
    if (player.aq.energy.lt(aq_upgs[id].cost)) return;
    player.aq.energy = player.aq.energy.sub(aq_upgs[id].cost);
    player.aq.upgs.push(id);
}

function getAQChargeCost() {
    let c = player.aq.charge;
    if (c.gte(10)) c = Decimal.pow(10, c.log10().pow(2).times(2).sub(1));
    let cost = Decimal.pow(2.5, c.pow(1.2)).times(1e5);
    return cost;
}

function getAQChargeTarget() {
    let n = tmp.aq.net;
    let t = n.div(1e5).max(0.5).log(2.5).root(1.2);
    if (t.gte(10)) t = Decimal.pow(10, t.log10().plus(1).div(2).sqrt());
    return t.plus(1).floor()
}

function buyAQCharge(auto=false, max=false) {
    if (!hasAQUpg(52)) return;
    if (!auto) {
        tmp.aq.net = player.aq.red.plus(player.aq.blue).plus(player.aq.green)
        tmp.aq.chargeCost = getAQChargeCost();
    }
    if (tmp.aq.net.lt(tmp.aq.chargeCost)) return;
    if (!max) {
        subTotalAQ(tmp.aq.chargeCost);
        player.aq.charge = player.aq.charge.plus(1);
    } else player.aq.charge = player.aq.charge.max(getAQChargeTarget())
}

function subTotalAQ(x) {
    for (g=0; g<3; g++) player.aq[quark_types[g]] = player.aq[quark_types[g]].sub(player.aq[quark_types[g]].div(tmp.aq.net).times(x).min(player.aq[quark_types[g]]))
}

function getAQChargeEff() {
    if (!hasAQUpg(52)) return new Decimal(1);

    let eff = player.aq.charge.div(100).times(AQUpgEff(52));
    return eff.plus(1);
}