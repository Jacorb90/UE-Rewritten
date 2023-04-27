const dup_unl = 5;
const dup_effects = [
    {
        unl() { return player.dup.unl },
        req: new Decimal(50),
        desc: "Duplicators multiply Space-Time Fabric gain.",
        effect() { return tmp.dup.amount.max(1) }
    },
    {
        unl() { return hasDupEff(0) },
        req: new Decimal(600),
        desc: "Duplicators multiply Annihilation Energy gain.",
        effect() { return tmp.dup.amount.max(1) }
    },
    {
        unl() { return hasDupEff(1) },
        req: new Decimal(1e4),
        desc: "Duplicators multiply Photonic Matter & Photon gain.",
        effect() { return tmp.dup.amount.max(1) }
    },
    {
        unl() { return hasDupEff(2) },
        req: new Decimal("2e11"),
        desc: "Duplicators multiply Anti-Energy, Quarks, & Anti-Quark gain.",
        effect() { return tmp.dup.amount.max(1) }
    },
    {
        unl() { return hasDupEff(3) },
        req: new Decimal("1e20"),
        desc: "Duplicators divide Ultrawave & Dimensional Depth requirements.",
        effect() { return tmp.dup.amount.max(1) },
        effSymbol: "/"
    },
    {
        unl() { return hasDupEff(4) },
        req: new Decimal("1e66"),
        desc: "Duplicators divide Duplicator Essence costs.",
        effect() { return tmp.dup.amount.max(1) },
        effSymbol: "/"
    }
]
const dup_unlocks = [
    {
        unl() { return player.dup.unl },
        req: new Decimal(87654321),
        desc: "Unlock new Anti-Energy Upgrades."
    },
    {
        unl() { return hasDupUnl(0) },
        req: new Decimal("1e25"),
        desc: "Unlock a new source of Duplicator Essence."
    },
    {
        unl() { return hasDupUnl(1) },
        req: new Decimal("1e45"),
        desc: "Unlock Dupli-Depths, and consume Duplicator Essence faster based on its amount."
    }
]

function playerDupData() { return {
    unl: false,
    essence: new Decimal(0),
    totalEssence: new Decimal(0),
    totalEssencePM: new Decimal(0),
    time: new Decimal(0),
    depths: new Decimal(0),
    effects: [],
    unlocks: []
}}

function unlockDup() {
    if (player.dup.unl) return;
    if (!player.aq.unl) return;
    if (getTotalUltrawaves().lt(dup_unl)) return;
    player.dup.unl = true;
    showTab("Duplicators", "normal");
}

function getDupEssenceCostDiv() {
    let d = new Decimal(1);
    if (hasDupEff(5)) d = d.mul(tmp?.dup?.eff?.[5] ?? dup_effects[5].effect())
    return d;
}

function getDupEssenceCost() {
    let ess = Decimal.div(player.dup.totalEssence, tmp.dup.depthEff);
    if (ess.gte(40)) ess = ess.pow(2).div(20);
    return Decimal.pow(1.1, Decimal.pow(ess, 1.2)).times(1e22).div(getDupEssenceCostDiv());
}
function getDupEssenceTarget() {
    const e = Decimal.mul(player.aq.energy, getDupEssenceCostDiv());
    if (Decimal.lt(e, 1e22)) return new Decimal(0);

    let targ = Decimal.div(e, 1e22).max(1).log(1.1).root(1.2);
    if (targ.gte(80)) targ = targ.times(20).sqrt();
    return targ.times(tmp.dup.depthEff).plus(1).floor();
}

function getDupEssenceCostPM() {
    let ess = Decimal.div(player.dup.totalEssencePM, tmp.dup.depthEff);
    if (ess.gte(50)) ess = ess.pow(2).div(45);
    return Decimal.pow("1e10", Decimal.pow(ess, 1.2)).times("1e3600").div(getDupEssenceCostDiv());
}
function getDupEssenceTargetPM() {
    const m = Decimal.mul(player.photons.matter, getDupEssenceCostDiv());
    if (Decimal.lt(m, "1e3600")) return new Decimal(0);

    let targ = Decimal.div(m, "1e3600").max(1).log("1e10").root(1.2);
    if (targ.gte(2500/45)) targ = targ.times(45).sqrt();
    return targ.times(tmp.dup.depthEff).plus(1).floor();
}

function getDupBase() {
    return Decimal.root(2, tmp.dup.depthNerf);
}

function getDupHaltStart() {
    return new Decimal("1.8e308");
}

function getDupSpeed() {
    let speed = new Decimal(0.1);
    if (hasAQUpg(55)) speed = speed.times(AQUpgEff(55));
    if (hasDupUnl(2)) speed = speed.times(Decimal.div(player.dup.essence, 2).plus(1).sqrt());
    return speed;
}

function getDuplicators() {
    const amt = Decimal.pow(tmp.dup.base, player.dup.time);
    if (amt.gte(tmp.dup.haltStart)) {
        amt = Decimal.pow(tmp.dup.base, player.dup.time.times(tmp.dup.haltStart.log(tmp.dup.base)).sqrt())
    }
    return amt;
}

function getDuplicatorGain() {
    if (tmp.dup.amount.lt(tmp.dup.haltStart)) return tmp.dup.base.pow(tmp.dup.speed);
    else return tmp.dup.base.pow(tmp.dup.speed.div(player.dup.time.sqrt().times(2)).times(tmp.dup.haltStart.log(tmp.dup.base).sqrt()))
}

function buyDupEssence() {
    if (!player.dup.unl) return;
    const cost = getDupEssenceCost();

    if (player.aq.energy.lt(cost)) return;

    player.aq.energy = player.aq.energy.sub(cost);
    player.dup.essence = player.dup.essence.plus(1);
    player.dup.totalEssence = player.dup.totalEssence.plus(1);
}

function buyDupEssencePM() {
    if (!player.dup.unl || !hasDupUnl(1)) return;
    const cost = getDupEssenceCostPM();

    if (player.photons.matter.lt(cost)) return;

    player.photons.matter = player.photons.matter.sub(cost);
    player.dup.essence = player.dup.essence.plus(1);
    player.dup.totalEssencePM = player.dup.totalEssencePM.plus(1);
}

function dupLoop(diff) {
    const mag = tmp.dup.speed.times(diff).min(player.dup.essence);
    if (player.dup.essence.gte(mag) && mag.gt(0)) {
        player.dup.essence = player.dup.essence.sub(mag);
        player.dup.time = player.dup.time.plus(mag);
    }

    for (let i=0; i<dup_effects.length; i++) {
        if (!player.dup.effects.includes(i) && dup_effects[i].unl() && tmp.dup.amount.gte(dup_effects[i].req)) {
            player.dup.effects.push(i);
        }
    }
    for (let i=0; i<dup_unlocks.length; i++) {
        if (!player.dup.unlocks.includes(i) && dup_unlocks[i].unl() && tmp.dup.amount.gte(dup_unlocks[i].req)) {
            player.dup.unlocks.push(i);
        }
    }
}

function hasDupEff(id) {
    return player.dup.effects.includes(id);
}
function hasDupUnl(id) {
    return player.dup.unlocks.includes(id);
}

function getDupDepthEff() {
    return Decimal.div(player.dup.depths, 3).plus(1)
}
function getDupDepthNerf() {
    return Decimal.div(player.dup.depths, 5).plus(1)
}
function getDupDepthReq() {
    return Decimal.pow("5e12", Decimal.pow(player.dup.depths, 1.6)).times("1e45")
}

function dupDepth(force = false) {
    updateTempDup()

    if (!force) {
        if (Decimal.lt(tmp.dup.amount, tmp.dup.dupReq) || !hasDupUnl(2)) return;

        player.dup.depths = Decimal.add(player.dup.depths, 1);
    }
    
    player.aq.energy = new Decimal(0);
    player.dup.essence = new Decimal(0);
    player.dup.totalEssence = new Decimal(0);
    player.dup.totalEssencePM = new Decimal(0);
    player.dup.time = new Decimal(0);
    player.dup.effects = [];
    ultrawaveReset(true);
}

function maxAllDupEssence() {
    if (Decimal.lt(player.dup.depths, 1)) return;

    const bulkAQ = Decimal.sub(getDupEssenceTarget(), player.dup.totalEssence).max(0);
    player.dup.essence = player.dup.essence.plus(bulkAQ);
    player.dup.totalEssence = player.dup.totalEssence.plus(bulkAQ);

    if (hasDupUnl(1)) {
        const bulkPM = Decimal.sub(getDupEssenceTargetPM(), player.dup.totalEssencePM).max(0);
        player.dup.essence = player.dup.essence.plus(bulkPM);
        player.dup.totalEssencePM = player.dup.totalEssencePM.plus(bulkPM);
    }
}