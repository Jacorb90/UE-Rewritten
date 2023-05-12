function updateTemp() {
    updateTempBat();
    updateTempDup();
    updateTempAQ();
    updateTempPhotons();
    updateTempAnnihilation();
    updateTempVoid();
    updateTempUniverseUpgs();
    updateTempHadrons();
    updateTempQuarks();
    updateTempPrestige();

    tmp.sizeBase = getSizeBase();
    tmp.slowdown = {
        start: getUniverseSlowdownStart(),
        power: getUniverseSlowdownPower(),
    }
    tmp.compaction = {
        start: getUniverseCompactionStart(),
        power: new Decimal(2),
    }
}

function updateTempPrestige() {
    tmp.prestige = {
        req: getPrestigeReq(),
        eff: getDepthEff(),
    }
}

function updateTempUU(id) {
    var data = { lvl: player.upgs[id]||new Decimal(0) };
    tmp.upgs[id] = data;
    data.extra = universe_upgs[id].extra?universe_upgs[id].extra():new Decimal(0)
    data.effL = universe_upgs[id].unl()?data.lvl.plus(data.extra):new Decimal(0);
    data.cost = adjustUniUpgCost(universe_upgs[id].cost(data.lvl));
    data.eff = universe_upgs[id].eff(data.effL);
    tmp.upgs.totalLvl = tmp.upgs.totalLvl.plus(data.effL);
}

function updateTempUniverseUpgs() {
    tmp.upgs = {};
    tmp.upgs.totalLvl = new Decimal(0)
    tmp.upgs.addNine = player.annihilation.activeBoosts.includes(1) ? tmp.anh.boosts[1] : new Decimal(0)
    for (let r=universe_upgs.rows;r>=1;r--) for (let c=universe_upgs.cols;c>=1;c--) updateTempUU(r*10+c);
    tmp.upgs.rowsUnl = Object.values(universe_upgs.rowUnls).filter(x => x.unl()).length;
}

function updateTempQuarks() {
    tmp.qk = {
        eff: {
            addedCharge: tmp.upgs[21].eff,
            multiplyExp: player.annihilation.activeBoosts.includes(2) ? tmp.anh.boosts[2] : new Decimal(1),
        },
        net: player.quarks.red.plus(player.quarks.blue).plus(player.quarks.green),
        chargeCost: getQuarkChargeCost(),
    }

    tmp.qk.eff.charge = getQuarkChargeEff();

    tmp.qk.eff.red = softcapQKAmt(player.quarks.red).plus(1).log10().plus(1).pow(getQuarkEffExp("r")).div(20)
    tmp.qk.eff.green = softcapQKAmt(player.quarks.green).plus(1).log10().plus(1).pow(getQuarkEffExp("g")).div(30)
    tmp.qk.eff.blue = softcapQKAmt(player.quarks.blue).plus(1).log10().plus(1).pow(getQuarkEffExp("b")).div(10)

    tmp.qk.gain = { mult: getGlobalQKGainMult() };
    tmp.qk.gain.red = getQuarkGain("red").times(tmp.qk.gain.mult)
    tmp.qk.gain.green = getQuarkGain("green").times(tmp.qk.gain.mult)
    tmp.qk.gain.blue = getQuarkGain("blue").times(tmp.qk.gain.mult)

    tmp.qk.gluon = {
        size: getGluonSizeRatio().times(getGluonProportionSize()),
    }
    tmp.qk.gluon.eff = getGluonEff()
    tmp.glu = tmp.qk.gluon.eff;
}

function updateTempHadrons() {
    tmp.had = {
        baseGain: new Decimal(1),
        eff: player.hadrons.amount.plus(1).log(5).times(hasAQUpg(31)?AQUpgEff(31):1).plus(1).root(1.5).plus(addToHadEff()),
        boostCost: getHadronicBoostCost(),
        boostPow: getHadronicBoostPow(),
        extraBoosts: Decimal.add(player.annihilation.activeBoosts.includes(3)?tmp.anh.boosts[3]:0, (tmp.aq&&tmp.ph&&hasAQUpg(43))?tmp.ph.col[7].eff.eff:0),
    }
    tmp.had.boostEff = player.hadrons.boosters.plus(tmp.had.extraBoosts).times(tmp.had.boostPow).plus(1).cbrt();
    let b = player.hadrons.boosters.plus(tmp.had.extraBoosts);
    if (b.gte(2e5)) b = b.times(2e5).sqrt();
    tmp.had.boostEff2 = Decimal.pow(2, b.times(tmp.had.boostPow));
    tmp.had.baseGain = tmp.had.baseGain.times(getHadronGainMult())
    tmp.had.dispGain = getHadronDispGain()
}

function updateTempAnnihilation() {
    tmp.anh = {};
    tmp.anh.upgs = {};
    for (let r=annihilation_upgs.rows;r>=1;r--) for (let c=annihilation_upgs.cols;c>=1;c--) {
        let id = r*10+c;
        if (!annihilation_upgs[id]) continue;
        tmp.anh.upgs[id] = {};
        if (annihilation_upgs[id].eff) tmp.anh.upgs[id].eff = annihilation_upgs[id].eff();
        tmp.anh.upgs[id].voidSwitch = player.void.active && !annihilation_upgs[id].keepVoid
        if (annihilation_upgs[id].voidEff) tmp.anh.upgs[id].voidEff = annihilation_upgs[id].voidEff()
    }
    tmp.anh.gain = getAnhGain();
    tmp.anh.next = getAnhNext();
    tmp.anh.eff = player.size.max(1).log10().plus(1).pow(hasAQUpg(45) ? player.annihilation.total.plus(1).log10().plus(1).log10().plus(1) : 1).times(player.annihilation.total).plus(1).log10().plus(1).pow(Decimal.add(2, hasAQUpg(45) ? player.annihilation.total.plus(1).log10().plus(1).log10() : 0));
    tmp.anh.boosts = {};
    tmp.anh.boosts.can = canGetAnhBoost();
    tmp.anh.boosts.power = getAnhBoostPow();
    for (let i=1;i<=3;i++) tmp.anh.boosts[i] = getAnhBoostEff(i);
}

function updateTempVoid() {
    tmp.void = {};
    tmp.void.upgs = {};
    tmp.void.upgs.power = getVoidRepUpgPower();
    tmp.void.upgs.extra = getExtraVoidRepUpgs();
    for (let id=1;id<=void_rep_upgs.amt;id++) {
        var data = { lvl: player.void.repUpgs[id]||new Decimal(0) };
        tmp.void.upgs[id] = data;
        data.effL = data.lvl.plus(tmp.void.upgs.extra);
        data.cost = void_rep_upgs[id].cost(data.lvl);
        data.eff = void_rep_upgs[id].eff(data.effL.times(tmp.void.upgs.power));
    }
    tmp.void.stGain = getSTFabricGain();
}

function updateTempPhotons() {
    tmp.ph = {};
    tmp.ph.tgl = new Decimal(0);
    tmp.ph.uwt = getTotalUltrawaves();
    tmp.ph.uwp = getWaveAccelPower();
    tmp.ph.uw = {};
    tmp.ph.uwe = {};
    for (let i=1;i<=3;i++) {
        tmp.ph.uwe[i] = getExtraWaveAccels(i);
        tmp.ph.uw[i] = getWaveAccelEff(i);
    }
    tmp.ph.phMul = getPhotonGainMult();
    tmp.ph.col = {};
    for (let id=photon_data.length-1;id>=0;id--) {
        tmp.ph.col[id] = {};
        tmp.ph.col[id].genEff = getPhotonGenEff(id)
        tmp.ph.col[id].gain = getPhotonGain(id)
        tmp.ph.col[id].power = getPhotonColorPower(id);
        tmp.ph.col[id].eff = photon_data[id].eff(photon_data[id].unl()?player.photons.colors[id].amt:new Decimal(0), tmp.ph.col[id].power);
        tmp.ph.col[id].genCost = getPhotonGenCost(id)
        tmp.ph.tgl = tmp.ph.tgl.plus(player.photons.colors[id].gen)
    }
    tmp.ph.gain = getPhotonicMatterGain();
    tmp.ph.preX = hasAQUpg(44)?"X-Ray":"UV"
}

function updateTempAQ() {
    tmp.aq = { upgs: { power: getAQUpgPower() } };
    for (let r=1;r<=aq_upgs.rows;r++) for (let c=1;c<=aq_upgs.cols;c++) {
        let id = r*10+c;
        if (!aq_upgs[id]) continue;
        if (aq_upgs[id].eff) tmp.aq.upgs[id] = aq_upgs[id].eff(tmp.aq.upgs.power);
    }

    tmp.aq.chargeCost = getAQChargeCost();
    tmp.aq.chargeEff = getAQChargeEff();

    tmp.aq.eff = {
        red: softcapQKAmt(player.aq.red).plus(1).pow(100),
        green: softcapQKAmt(player.aq.green).plus(1).pow(100),
        blue: softcapQKAmt(player.aq.blue).plus(1).pow(100),

        antired: softcapQKAmt(player.aq.red).plus(1).log10().plus(1).root(getAQEffRoot("r")).times(20),
        antigreen: softcapQKAmt(player.aq.green).plus(1).log10().plus(1).root(getAQEffRoot("g")).times(30),
        antiblue: softcapQKAmt(player.aq.blue).plus(1).log10().plus(1).root(getAQEffRoot("b")).times(10),
    }
    tmp.aq.net = player.aq.red.plus(player.aq.green).plus(player.aq.blue);

    tmp.aq.gain = { mult: getGlobalAQGainMult() };
    tmp.aq.gain.red = getAQGain("red").times(tmp.aq.gain.mult)
    tmp.aq.gain.green = getAQGain("green").times(tmp.aq.gain.mult)
    tmp.aq.gain.blue = getAQGain("blue").times(tmp.aq.gain.mult)

    tmp.aq.gluon = {
        size: getAntiGluonSizeRatio().times(getAntiGluonProportionSize()),
    }
    tmp.aq.gluon.eff = getAntiGluonEff()
}

function updateTempDup() {
    tmp.dup = {};

    tmp.dup.depthEff = getDupDepthEff();
    tmp.dup.depthNerf = getDupDepthNerf();

    tmp.dup.effMult = dupEffMult();

    tmp.dup.speed = getDupSpeed();
    tmp.dup.base = getDupBase();
    tmp.dup.haltStart = getDupHaltStart();
    tmp.dup.amount = getDuplicators();

    tmp.dup.essenceCost = getDupEssenceCost();
    tmp.dup.essenceCostPM = getDupEssenceCostPM();

    tmp.dup.eff = dup_effects.map(obj => obj.effect().times(tmp.dup.effMult));

    tmp.dup.dupReq = getDupDepthReq();
}

function updateTempBat() {
    tmp.bat = {};

    for (let b=total_batteries; b>=1; b--) {
        tmp.bat[b] = {
            boosts: getBatBoosts(b),
            loss: battery_data[b].loss(),
            stacks: {},
            extraStacks: {},
            tStacks: {},
            base: {},
            eff: {}
        };
        
        for (let i=1; i<=battery_data[b].numBoosts; i++) {
            tmp.bat[b].stacks[i] = getBatStacks(b, i);
            tmp.bat[b].extraStacks[i] = getExtraBatStacks(b, i);
            tmp.bat[b].tStacks[i] = tmp.bat[b].stacks[i].plus(tmp.bat[b].extraStacks[i]);
            tmp.bat[b].base[i] = battery_data[b].boostBases[i]();
            tmp.bat[b].eff[i] = battery_data[b].boostEffects[i]();
        }
    }

    tmp.bat.gain = getBatFluidGain();
}