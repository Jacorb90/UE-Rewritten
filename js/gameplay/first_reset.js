const universe_upgs_unl_req = new Decimal(7)
const universe_upgs = {
    rows: 4,
    cols: 3,
    rowUnls: {
        1: {
            desc: "Unlock Universal Upgrades",
            unl() { return player.upgsUnl },
        },
        2: {
            desc: "Unlock Quarks",
            unl() { return player.quarks.unl },
        },
        3: {
            desc: "Unlock Hadrons",
            unl() { return player.hadrons.unl },
        },
        4: {
            desc: "Reach 4 Hadronic Boosters",
            unl() { return player.hadrons.boosters.gte(4)||hasAnhUpg(15) },
        },
    },
    11: {
        unl() { return player.upgsUnl },
        desc: "Dimensional Depths lower their goal.",
        extra() { return tmp.upgs.addNine },
        cost(l) { return l.div(3).plus(1).pow(2).floor() },
        target(r) { return r.sqrt().sub(1).times(3).plus(1).max(0).floor() },
        eff(l) { return player.depth.plus(1).log(Decimal.root(10, tmp.upgs[43].eff).max(2)).times(l).times(tmp.upgs[43].eff).plus(1).sqrt().sub(1) },
        dispEff(e) { return "-"+format(e)+" depths" },
    }, 
    12: {
        unl() { return player.upgsUnl },
        desc() { return "Universal Slowdown starts "+format(tmp.upgs[23].eff.plus(0.2))+"m<sup>3</sup> later." },
        extra() { return tmp.upgs.addNine },
        cost(l) { return l.div(2.5).plus(1).pow(2.1).plus(1).floor() },
        target(r) { return r.sub(1).max(0).root(2.1).sub(1).times(2.5).plus(1).max(0).floor() },
        eff(l) { return l.times(Decimal.add(.2, tmp.upgs[23].eff)) },
        dispEff(e) { return format(e)+"m<sup>3</sup> later" },
    },
    13: {
        unl() { return player.upgsUnl },
        desc: "Improve the Dimensional Depth effect.",
        extra() { return tmp.upgs[42].eff.plus(tmp.upgs.addNine) },
        cost(l) { return l.div(2).plus(1).pow(2.2).plus(2).floor() },
        target(r) { return r.sub(2).max(0).root(2.2).sub(1).times(2).plus(1).max(0).floor() },
        eff(l) { 
            let e = l.plus(1).root(20).plus(l.plus(1).log10());
            if (hasAnhUpg(24)) e = e.plus(tmp.anh.upgs[24].eff);
            return e;
        },
        dispEff(e) { return "^"+format(e) },
    },
    21: {
        unl() { return player.quarks.unl },
        desc: "Add 10% to the Quark Charge effect.",
        extra() { return tmp.upgs.addNine },
        cost(l) { return l.div(1.5).plus(1).pow(2.3).plus(3).floor() },
        target(r) { return r.sub(3).max(0).root(2.3).sub(1).times(1.5).plus(1).max(0).floor() },
        eff(l) { return l.div(10).plus(1) },
        dispEff(e) { return "+"+format(e.sub(1).times(100))+"%" },
    },
    22: {
        unl() { return player.quarks.unl },
        desc: "The Gluon grows 50% faster.",
        extra() { return tmp.upgs.addNine },
        cost(l) { return l.plus(1).pow(2.4).plus(4).floor() },
        target(r) { return r.sub(4).max(0).root(2.4).sub(1).plus(1).max(0).floor() },
        eff(l) { return Decimal.pow(1.5, l) },
        dispEff(e) { return format(e.sub(1).times(100))+"% faster" },
    },
    23: {
        unl() { return player.quarks.unl },
        desc: "Total Quarks add to Universe Upgrade 2's base.",
        extra() { return tmp.upgs.addNine },
        cost(l) { return l.times(1.5).plus(1).pow(2.5).plus(5).floor() },
        target(r) { return r.sub(5).max(0).root(2.5).sub(1).div(1.5).plus(1).max(0).floor() },
        eff(l) { return tmp.qk?(tmp.qk.net.plus(1).log10().div(5).times(l)):new Decimal(0) },
        dispEff(e) { return "+"+format(e) },
    },
    31: {
        unl() { return player.hadrons.unl },
        desc: "The Gluon's effect is stronger based on your Hadrons.",
        extra() { return tmp.upgs.addNine },
        cost(l) { return l.times(2).plus(1).pow(2.6).plus(6).floor() },
        target(r) { return r.sub(6).max(0).root(2.6).sub(1).div(2).plus(1).max(0).floor() },
        eff(l) { 
            let pow = player.hadrons.amount.plus(1).log10().div(4).times(l).plus(1);
            return {
                mul: pow.max(3.5).sub(2.5).log(4).plus(1),
                pow: pow.min(3.5),
            }
        },
        dispEff(e) { return "^"+format(e.pow)+(e.mul.gt(1)?(", x"+format(e.mul)):"") },
    },
    32: {
        unl() { return player.hadrons.unl },
        desc: "The Gluon boosts Hadron gain",
        extra() { return tmp.upgs.addNine },
        cost(l) { return l.times(2.5).plus(1).pow(2.7).plus(7).floor() },
        target(r) { return r.sub(7).max(0).root(2.7).sub(1).div(2.5).plus(1).max(0).floor() },
        eff(l) { return tmp.qk?(tmp.qk.gluon.size.plus(1).log10().times(l).plus(1).pow(l.plus(1).log2().cbrt())):new Decimal(0) },
        dispEff(e) { return format(e)+"x" },
    },
    33: {
        unl() { return player.hadrons.unl },
        desc: "Universal Compaction starts later.",
        extra() { return tmp.upgs.addNine },
        cost(l) { return l.times(3).plus(1).pow(2.8).plus(8).floor() },
        target(r) { return r.sub(8).max(0).root(2.8).sub(1).div(3).plus(1).max(0).floor() },
        eff(l) { return l.plus(1).log10().plus(1) },
        dispEff(e) { return format(e)+"x later" },
    },
    41: {
        unl() { return player.hadrons.boosters.gte(4)||hasAnhUpg(15) },
        desc: "Red Quarks cheapen Quark Charge.",
        cost(l) { return l.times(3.5).plus(1).pow(2.9).plus(9).floor() },
        target(r) { return r.sub(9).max(0).root(2.9).sub(1).div(3.5).plus(1).max(0).floor() },
        eff(l) { return player.quarks.red.plus(1).log10().plus(1).pow(l) },
        dispEff(e) { return "/"+format(e) },
    },
    42: {
        unl() { return player.hadrons.boosters.gte(4)||hasAnhUpg(15) },
        desc: "Green Quarks give free levels to Universe Upgrade 3.",
        cost(l) { return l.times(4).plus(1).pow(3).plus(10).floor() },
        target(r) { return r.sub(10).max(0).cbrt().sub(1).div(4).plus(1).max(0).floor() },
        eff(l) { return player.quarks.green.plus(1).log10().plus(1).log2().times(l) },
        dispEff(e) { return "+"+format(e) },
    },
    43: {
        unl() { return player.hadrons.boosters.gte(4)||hasAnhUpg(15) },
        desc: "Blue Quarks strengthen Universe Upgrade 1.",
        cost(l) { return l.times(4.5).plus(1).pow(3.1).plus(11).floor() },
        target(r) { return r.sub(11).max(0).root(3.1).sub(1).div(4.5).plus(1).max(0).floor() },
        eff(l) { 
            let eff = player.quarks.blue.plus(1).log10().plus(1).log10().div(1.5).times(l).plus(1);
            if (eff.gte(1.5)) eff = eff.plus(8.5).log10().plus(.5);
            return eff;
        },
        dispEff(e) { return format(e.sub(1).times(100))+"% stronger" },
    },
}

function getPrestigeReq() { return Decimal.pow(1.05, player.depth.sub(tmp.upgs[11].eff).div(3).plus(1).pow(3).plus(1)) }

function prestige(force=false, auto=false) {
    if (!force) {
        if (!auto) tmp.prestige.req = getPrestigeReq();
        if (player.size.lt(tmp.prestige.req)) return;
        player.depth = player.depth.plus(1);
        player.essence = player.essence.plus(player.depth.times(getUniverseEssenceGainMult()));
    }

    if (!hasAnhUpg(25)) {
        player.size = new Decimal(1)
        player.time = new Decimal(0)
        player.hadrons.time = new Decimal(0)
        player.hadrons.amount = new Decimal(0)
    }

    if (!auto) updateTemp();
}

function getUniverseEssenceGainMult() {
    let mult = new Decimal(1);
    if (hasAnhUpg(11)) mult = mult.times(tmp.anh.upgs[11].eff);
    return mult;
}

function loadUniverseEssenceAmt(old, n) {
    if (hasAnhUpg(22)) player.essence = player.essence.div(old).times(n)
    else player.essence = player.essence.plus(player.spentEssence).div(old).times(n).sub(player.spentEssence)
}

function getDepthEff() { return player.depth.times(3).cbrt().plus(1).pow(tmp.upgs[13].eff) }

function unlockUniversalUpgs() {
    if (player.upgsUnl) return;
    if (player.essence.lt(universe_upgs_unl_req)) return;
    player.essence = player.essence.sub(universe_upgs_unl_req);
    player.upgsUnl = true;
}

function buyUniverseUpg(x, auto=false, max=false) {
    if (!player.upgsUnl && !max) return;
    if (!universe_upgs[x].unl()) return;

    if (!auto) tmp.upgs[x].lvl = player.upgs[x]||new Decimal(0)
    let cost = adjustUniUpgCost(universe_upgs[x].cost(tmp.upgs[x].lvl))
    if (player.essence.lt(cost)) return;
    if (!hasAnhUpg(22)) {
        player.essence = player.essence.sub(cost);
        player.spentEssence = player.spentEssence.plus(cost);
    }
    if (max) {
        player.upgs[x] = Decimal.max(player.upgs[x]||0, universe_upgs[x].target(adjustUniUpgCost(player.essence, true)))
    } else player.upgs[x] = Decimal.add(player.upgs[x]||0, 1);
}

function respecUniverseUpgs() {
    if (!player.upgsUnl) return
    if (Object.keys(player.upgs).length==0) return
    if (!confirm("Are you sure you want to respec your Universal Upgrades for Universe Essence? This will also reset your Universe's size!")) return;

    player.essence = player.essence.plus(player.spentEssence)
    player.spentEssence = new Decimal(0)
    player.upgs = {};
    prestige(true)
}

function maxAllUniUpgs(auto=false) {
    if (!player.upgsUnl) return;
    if (!auto && !hasAnhUpg(22)) return;
    for (let r=1;r<=universe_upgs.rows;r++) for (let c=1;c<=universe_upgs.cols;c++) {
        let id = r*10+c;
        buyUniverseUpg(id, auto, true);
        buyUniverseUpg(id, auto);
    }
}

function adjustUniUpgCost(x, rev=false) {
    if (rev) {
        if (x.gte(250)) x = x.plus(375).times(100).sqrt()
    } else {
        if (x.gte(250)) x = x.pow(2).div(100).sub(375)
    }

    return x;
}