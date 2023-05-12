function playerBatData() {
    return {
        fluid: new Decimal(0),
        batteries: {
            1: new Decimal(0),
            2: new Decimal(0)
        },
        bestBatteriesUnl: 1
    }
}

const total_batteries = 2
const battery_data = {
    1: {
        unl: () => true,
        sp: new Decimal(2),
        base: new Decimal(8),
        numBoosts: 9,
        convCost: () => Decimal.pow(1.8, tmp.bat[1].boosts),
        loss: () => 0.98,
        boostBases: {
            1: () => new Decimal(0.95),
            2: () => new Decimal(0.15),
            3: () => new Decimal(0.6),
            4: () => new Decimal(1.45),
            5: () => new Decimal("1e500"),
            6: () => new Decimal("1e10"),
            7: () => player.bat.fluid,
            8: () => new Decimal(3.6),
            9: () => new Decimal(2.5)
        },
        boostEffects: {
            1: () => Decimal.pow(tmp.bat[1].base[1], tmp.bat[1].tStacks[1]),
            2: () => Decimal.mul(tmp.bat[1].base[2], tmp.bat[1].tStacks[2]),
            3: () => Decimal.pow(Decimal.mul(tmp.bat[1].base[3], tmp.bat[1].tStacks[3]).plus(1), player.dup.depths),
            4: () => Decimal.pow(tmp.bat[1].base[4], Decimal.mul(tmp.ph?.uwt ?? getTotalUltrawaves(), tmp.bat[1].tStacks[4])),
            5: () => Decimal.pow(tmp.bat[1].base[5], tmp.bat[1].tStacks[5]),
            6: () => Decimal.pow(tmp.bat[1].base[6], Decimal.sub(tmp.bat[1].tStacks[6], 1).max(0)),
            7: () => Decimal.pow(tmp.bat[1].base[7], tmp.bat[1].tStacks[7]),
            8: () => Decimal.pow(tmp.bat[1].base[8], tmp.bat[1].tStacks[8]),
            9: () => Decimal.pow(tmp.bat[1].base[9], Decimal.sub(tmp.bat[1].tStacks[9], 1).max(0)),
        },
        boostDescs: {
            1: () => `Reduce Duplicator Essence costs by ${format(Decimal.sub(1, tmp.bat[1].base[1]).times(100))}%. (Currently: -${format(Decimal.sub(1, tmp.bat[1].eff[1]).times(100))}%)`,
            2: () => `Increase the exponent of Base Photon gain by ${format(tmp.bat[1].base[2])}. (Currently: +${format(tmp.bat[1].eff[2])})`,
            3: () => `Increase Battery Fluid production by ${format(tmp.bat[1].base[3].times(100))}% per Dupli-Depth. (Currently: ${format(tmp.bat[1].eff[3])}x)`,
            4: () => `Multiply Antiquark & Anti-Energy gain by ${format(tmp.bat[1].base[4])} per Ultrawave. (Currently: ${format(tmp.bat[1].eff[4])}x)`,
            5: () => `Ultrawaves require ${format(tmp.bat[1].base[5])}x less Photonic Matter. (Currently: /${format(tmp.bat[1].eff[5])})`,
            6: () => "Unlock a new Duplicator Effect" + (Decimal.gte(tmp.bat[1].tStacks[6], 1) ? ` (after 1, divides Dupli-Depth req by ${format(tmp.bat[1].base[6])}; Currently: /${format(tmp.bat[1].eff[6])})` : "."),
            7: () => `Unused Battery Fluid multiplies Space-Time Fabric & Photon production. (Currently: ${format(tmp.bat[1].eff[7])}x)`,
            8: () => `Multiply Universe Essence gain by ${format(tmp.bat[1].base[8])}. (Currently: ${format(tmp.bat[1].eff[8])}x)`,
            9: () => "Unlock a new Battery [permanent]" + (Decimal.gte(tmp.bat[1].tStacks[9], 1) ? ` (after 1, multiplies Battery Fluid production by ${format(tmp.bat[1].base[9])}; Currently: ${format(tmp.bat[1].eff[9])}x)` : "."),
        }
    },
    2: {
        unl: () => player.bat.bestBatteriesUnl >= 2,
        sp: new Decimal(3),
        base: new Decimal(1000),
        numBoosts: 9,
        convCost: () => Decimal.pow(2.7, tmp.bat[2].boosts).times(100),
        loss: () => 0.97,
        boostBases: {
            1: () => new Decimal(5),
            2: () => player.bat.fluid.plus(player.bat.batteries[1]).plus(player.bat.batteries[2]), // !!REMEMBER TO UPDATE THIS WHEN ADDING NEW BATTERIES!!
            3: () => new Decimal(0.1),
            4: () => new Decimal(0.05),
            5: () => new Decimal(0.00005),
            6: () => new Decimal(0.002),
            7: () => player.bat.batteries[1].plus(1).log10().plus(1).log10().div(10),
            8: () => new Decimal(2),
            9: () => new Decimal(3)
        },
        boostEffects: {
            1: () => Decimal.pow(tmp.bat[2].base[1], tmp.bat[2].tStacks[1]),
            2: () => Decimal.pow(tmp.bat[2].base[2], tmp.bat[2].tStacks[2]),
            3: () => Decimal.mul(tmp.bat[2].base[3], Decimal.sub(tmp.bat[2].tStacks[3], 1).max(0)),
            4: () => Decimal.mul(tmp.bat[2].base[4], tmp.bat[2].tStacks[4]),
            5: () => Decimal.mul(tmp.bat[2].base[5], tmp.bat[2].tStacks[5]),
            6: () => Decimal.mul(tmp.bat[2].base[6], tmp.bat[2].tStacks[6]).times(player.void.repUpgs[1]),
            7: () => Decimal.mul(tmp.bat[2].base[7], tmp.bat[2].tStacks[7]),
            8: () => Decimal.pow(tmp.bat[2].base[8], tmp.bat[2].tStacks[8]),
            9: () => Decimal.pow(tmp.bat[2].base[9], Decimal.sub(tmp.bat[2].tStacks[9], 1).max(0))
        },
        boostDescs: {
            1: () => `Divide Universal Upgrade costs & multiply Battery Fluid production by ${format(tmp.bat[2].base[1])}. (Currently: ${format(tmp.bat[2].eff[1])}x)`,
            2: () => `Divide Dimensional Depth requirement & multiply Duplicator Effects by Total Battery Fluid. (Currently: ${format(tmp.bat[2].eff[2])}x)`,
            3: () => "Unlock new Annihilation Upgrades" + (Decimal.gte(tmp.bat[2].tStacks[3], 1) ? ` (after 1, increases AE gain exponent by ${format(tmp.bat[2].base[3])}; Currently: +${format(tmp.bat[2].eff[3])})` : "."),
            4: () => `Each bought Wave Accelerator adds ${format(tmp.bat[2].base[4])} extra levels to all other Wave Accelerators. (Currently: +${format(tmp.bat[2].eff[4])} per Wave Accelerator bought)`,
            5: () => `Each Photon Generator Level adds ${format(tmp.bat[2].base[5])} to its Photon's base gain exponent. (Currently: +${format(tmp.bat[2].eff[5])} per Photon Generator Level)`,
            6: () => `Void Rebuyable Upgrade Power is increased by ${format(tmp.bat[2].base[6].times(100))}% per Void Rebuyable Upgrade 1 bought (additive). (Currently: +${format(tmp.bat[2].eff[6].times(100))}%)`,
            7: () => `Increase Battery 1 Boost levels by ${format(tmp.bat[2].base[7])}, based on Battery 1 Inserted Fluid. (Currently: +${format(tmp.bat[2].eff[7])})`,
            8: () => `Multiply Duplicator speed by ${format(tmp.bat[2].base[8])}. (Currently: ${format(tmp.bat[2].eff[8])}x)`,
            9: () => "Unlock ??? [NOT IMPLEMENTED YET]" + (Decimal.gte(tmp.bat[2].tStacks[9], 1) ? ` (after 1, makes Universal Compaction start ${tmp.bat[2].base[9]}x later; Currently: ${format(tmp.bat[2].eff[9])}x)` : ".")
        }
    }
}

function getBatsUnl() {
    return Decimal.gte(tmp.bat[1].tStacks[9], 1) ? 2 : 1;
}

function getBatFluidGain() {
    let gain = new Decimal(1);
    if (hasDupUnl(3)) gain = gain.mul(tmp.bat[1].eff[3]);
    if (hasDupUnl(3)) gain = gain.mul(tmp.bat[1].eff[9]);
    if (hasDupUnl(3) && player.bat.bestBatteriesUnl >= 2) gain = gain.times(tmp.bat[2].eff[1]);
    if (hasAnhUpg(46)) gain = gain.times(tmp.anh.upgs[46].eff);
    return gain;
}

function batLoop(diff) {
    if (!hasDupUnl(3)) return;

    for (let i=1; i<=total_batteries; i++) {
        player.bat.batteries[i] = Decimal.mul(player.bat.batteries[i], Decimal.pow(tmp.bat[i].loss, diff));
    }

    if (diff>=1) updateTempBat();

    player.bat.fluid = player.bat.fluid.plus(tmp.bat.gain.times(diff));

    player.bat.bestBatteriesUnl = Math.max(player.bat.bestBatteriesUnl, getBatsUnl());
}

function getBatBoostNextReq(bIndex, i) {
    const bData = battery_data[bIndex];
    const b = bData.numBoosts;

    const f = tmp.bat[bIndex].stacks[i];

    const G = Decimal.add(i, f.times(Decimal.add(i, Decimal.mul(b, f.sub(1).div(2).plus(1)))))

    return Decimal.mul(bData.base, Decimal.pow(bData.sp, G.sub(1)));
}

function getBatBoosts(bIndex) {
    const bData = battery_data[bIndex];

    if (Decimal.lt(player.bat.batteries[bIndex], Decimal.div(bData.base, bData.sp))) return new Decimal(0);

    const b = bData.numBoosts;

    const x = Decimal.div(player.bat.batteries[bIndex], bData.base).log(bData.sp).plus(1).floor();

    const n = Decimal.div(x, b).times(8).plus(1).sqrt().sub(1).div(2).floor();

    return n.times(b).plus(x.sub(n.times(b).times(n.plus(1)).div(2)).div(n.plus(1))).floor();
}

function getBatStacks(bIndex, i) {
    const bData = battery_data[bIndex];

    const b = bData.numBoosts;

    return tmp.bat[bIndex].boosts.sub(i).div(b).plus(1).floor();
}

function getExtraBatStacks(bIndex, i) {
    let extra = new Decimal(0);

    if (hasDupUnl(3) && player.bat.bestBatteriesUnl >= 2 && bIndex == 1) extra = extra.plus(tmp.bat[2].eff[7]);

    return extra;
}

function investFluid(bIndex) {
    const bData = battery_data[bIndex];

    const conv = bData.convCost();
    if (Decimal.lt(player.bat.fluid, conv)) return;

    player.bat.batteries[bIndex] = Decimal.add(player.bat.batteries[bIndex], Decimal.sub(player.bat.fluid, conv));
    player.bat.fluid = new Decimal(0);
}