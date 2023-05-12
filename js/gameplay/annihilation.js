const anhBaseReq = 18;
const anhReqDiv = 3;

function playerAnnihilationData() { return {
    reached: false,
    energy: new Decimal(0),
    total: new Decimal(0),
    upgs: [],
    activeBoosts: [],
}}

function getAnhGainExp() {
    let exp = new Decimal(1);
    if (player.photons.unl) exp = exp.plus(tmp.ph.col[0].eff.eff);
    if (hasDupUnl(3) && player.bat.bestBatteriesUnl >= 2) exp = exp.plus(tmp.bat[2].eff[3]);
    return exp;
}
function getAnhGainMult() {
    let mult = new Decimal(1);
    if (player.void.unl && tmp.void) mult = mult.times(tmp.void.upgs[3].eff);
    if (voidUpgActive(24)) mult = mult.times(tmp.anh.upgs[24].voidEff.ae);
    if (hasDupEff(1)) mult = mult.times(tmp.dup.eff[1]);
    return mult;
}
function getAnhGain() { 
    let d = player.depth;
    let base = d.sub(anhBaseReq).div(anhReqDiv)
    if (base.lt(0)) return new Decimal(0);
    else return Decimal.pow(2, base.root(1.1).times(getAnhGainExp())).times(getAnhGainMult()).floor() 
};
function getAnhNext() { 
    let next = tmp.anh.gain.plus(1).div(tmp.anh.gain.eq(0)?1:getAnhGainMult()).log2().div(getAnhGainExp()).pow(1.1).times(anhReqDiv).plus(anhBaseReq)
    return next.ceil().max(player.depth.plus(1))
};

function annihilate(force=false, auto=false) {
    if (!force) {
        if (!auto) tmp.anh.gain = getAnhGain();
        if (tmp.anh.gain.lt(1)) return;
        if (!player.annihilation.reached) {
            if (!confirm("Are you sure you wish to do this? This will reset all previous progress!")) return;
            player.annihilation.reached = true
        }
        player.annihilation.energy = player.annihilation.energy.plus(tmp.anh.gain);
        player.annihilation.total = player.annihilation.total.plus(tmp.anh.gain);
    }

    player.size = new Decimal(1)
    player.time = new Decimal(0)
    player.depth = new Decimal(0)
    player.essence = new Decimal(0)
    player.spentEssence = new Decimal(0)
    player.upgsUnl = hasAnhUpg(13)
    player.upgs = {}
    player.quarks = playerQuarksData(false)
    player.hadrons = playerHadronsData(false)

    if (!auto) {
        updateTemp();
        updateTemp();
    }
}

function getAnhBoostPow() {
    let pow = new Decimal(1);
    if (player.photons.unl) pow = tmp.ph.col[1].eff.eff;
    if (hasAnhUpg(32)) pow = pow.plus(tmp.anh.upgs[32].eff);
    return pow;
}

function getAnhBoostEff(x) {
    let power = tmp.anh.boosts.power;
    
    if (x==1) return player.depth.plus(1).log10().times(hasAnhUpg(44) ? player.aq.charge.plus(1) : 1).times(power).root(hasAnhUpg(44) ? 1 : 2);
    else if (x==2) return player.annihilation.energy.plus(1).log10().times(power).plus(1).cbrt();
    else return tmp.upgs?tmp.upgs.totalLvl.plus(1).log10().div(2).times(power).root(4):new Decimal(0)
}

function getAnhBoostLimit() { return hasAnhUpg(33)?3:(hasAnhUpg(26)?2:1) }
function canGetAnhBoost() { return player.annihilation.activeBoosts.length<getAnhBoostLimit() }

function toggleAnhBoost(x) {
    if (player.annihilation.activeBoosts.includes(x)) player.annihilation.activeBoosts = player.annihilation.activeBoosts.filter(y => y!=x);
    else if (canGetAnhBoost()) player.annihilation.activeBoosts.push(x)
    else return;

    annihilate(true);
}

const annihilation_upgs = {
    rows: 4,
    cols: 6,
    11: {
        unl() { return player.annihilation.reached },
        desc: "Bought Hadronic Boosters boost Universe Essence gain.",
        cost: new Decimal(1),
        eff() { return player.hadrons.boosters.div(2).plus(2) },
        dispEff(e) { return format(e)+"x" },

        voidDesc: "Space-Time Fabric reduces the Dimensional Depth requirement.",
        voidCost: [new Decimal(10), new Decimal(1e9), new Decimal("1e450")],
        voidEff() { return Decimal.pow(10, player.void.fabric.plus(1).log10().sqrt().times((hasAnhUpg(31)&&getVoidUpgTier(11)>1)?1.25:1).times(getVoidUpgTier(11)>2?5:1).root(getVoidUpgTier(11)>2?1:2)) },
        voidDispEff(e) { return "/"+format(e) },
        voidSize: "0.95em",
    },
    12: {
        unl() { return player.annihilation.upgs.includes(11) },
        desc: "Unspent AE strengthens Hadronic Boosters.",
        cost: new Decimal(1),
        eff() { return player.annihilation.energy.plus(1).log(5).plus(1.21).sqrt() },
        dispEff(e) { return format(e)+"x" },

        voidDesc: "Universe Essence boosts Space-Time Fabric gain.",
        voidCost: [new Decimal(32), new Decimal(1e17), new Decimal("1e500")],
        voidEff() { return player.essence.div(10).plus(1).root(getVoidUpgTier(12)>2?1:2).times((hasAnhUpg(31)&&getVoidUpgTier(12)>1)?1.25:1).times(getVoidUpgTier(12)>2?1.25:1) },
        voidDispEff(e) { return format(e)+"x" },
    },
    13: {
        unl() { return player.annihilation.upgs.includes(11) },
        desc: "Start with 3 Universal Upgrades unlocked on reset.",
        cost: new Decimal(1),
        keepVoid: true,
    },
    14: {
        unl() { return player.annihilation.upgs.length>=2 },
        desc: "The Gluon & Hadrons grow 10x as fast.",
        cost: new Decimal(2),

        voidDesc() { return "Hadrons' nerf to their own production is "+(getVoidUpgTier(14)>2 ? "90" : (hasAnhUpg(31)&&getVoidUpgTier(14)>1)?"67":"50")+"% weaker." },
        voidCost: [new Decimal(5e3), new Decimal(5e13), new Decimal("1e540")],
    },
    15: {
        unl() { return player.annihilation.upgs.includes(13) && player.annihilation.upgs.length>=3 },
        desc: "Start with Quarks, Hadrons, and all Universal Upgrades unlocked.",
        cost: new Decimal(2),
        keepVoid: true,
    },
    16: {
        unl() { return player.annihilation.upgs.length>=4 },
        desc: "Hadronic Boosters add to the Hadron effect.",
        cost: new Decimal(2),
        eff() { return player.hadrons.boosters.plus(tmp.had?tmp.had.extraBoosts:0).div(2).sqrt() },
        dispEff(e) { return "+"+format(e) },

        voidDesc: "The Gluon's effect also affects Quark gain.",
        voidCost: [new Decimal(5e3), new Decimal(1e15), new Decimal("1e570")],
    },
    21: {
        unl() { return player.annihilation.upgs.length>=5 },
        desc: "The Gluon boosts Quark gain at a reduced rate.",
        cost: new Decimal(3),
        eff() { return tmp.qk?tmp.qk.gluon.size.plus(1).log10().plus(1):new Decimal(1) },
        dispEff(e) { return format(e)+"x" },

        voidDesc: "Space-Time Fabric boosts its own gain.",
        voidCost: [new Decimal(1e4), new Decimal(1e18), new Decimal("1e600")],
        voidEff() { return player.void.fabric.plus(1).root(player.void.fabric.plus(1).log10().plus(1).root(getVoidUpgTier(21)>2?player.void.fabric.plus(1).log10().plus(1).log10().sqrt().div(100).plus(2).min(10):2).div(getVoidUpgTier(21)>2?1.5:1).div((hasAnhUpg(31)&&getVoidUpgTier(21)>1)?1.25:1)) },
        voidDispEff(e) { return format(e)+"x" },
    },
    22: {
        unl() { return player.annihilation.upgs.length>=6 },
        desc: "Automate Dimensional Depths, and Universal Upgrades do not spend Universe Essence.",
        cost: new Decimal(4),
        size: "1em",
        toggle: "autoDepths",
        keepVoid: true,
    },
    23: {
        unl() { return player.annihilation.upgs.length>=7 },
        desc: "Automate Quark Charge & Hadronic Boosts.",
        cost: new Decimal(8),
        toggle: "autoQH",
        keepVoid: true,
    },
    24: {
        unl() { return player.annihilation.upgs.length>=8 },
        desc: "Quark Charge adds to Universal Upgrade 3's effect.",
        cost: new Decimal(16),
        eff() { return player.quarks.charge.plus(1).log(50).plus(1).sqrt().sub(1).div(2) },
        dispEff(e) { return "+"+format(e) },

        voidDesc: "You get Depths in bulk, and AE & Space-Time Fabric boost each other's gain.",
        voidCost: [new Decimal(4e9), new Decimal(1.5e14), new Decimal("6.666e666")],
        voidEff() { 
            let exp = new Decimal((hasAnhUpg(31)&&getVoidUpgTier(24)>1)?1.25:1).times(getVoidUpgTier(24)>2?1.5:1);
            if (player.photons.unl) exp = exp.times(tmp.ph.col[5].eff.eff);
            return {
                ae: player.void.fabric.plus(1).log10().plus(1).pow(exp.times(getVoidUpgTier(24)>2?3:1)),
                stf: player.annihilation.energy.plus(1).log10().plus(1).pow(exp.times(2)),
            }
        },
        voidDispEff(e) { return format(e.ae)+"x AE, "+format(e.stf)+"x Fabric" },
        voidSize: "0.85em",
    },
    25: {
        unl() { return player.annihilation.upgs.length>=9 },
        desc: "Universal Compaction starts 2x later, and Dimensional Depths reset nothing.",
        cost: new Decimal(25),
        size: "1.1em",
        keepVoid: true,
    },
    26: {
        unl() { return player.annihilation.upgs.length>=10 },
        desc: "Automate Universal Upgrades, and you can activate 2 Annihilation Boosts at once.",
        cost: new Decimal(40),
        size: "1em",
        toggle: "autoUU",
        keepVoid: true,
    },
    31: {
        unl() { return player.photons.unl && player.annihilation.upgs.length>=11 },
        desc: "Void Upgrades are 25% stronger when bought twice.",
        cost: new Decimal(5e8),
        keepVoid: true,
    },
    32: {
        unl() { return player.photons.unl && player.annihilation.upgs.length>=12 },
        desc: "Space-Time Fabric strengthens Annihilation Boosts.",
        cost: new Decimal(1e10),
        eff() { return player.void.fabric.plus(1).log10().plus(1).log(5) },
        dispEff(e) { return "+"+format(e.times(100))+"%" },

        voidDesc() { return "Rebuyable Void Upgrades are "+(getVoidUpgTier(32)>2 ? "32" : ((hasAnhUpg(31)&&getVoidUpgTier(32)>1)?"25":"20"))+"% stronger." },
        voidCost: [new Decimal(1e24), new Decimal(2e37), new Decimal("6e743")],
    },
    33: {
        unl() { return player.photons.unl && player.annihilation.upgs.length>=13 },
        desc: "You can activate 3 Annihilation Boosts at once.",
        cost: new Decimal(1e12),
        keepVoid: true,
    },
    34: {
        unl() { return player.photons.unl && player.annihilation.upgs.length>=14 },
        desc: "All Universal Upgrades are cheaper based on your Dimensional Depth.",
        cost: new Decimal(2.5e14),
        eff() { return player.depth.plus(1).root(player.aq.unl?1.251:2) },
        dispEff(e) { return "/"+format(e) },
        size: "0.9em",
        
        voidDesc() { return "Quark Charge is "+(getVoidUpgTier(34)>2?"thrice as strong.":((hasAnhUpg(31)&&getVoidUpgTier(34)>1)?"150% stronger.":"twice as strong.")) },
        voidCost: [new Decimal(5e34), new Decimal(2.5e46), new Decimal("1e800")],
    },
    35: {
        unl() { return player.photons.unl && player.annihilation.upgs.length>=15 },
        desc: "Annihilation Boost I affects all Universal Upgrades.",
        cost: new Decimal(1e17),
        
        voidDesc: "The Space-Time Fabric production slowdown is weaker based on AE.",
        voidCost: [new Decimal(5e34), new Decimal(2.5e46), new Decimal("1e828")],
        voidEff() { return Decimal.sub(1, Decimal.div(1, player.annihilation.energy.plus(1).log10().plus(1).log10().times(getVoidUpgTier(35)>2?2:1).times((hasAnhUpg(31, true)&&player.void.active&&!annihilation_upgs[31].keepVoid&&getVoidUpgTier(35)>1)?.625:.5).plus(1))) },
        voidDispEff(e) { return format(e.times(100))+"% weaker" },
        voidSize: "0.9em",
    },
    36: {
        unl() { return player.photons.unl && player.annihilation.upgs.length>=16 },
        desc: "Base Photon gain is multiplied & raised to an exponent based on Total AE.",
        cost: new Decimal(5e20),
        eff() { 
            return {
                mul: Decimal.pow(10, player.annihilation.total.plus(1).log10().sqrt().div(2.25).max(2)),
                exp: player.annihilation.total.plus(1).log10().plus(1).log10().times(hasAQUpg(13)?AQUpgEff(13):1).div(2).plus(1).sqrt(),
            }
        },
        dispEff(e) { return format(e.mul)+"x, ^"+format(e.exp) },
        size: "0.75em",
        
        voidDesc: "Photonic Matter boosts Space-Time Fabric gain.",
        voidCost: [new Decimal(1e40), new Decimal(1e50), new Decimal("1e851")],
        voidEff() { return Decimal.pow(2, player.photons.matter.plus(1).log2().root(getVoidUpgTier(36)>2?1.5:2).div(2).times(getVoidUpgTier(36)>2?1.5:1).times((hasAnhUpg(31, true)&&player.void.active&&!annihilation_upgs[31].keepVoid&&getVoidUpgTier(36)>1)?1.25:1)) },
        voidDispEff(e) { return format(e)+"x" },
    },
    41: {
        unl() { return hasDupUnl(3) && player.bat.bestBatteriesUnl >= 2 && Decimal.gte(tmp.bat[2].boosts, 3) },
        desc: "Automate Void Rebuyable Upgrades, which are 5% stronger.",
        cost: new Decimal("1e20000"),
        keepVoid: true
    },
    42: {
        unl() { return hasDupUnl(3) && player.bat.bestBatteriesUnl >= 2 && Decimal.gte(tmp.bat[2].boosts, 3) },
        desc: "Triple Duplicator speed & increase Duplicator multiplier by 10% (forces Dupli-Depth reset)",
        cost: new Decimal("1e26500"),
        keepVoid: true
    },
    43: {
        unl() { return hasDupUnl(3) && player.bat.bestBatteriesUnl >= 2 && Decimal.gte(tmp.bat[2].boosts, 3) },
        desc: "Automate Wave Accelerators, which are 10% stronger.",
        cost: new Decimal("1e30888"),
        keepVoid: true
    },
    44: {
        unl() { return hasDupUnl(3) && player.bat.bestBatteriesUnl >= 2 && Decimal.gte(tmp.bat[2].boosts, 3) },
        desc: "Bought Antiquark Charge adds Quark Charge & Annihilation Boost 1 base.",
        cost: new Decimal("1e35500"),
        keepVoid: true
    },
    45: {
        unl() { return hasDupUnl(3) && player.bat.bestBatteriesUnl >= 2 && Decimal.gte(tmp.bat[2].boosts, 3) },
        desc: "Automate Photon Generators, and all Photon effects are 5% stronger.",
        cost: new Decimal("1e37350"),
        keepVoid: true
    },
    46: {
        unl() { return hasDupUnl(3) && player.bat.bestBatteriesUnl >= 2 && Decimal.gte(tmp.bat[2].boosts, 3) },
        desc: "Boost Battery Fluid gain based on Annihilation Energy.",
        cost: new Decimal("1e42275"),
        eff() { return Decimal.add(player.annihilation.energy, 1).log10().div(1e3).plus(1).sqrt() },
        dispEff(e) { return format(e) + "x" },
        keepVoid: true
    }
}

const void_anh_upgs = Object.keys(annihilation_upgs).filter(x => (x!="rows"&&x!="cols")&&!annihilation_upgs[x].keepVoid)
const void_anh_upg_rows = Math.ceil(void_anh_upgs.length/6)

function hasAnhUpg(id, noVoidSwitchCheck=false) { 
    return player.annihilation.upgs.includes(id) && (tmp.anh?.upgs && (noVoidSwitchCheck||(!tmp.anh.upgs[id].voidSwitch))) 
};

function buyAnnihilationUpg(id) {
    let data = annihilation_upgs[id];
    if (player.void.active && !data.keepVoid) {
        if (player.void.fabric.lt(data.voidCost[player.void.upgs[id]||0])) return;
        if ((player.void.upgs[id]||0)>=getVoidUpgMaxTier()) return;
        player.void.fabric = player.void.fabric.sub(data.voidCost[player.void.upgs[id]||0]);
        player.void.upgs[id] = Math.min((player.void.upgs[id]||0)+1, getVoidUpgMaxTier());
    } else {
        if (player.annihilation.upgs.includes(id)) return;
        let old = getUniverseEssenceGainMult()
        if (player.annihilation.energy.lt(data.cost)) return;
        player.annihilation.energy = player.annihilation.energy.sub(data.cost);
        player.annihilation.upgs.push(id);

        if (id==11) loadUniverseEssenceAmt(old, getUniverseEssenceGainMult());
        if (id==13) player.upgsUnl = true;
        if (id==15) {
            player.quarks.unl = true;
            player.hadrons.unl = true;
        }
        if (id==16) {
            player.essence = player.essence.plus(player.spentEssence)
            player.spentEssence = new Decimal(0)
        }
        if (id==42) {
            dupDepth(true);
        }
    }
}