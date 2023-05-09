function playerBatData() {
    return {
        fluid: new Decimal(0),
        batteries: {
            1: new Decimal(0)
        }
    }
}

const euler_mascheroni = 0.57721566490153286060651209008240243104215933593992;

const total_batteries = 1
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
            1: () => Decimal.pow(tmp.bat[1].base[1], tmp.bat[1].stacks[1]),
            2: () => Decimal.mul(tmp.bat[1].base[2], tmp.bat[1].stacks[2]),
            3: () => Decimal.pow(Decimal.mul(tmp.bat[1].base[3], tmp.bat[1].stacks[3]).plus(1), player.dup.depths),
            4: () => Decimal.pow(tmp.bat[1].base[4], Decimal.mul(tmp.ph?.uwt ?? getTotalUltrawaves(), tmp.bat[1].stacks[4])),
            5: () => Decimal.pow(tmp.bat[1].base[5], tmp.bat[1].stacks[5]),
            6: () => Decimal.pow(tmp.bat[1].base[6], Decimal.sub(tmp.bat[1].stacks[6], 1).max(0)),
            7: () => Decimal.pow(tmp.bat[1].base[7], tmp.bat[1].stacks[7]),
            8: () => Decimal.pow(tmp.bat[1].base[8], tmp.bat[1].stacks[8]),
            9: () => Decimal.pow(tmp.bat[1].base[9], Decimal.sub(tmp.bat[1].stacks[9], 1).max(0)),
        },
        boostDescs: {
            1: () => `Reduce Duplicator Essence costs by ${format(Decimal.sub(1, tmp.bat[1].base[1]).times(100))}%. (Currently: -${format(Decimal.sub(1, tmp.bat[1].eff[1]).times(100))}%)`,
            2: () => `Increase the exponent of Base Photon gain by ${format(tmp.bat[1].base[2])}. (Currently: +${format(tmp.bat[1].eff[2])})`,
            3: () => `Increase Battery Fluid production by ${format(tmp.bat[1].base[3].times(100))}% per Dupli-Depth. (Currently: ${format(tmp.bat[1].eff[3])}x)`,
            4: () => `Multiply Antiquark & Anti-Energy gain by ${format(tmp.bat[1].base[4])} per Ultrawave. (Currently: ${format(tmp.bat[1].eff[4])}x)`,
            5: () => `Ultrawaves require ${format(tmp.bat[1].base[5])}x less Photonic Matter. (Currently: /${format(tmp.bat[1].eff[5])})`,
            6: () => "Unlock a new Duplicator Effect" + (Decimal.gte(tmp.bat[1].stacks[6], 1) ? ` (after 1, divides Dupli-Depth req by ${format(tmp.bat[1].base[6])}; Currently: /${format(tmp.bat[1].eff[6])})` : "."),
            7: () => `Unused Battery Fluid multiplies Space-Time Fabric & Photon production. (Currently: ${format(tmp.bat[1].eff[7])}x)`,
            8: () => `Multiply Universe Essence gain by ${format(tmp.bat[1].base[8])}. (Currently: ${format(tmp.bat[1].eff[8])}x)`,
            9: () => "Unlock a new Battery [TODO]" + (Decimal.gte(tmp.bat[1].stacks[9], 1) ? ` (after 1, multiplies Battery Fluid production by ${format(tmp.bat[1].base[9])}; Currently: ${format(tmp.bat[1].eff[9])}x)` : "."),
        }
    }
}

function getBatFluidGain() {
    let gain = new Decimal(1);
    if (hasDupUnl(3)) gain = gain.mul(tmp.bat[1].eff[3]);
    if (hasDupUnl(3)) gain = gain.mul(tmp.bat[1].eff[9]);
    return gain;
}

function batLoop(diff) {
    if (!hasDupUnl(3)) return;

    for (let i=1; i<=total_batteries; i++) {
        player.bat.batteries[i] = Decimal.mul(player.bat.batteries[i], Decimal.pow(tmp.bat[i].loss, diff));
    }

    if (diff>=1) updateTempBat();

    player.bat.fluid = player.bat.fluid.plus(tmp.bat.gain.times(diff));
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

    const x = Decimal.div(player.bat.batteries[bIndex], bData.base).log(bData.sp).plus(1);
    const i = x.sub(Decimal.mul(b, Decimal.div(x, b).floor()));

    const f = Decimal.div(x, b).floor();

    const m = f.equals(1) ? 21/36 : euler_mascheroni;
    const s = f.gt(0) ? f.ln().plus(m).plus(Decimal.div(0.5, f)).sub(Decimal.div(1, Decimal.pow(f, 2).times(12))).times(b) : new Decimal(0);

    return i.div(x.div(b).floor().plus(1)).plus(s).floor();
}

function getBatStacks(bIndex, i) {
    const bData = battery_data[bIndex];

    const b = bData.numBoosts;

    return tmp.bat[bIndex].boosts.sub(i).div(b).plus(1).floor();
}

function investFluid(bIndex) {
    const bData = battery_data[bIndex];

    const conv = bData.convCost();
    if (Decimal.lt(player.bat.fluid, conv)) return;

    player.bat.batteries[bIndex] = Decimal.add(player.bat.batteries[bIndex], Decimal.sub(player.bat.fluid, conv));
    player.bat.fluid = new Decimal(0);
}