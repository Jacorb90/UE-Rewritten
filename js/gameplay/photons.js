const photons_unl = new Decimal(1e16);
const photon_data = [
    {
        unl() { return player.photons.unl },
        color: "Red",
        id: "r",
        eff(p, power) { return {
            eff: p.plus(1).log10().div(2).cbrt().div(8).times(power),
            prod: p.times(power).plus(1),
        }},
        dispEff(e) { return "Increases the AE gain exponent by "+format(e) },
        dispProd(e) { return "Multiplies Photonic Matter production by "+format(e) },
        genCostStart: new Decimal(1),
        genCostBase: new Decimal(2),
        genCostExp: new Decimal(1.1),
    },
    {
        unl() { return player.photons.colors[0].gen.gte(1) },
        color: "Orange",
        id: "or",
        eff(p, power) { return {
            eff: p.plus(1).log10().plus(1).log(5).times(power).plus(1),
            prod: p.times(power).plus(1),
        }},
        dispEff(e) { return "Strengthens Annihilation Boosts by "+format(e.sub(1).times(100))+"%" },
        dispProd(e) { return "Multiplies Red Photon production by "+format(e) },
        genCostStart: new Decimal(100),
        genCostBase: new Decimal(3),
        genCostExp: new Decimal(1.2),
    },
    {
        unl() { return player.photons.colors[1].gen.gte(1) },
        color: "Yellow",
        id: "ylw",
        eff(p, power) { return {
            eff: p.plus(1).log10().plus(1).log(4).times(power).plus(1),
            prod: p.times(power).plus(1),
        }},
        dispEff(e) { return "Hadrons' nerf to their own production is "+format(e)+"x weaker" },
        dispProd(e) { return "Multiplies Orange Photon production by "+format(e) },
        genCostStart: new Decimal(1e4),
        genCostBase: new Decimal(4),
        genCostExp: new Decimal(1.3),
    },
    {
        unl() { return player.photons.colors[2].gen.gte(1) },
        color: "Green",
        id: "gr",
        eff(p, power) { 
            let e = p.plus(1).log10().plus(1).log(3).times(power).plus(1);
            if (e.gte(2.25)) e = e.log(2.25).sqrt().plus(1.25)
            return {
                eff: e,
                prod: p.times(power).plus(1),
            }
        },
        dispEff(e) { return "Improves the Green Quark effect by "+format(e.sub(1).times(100))+"%" },
        dispProd(e) { return "Multiplies Yellow Photon production by "+format(e) },
        genCostStart: new Decimal(1e5),
        genCostBase: new Decimal(5),
        genCostExp: new Decimal(1.4),
    },
    {
        unl() { return player.photons.colors[3].gen.gte(1) },
        color: "Blue",
        id: "bl",
        eff(p, power) { return {
            eff: Decimal.sub(2, Decimal.div(1, p.plus(1).log10().plus(1).log10().div(3).times(power).plus(1).sqrt())),
            prod: p.times(power).plus(1),
        }},
        dispEff(e) { return "Makes Universe Upgrade 2 also make Universal Compaction's base start later at "+format(e.sub(1).times(100))+"% power ("+format(tmp.upgs[12].eff.times(e.sub(1)))+" m<sup>3</sup> later)" },
        dispProd(e) { return "Multiplies Green Photon production by "+format(e) },
        genCostStart: new Decimal(1e6),
        genCostBase: new Decimal(6),
        genCostExp: new Decimal(1.5),
    },
    {
        unl() { return player.photons.colors[4].gen.gte(1) },
        color: "Purple",
        id: "pur",
        eff(p, power) { return {
            eff: p.plus(1).log2().plus(1).log2().times(power).plus(1).sqrt(),
            prod: p.times(power).plus(1),
        }},
        dispEff(e) { return "Raises AE & Space-Time Fabric's boost to each other's gain ^"+format(e) },
        dispProd(e) { return "Multiplies Blue Photon production by "+format(e) },
        genCostStart: new Decimal(1e7),
        genCostBase: new Decimal(7),
        genCostExp: new Decimal(1.6),
    },
    {
        unl() { return player.photons.colors[5].gen.gte(1) },
        color: "Ultraviolet",
        id: "uv",
        eff(p, power) { return {
            eff: hasAQUpg(33)?p.pow(AQUpgEff(33).times(power)).root(5).div(1e6):new Decimal(0),
            prod: p.times(10).times(power).plus(1),
        }},
        dispEff(e) { return "Gain "+format(e.times(100))+"% of Space-Time Fabric gain outside of The Void each second" },
        dispProd(e) { return "Multiplies the production of all previous Photon types by "+format(e) },
        genCostStart: new Decimal(1e18),
        genCostBase: new Decimal(10),
        genCostExp: new Decimal(1.8),
    },
    {
        unl() { return hasAQUpg(43) },
        color: "X-Ray",
        id: "x",
        eff(p, power) { return {
            eff: p.plus(1).log10().times(tmp.aq?AQUpgEff(43):0).times(power).plus(1).log10(),
            prod: p.times(AQUpgEff(43)).times(power).plus(1),
        }},
        dispEff(e) { return "Adds "+format(e)+" extra Hadronic Boosters & Void Rebuyable Upgrades" },
        dispProd(e) { return "Multiplies the production of UV Photons by "+format(e) },
        genCostStart: new Decimal(1e207),
        genCostBase: new Decimal(1e3),
        genCostExp: new Decimal(2),
    },
]

function playerPhotonsData() { return {
    unl: false,
    matter: new Decimal(0),
    colors: [
        { amt: new Decimal(0), gen: new Decimal(0) }, // red
        { amt: new Decimal(0), gen: new Decimal(0) }, // orange
        { amt: new Decimal(0), gen: new Decimal(0) }, // yellow
        { amt: new Decimal(0), gen: new Decimal(0) }, // green
        { amt: new Decimal(0), gen: new Decimal(0) }, // blue
        { amt: new Decimal(0), gen: new Decimal(0) }, // purple
        { amt: new Decimal(0), gen: new Decimal(0) }, // UV
        { amt: new Decimal(0), gen: new Decimal(0) }, // X-Ray
        { amt: new Decimal(0), gen: new Decimal(0) }, // Gamma
    ],
    ultra: new Decimal(0),
    uwi: [null, new Decimal(0), new Decimal(0), new Decimal(0)],
}}

function unlockPhotons() {
    if (player.photons.unl) return;
    if (!player.void.unl) return;
    if (player.void.fabric.lt(photons_unl)) return;
    player.void.fabric = player.void.fabric.sub(photons_unl);
    player.photons.unl = true;
}

function getPhotonicMatterGainMult() {
    let mult = new Decimal(1);
    if (player.aq.unl) mult = mult.times(tmp.aq.gluon.eff);
    if (hasDupEff(2)) mult = mult.times(tmp.dup.eff[2]);
    return mult;
}

function getPhotonicMatterGain() {
    let base = player.void.fabric.div(photons_unl).sqrt()
    let scs = tmp.ph.col[0].eff.prod.sqrt().times(100)
    if (base.gte(scs)) base = Decimal.pow(scs, base.log(scs).sqrt());
    return base.times(tmp.ph.col[0].eff.prod).times(getPhotonicMatterGainMult());
}

function photonLoop(diff) {
    player.photons.matter = player.photons.matter.plus(tmp.ph.gain.times(diff));
    for (let i=0;i<photon_data.length;i++) if (photon_data[i].unl()) player.photons.colors[i].amt = player.photons.colors[i].amt.plus(tmp.ph.col[i].gain.times(tmp.ph.phMul).times(diff));
}

function getPhotonGain(x) {
    let gain = tmp.ph.col[x].genEff;
    if (x<6 && tmp.ph.col[6]) gain = gain.times(tmp.ph.col[6].eff.prod);
    if (x!=5 && tmp.ph.col[x+1]) gain = gain.times(tmp.ph.col[x+1].eff.prod);
    if (x<6 && hasAQUpg(24)) gain = gain.times(AQUpgEff(24));
    if (x<(hasAQUpg(44)?7:6) && hasAQUpg(43)) gain = gain.times(tmp.ph.uw[1]);
    return gain;
}

function getPhotonGainMult() {
    let mult = new Decimal(1);
    if (hasDupEff(2)) mult = mult.times(tmp.dup.eff[2]);
    return mult;
}

function getPhotonGenCost(x) {
    let data = photon_data[x];
    let l = player.photons.colors[x].gen;
    let cost = data.genCostStart.times(data.genCostBase.pow(l.pow(data.genCostExp||1)));
    if (hasAQUpg(22)) cost = cost.div(AQUpgEff(22));
    return cost;
}

function getPhotonGenTarg(x) {
    let data = photon_data[x];
    let r = player.photons.matter;
    if (hasAQUpg(22)) r = r.times(AQUpgEff(22));

    if (r.lt(data.genCostStart)) return new Decimal(0);
    return r.div(data.genCostStart).max(1).log(data.genCostBase).root(data.genCostExp||1).plus(1).floor()
}

function buyPhotonGen(x, auto=false) {
    if (!player.photons.unl) return;
    if (!auto) tmp.ph.col[x].genCost = getPhotonGenCost(x);
    let data = tmp.ph.col[x];
    if (player.photons.matter.lt(data.genCost)) return;
    player.photons.matter = player.photons.matter.sub(data.genCost);
    player.photons.colors[x].gen = player.photons.colors[x].gen.plus(1);
}

function getPhotonGenEff(x) {
    let eff = player.photons.colors[x].gen.div((x+1)*10);
    if (tmp.anh && hasAnhUpg(36)) eff = eff.times(tmp.anh.upgs[36].eff.mul).pow(tmp.anh.upgs[36].eff.exp)
    if (x<(hasAQUpg(44)?7:6) && hasAQUpg(43)) eff = eff.pow(tmp.ph.uw[3]);
    return eff;
}

function maxAllPhotonGens() {
    if (!player.photons.unl || !player.aq.unl) return;
    for (let i=0;i<photon_data.length;i++) if (photon_data[i].unl()) player.photons.colors[i].gen = player.photons.colors[i].gen.max(getPhotonGenTarg(i))
}

function getTotalUltrawaves() {
    let total = player.photons.ultra;
    for (let i=1;i<=3;i++) total = total.plus(player.photons.uwi[i])
    return total;
}
function getUltrawaveGainMult() {
    let mult = new Decimal(1);
    return mult;
}
function getUltrawaveCostDiv() {
    let div = new Decimal(1);
    if (hasDupEff(4)) div = div.times(tmp.dup.eff[4]);
    return div;
}
function getUltrawaveGain() {
    if (!hasAQUpg(43)) return new Decimal(0);
    if (player.photons.matter.lt(Number.MAX_VALUE)) return new Decimal(0);
    return player.photons.matter.times(getUltrawaveCostDiv()).div(Number.MAX_VALUE).log(1e7).plus(1).sqrt().times(getUltrawaveGainMult()).floor().sub(getTotalUltrawaves()).max(0)
}
function getUltrawaveNext() { return Decimal.pow(1e7, getUltrawaveGain().plus(getTotalUltrawaves()).plus(1).div(getUltrawaveGainMult()).pow(2).sub(1)).times(Number.MAX_VALUE).div(getUltrawaveCostDiv()) }

function ultrawaveReset(force=false) {
    if (!force) {
        if (!player.photons.unl) return;
        if (!hasAQUpg(43)) return;
        let gain = getUltrawaveGain();
        if (gain.lt(1)) return;
        player.photons.ultra = player.photons.ultra.plus(gain);
    }

    for (let i=0;i<6;i++) player.photons.colors[i] = {amt: new Decimal(0), gen: new Decimal(0)};
    player.photons.matter = new Decimal(0);
    
    annihilate(true);
}

function getWaveAccelPower() {
    let power = new Decimal(1);
    if (hasAQUpg(25)) power = power.times(AQUpgEff(25));
    return power;
}

function getWaveAccelEff(x) {
    let a = player.photons.uwi[x].times(AQUpgEff(43).plus(1).log10()).times(tmp.ph.uwp);
    if (x==1) return Decimal.pow(20, a);
    else if (x==2) return a.plus(1).log10().plus(1).sqrt();
    else return a.div(20).plus(1);
}

function getPhotonColorPower(x) {
    let power = new Decimal(1);
    if (x<(hasAQUpg(44)?7:6) && hasAQUpg(43)) power = power.times(tmp.ph.uw[2]);
    if (hasAQUpg(51)) power = power.times(AQUpgEff(51));
    return power;
}

function buyWaveAcc(x) {
    if (!player.photons.unl) return;
    if (!hasAQUpg(43)) return;
    if (player.photons.ultra.lt(1)) return;
    if (minAllWaveAcc().lt(player.photons.uwi[x])) return;
    player.photons.ultra = player.photons.ultra.sub(1);
    player.photons.uwi[x] = player.photons.uwi[x].plus(1);
}

function respecWaveAcc() {
    if (!player.photons.unl) return;
    if (!hasAQUpg(43)) return;
    let t = totalWaveAcc();
    if (t.eq(0)) return;
    if (!confirm("Warning: This will force an Ultrawave reset!")) return;
    player.photons.ultra = player.photons.ultra.plus(t);
    for (let i=1;i<=3;i++) player.photons.uwi[i] = new Decimal(0);
    ultrawaveReset(true);
}

function minAllWaveAcc() { return player.photons.uwi[1].min(player.photons.uwi[2]).min(player.photons.uwi[3]) }
function totalWaveAcc() { return player.photons.uwi[1].plus(player.photons.uwi[2]).plus(player.photons.uwi[3]) }