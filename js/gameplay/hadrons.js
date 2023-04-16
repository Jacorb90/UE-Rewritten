const hadrons_unl_req = new Decimal(70)

function playerHadronsData(fullReset=true) { return {
    unl: (!fullReset && hasAnhUpg(15)),
    time: new Decimal(0),
    amount: new Decimal(0),
    boosters: new Decimal(0),
}}

function unlockHadrons() {
    if (player.hadrons.unl) return;
    if (tmp.qk.gluon.size.lt(hadrons_unl_req)) return;
    player.hadrons.unl = true;
}

function hadronLoop(diff) {
    player.hadrons.time = player.hadrons.time.plus(diff);
    player.hadrons.amount = getHadrons();
}

function getHadronNerfExp() {
    let exp = .5;
    if (voidUpgActive(14)) exp = getVoidUpgTier(14)>2 ? Math.pow(exp, 1/10) : ((hasAnhUpg(31)&&getVoidUpgTier(14)>1)?Math.pow(exp, 1/3):Math.sqrt(exp));
    if (player.photons.unl) exp = Math.pow(exp, 1/tmp.ph.col[2].eff.eff.toNumber());
    return exp;
}
function getHadrons() { return tmp.had.baseGain.times(player.hadrons.time.pow(getHadronNerfExp())) }
function getHadronDispGain() { 
    let exp = getHadronNerfExp()
    return tmp.had.baseGain.times(exp).times(player.hadrons.time.pow(exp-1)) 
}

function getHadronGainMult() {
    let mult = tmp.had.boostEff2.times(tmp.upgs[32].eff);
    if (hasAnhUpg(14)) mult = mult.times(10);
    return mult;
}

function getHadronicBoostPow() {
    let pow = new Decimal(1);
    if (hasAnhUpg(12)) pow = tmp.anh.upgs[12].eff
    return pow;
}

function getHadronicBoostMag() {
    let mag = new Decimal(1);
    if (hasAQUpg(35)) mag = mag.times(AQUpgEff(35));
    return mag;
}

function getHadronicBoostCost() {
    return Decimal.pow(3, player.hadrons.boosters.div(getHadronicBoostMag()).plus(1).pow(4/3))
}

function getHadronicBoostTarget() {
    return player.hadrons.amount.max(1).log(3).pow(.75).times(getHadronicBoostMag()).floor()
}

function boostHadrons(auto=false, max=false) {
    if (!player.hadrons.unl) return;
    if (!auto) tmp.had.boostCost = getHadronicBoostCost();
    if (player.hadrons.amount.lt(tmp.had.boostCost)) return;

    let old = getUniverseEssenceGainMult();
    if (!max) {
        const mag = getHadronicBoostMag();
        player.hadrons.boosters = player.hadrons.boosters.plus(mag)
        player.hadrons.time = new Decimal(0)
        player.hadrons.amount = new Decimal(0)
        if (hasAnhUpg(11)) loadUniverseEssenceAmt(old, old.plus(mag.div(2)))
    } else {
        let t = getHadronicBoostTarget()
        let b = t.sub(player.hadrons.boosters).max(0)
        player.hadrons.boosters = player.hadrons.boosters.max(t)
        if (hasAnhUpg(11)) loadUniverseEssenceAmt(old, old.plus(b.div(2)))
    }
}

function addToHadEff() {
    let add = new Decimal(0)
    if (hasAnhUpg(16)) add = tmp.anh.upgs[16].eff
    return add;
}