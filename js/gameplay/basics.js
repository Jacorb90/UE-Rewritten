function gameLoop(diff) {
    updateTemp();

    if (!player.begun) return;
    player.time = player.time.plus(diff)
    player.size = getSize(player.time);
    if (player.quarks.unl) quarkLoop(diff);
    if (player.hadrons.unl) hadronLoop(diff);
    if (player.autoDepths && hasAnhUpg(22)) prestige(false, true);
    if (player.autoQH && hasAnhUpg(23)) {
        buyQuarkCharge(true, true)
        boostHadrons(true, true)
    }
    if (hasAQUpg(32)) setUniverseEssence();
    if (hasAQUpg(15)) {
        const gain = AQUpgEff(15).times(tmp.anh.gain).times(diff);
        player.annihilation.energy = Decimal.add(player.annihilation.energy, gain);
        player.annihilation.total = Decimal.add(player.annihilation.total, gain)
    }
    if (player.autoUU && hasAnhUpg(26)) maxAllUniUpgs(true);
    
    if (player.void.unl) {
        if (player.void.active||hasAQUpg(33)) voidLoop(diff);
    }
    if (player.photons.unl) photonLoop(diff);
    if (player.aq.unl) AQLoop(diff);
    if (player.dup.unl) dupLoop(diff);
    if (hasDupUnl(3)) batLoop(diff);
}

function getSize(time) {
    let size = Decimal.pow(tmp.sizeBase, time);
    if (size.gte(tmp.slowdown.start)) size = size.times(tmp.slowdown.start.pow(tmp.slowdown.power.sub(1))).root(tmp.slowdown.power)
    if (size.gte(tmp.compaction.start)) size = size.div(tmp.compaction.start).log10().div(tmp.compaction.power).plus(1).root(tmp.compaction.power).times(tmp.compaction.start)
    return size;
}

function displayCompactionSizeGain() {
    let t = player.time;
    let b = tmp.sizeBase;
    let s = tmp.slowdown.start;
    let p = tmp.slowdown.power;
    let c = tmp.compaction.start;
    let w = tmp.compaction.power;
    
    if (b.pow(t).gte(s)) {
        let N1 = b.log10().times(t).sub(c.log10().times(p)).plus(s.log10().times(p.sub(1)))
        let D1 = p.times(w);
        let N2 = N1.div(D1).plus(1).pow(Decimal.div(1, w).sub(1)).times(c).times(b.log10())
        let D2 = p.times(w.pow(2))
        return N2.div(D2)
    } else {
        let N1 = b.log10().times(t).sub(c.log10())
        let N2 = N1.div(w).plus(1).pow(Decimal.pow(1, w).sub(1)).times(c).times(b.log10())
        let D2 = w.pow(2)
        return N2.div(D2)
    }
}

function getSizeBase() {
    let base = Decimal.pow(1.01, tmp.prestige.eff)
    if (player.quarks.unl) base = base.pow(tmp.qk.gluon.eff)
    if (player.annihilation.reached) base = base.pow(tmp.anh.eff)
    if (player.void.unl) base = base.pow(tmp.void.upgs[1].eff);
    if (hasAQUpg(42)) base = base.pow(AQUpgEff(42));
    return base;
}

function getUniverseSlowdownStart() {
    let start = tmp.upgs[12].eff.plus(2);
    if (player.hadrons.unl) start = start.times(tmp.had.eff);
    return start;
}

function getUniverseSlowdownPower() {
    let power = new Decimal(1);
    if (hasAQUpg(14)) power = power.div(AQUpgEff(14));
    return power.plus(1);
}
 
function getUniverseCompactionStart() {
    let start = new Decimal(120);
    if (player.photons.unl) start = start.plus(tmp.ph.col[4].eff.eff.sub(1).times(tmp.upgs[12].eff)); 
    start = start.times(tmp.upgs[33].eff);
    if (player.hadrons.unl) start = start.times(tmp.had.eff);
    if (hasAnhUpg(25)) start = start.times(2);
    if (hasAQUpg(53)) start = start.times(AQUpgEff(53))
    return start;
}