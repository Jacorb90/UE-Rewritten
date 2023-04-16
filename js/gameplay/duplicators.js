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
        req: new Decimal("1e7777777"),
        desc: "Unlock ??? (PLACEHOLDER, will unlock at 1e45 Duplicators)."
    }
]

function playerDupData() { return {
    unl: false,
    essence: new Decimal(0),
    totalEssence: new Decimal(0),
    totalEssencePM: new Decimal(0),
    time: new Decimal(0),
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

function getDupEssenceCost() {
    let ess = player.dup.totalEssence;
    if (ess.gte(40)) ess = ess.pow(2).div(20);
    return Decimal.pow(1.1, Decimal.pow(ess, 1.2)).times(1e22);
}

function getDupEssenceCostPM() {
    let ess = player.dup.totalEssencePM;
    if (ess.gte(50)) ess = ess.pow(2).div(45);
    return Decimal.pow("1e10", Decimal.pow(ess, 1.2)).times("1e3600");
}

function getDupBase() {
    return new Decimal(2);
}

function getDupHaltStart() {
    return new Decimal("1.8e308");
}

function getDupSpeed() {
    let speed = new Decimal(0.1);
    if (hasAQUpg(55)) speed = speed.times(AQUpgEff(55));
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