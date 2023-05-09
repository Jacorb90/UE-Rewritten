var player;
var app;
var tmp = {};
var intervals = {};
var tabData = {
    normal: "Universe",
    qk: "Quarks",
    anh: "Upgrades",
    ph: "Photons",
    dup: "Duplicators"
}
var importInput;
var storageName = "UErewritten";

const tabs = {
    normal: {
        Options() { return true },
        Universe() { return true },
        Quarks() { return player.quarks.unl },
        Hadrons() { return player.hadrons.unl },
        Annihilation() { return player.depth.gte(anhBaseReq)||player.annihilation.reached },
        Photons() { return player.photons.unl },
        Duplicators() { return player.dup.unl },
        Batteries() { return hasDupUnl(3) }
    },
    qk: {
        Quarks() { return player.aq.unl },
        Antiquarks() { return player.aq.unl },
    },
    anh: {
        Upgrades() { return player.annihilation.reached },
        Boosts() { return player.annihilation.reached },
        Void() { return player.void.unl },
    },
    ph: {
        Photons() { return hasAQUpg(43) },
        Ultrawaves() { return hasAQUpg(43) },
    },
    dup: {
        Duplicators() { return hasDupUnl(2) },
        "Dupli-Depths"() { return hasDupUnl(2) }
    }
}

function showTab(name, type) { if (tabs[type][name]()) tabData[type] = name }

function startPlayer() { return {
    autosave: true,
    offtime: true,
    lastTime: new Date().getTime(),
    begun: false,
    size: new Decimal(1),
    time: new Decimal(0),
    depth: new Decimal(0),
    autoDepths: false,
    autoQH: false,
    autoUU: false,
    essence: new Decimal(0),
    spentEssence: new Decimal(0),
    upgsUnl: false,
    upgs: {},
    quarks: playerQuarksData(),
    hadrons: playerHadronsData(),
    annihilation: playerAnnihilationData(),
    void: playerVoidData(),
    photons: playerPhotonsData(),
    aq: playerAQData(),
    dup: playerDupData(),
    bat: playerBatData()
}}

function save() {
    localStorage.setItem(storageName, btoa(JSON.stringify(player)));
}

function loadGame() {
    let g = localStorage.getItem(storageName);
    if (g !== null) player = JSON.parse(atob(g));
    else player = startPlayer();

    fixObj(player, startPlayer());
    transformPlayerToDecimal()

    updateTemp();
    updateTemp();
    updateTemp();

    loadVue();

    intervals.loop = setInterval(function() {
        if (!player) return;
    
        let time = new Date().getTime()
        gameLoop(player.offtime?((time - player.lastTime)/1000):.02);
        player.lastTime = time;
    }, 50)
    
    intervals.autosave = setInterval(function() {
        if (player && !(!player.autosave)) save();
    }, 5000)
}

function fixObj(obj, start) {
	for (let x in start) {
		if (obj[x] === undefined) obj[x] = start[x]
		else if (typeof start[x] == "object" && !(start[x] instanceof Decimal)) fixObj(obj[x], start[x])
		else if (start[x] instanceof Decimal) obj[x] = new Decimal(obj[x])
	}
}

function transformPlayerToDecimal() {
    for (let x in player.upgs) player.upgs[x] = new Decimal(player.upgs[x])
    for (let x in player.void.repUpgs) player.void.repUpgs[x] = new Decimal(player.void.repUpgs[x])
}

function hardReset() {
    if (!confirm("Are you 100% sure you want to completely reset your save??? All of your progress will be lost!")) return;

    player = startPlayer();
    save();
    window.location.reload();
}

function toggleAutoSave() { player.autosave = !player.autosave }
function toggleOffTime() { player.offtime = !player.offtime }

function doImport(input) {
    let files = input.files;

    if (files.length>0) {
        let file = files[files.length-1];
        let type = file.name.split(".")[1]
        if (type=="txt") {
            var reader = new FileReader()
            reader.readAsText(file)

            try {
                reader.onload = function(e) {
                    let data = e.target.result;

                    player = JSON.parse(atob(data))
                    save();
                    document.location.reload();
                }
            } catch(e) {
                console.log("Import Error");
            }
        }
    }
};

function importSave() {
    let field = document.getElementById('importField')
	importInput = field?field:document.createElement('input');
    if (!field) {
	    importInput.setAttribute('type', 'file');
        importInput.setAttribute('id', 'importField')
        importInput.setAttribute('onchange', 'doImport(importInput)')
	    document.body.appendChild(importInput);
    }

	importInput.click();
}

function exportSave() {
	let data = btoa(JSON.stringify(player))
	const a = document.createElement('a');
	a.setAttribute('href', 'data:text/plain;charset=utf-8,' + data);
	a.setAttribute('download', "uer.txt");
	a.setAttribute('id', 'downloadSave');

	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

function loadVue() {
    return new Vue({
        el: "#app",
        data: {
            player,
            tmp,
            format,
            formatWhole,
            tabs,
            tabData,
            showTab,
            universe_upgs_unl_req,
            universe_upgs,
            buyUniverseUpg,
            quarks_unl_req,
            checkFunc,
            hadrons_unl_req,
            annihilation_upgs,
            buyAnnihilationUpg,
            hasAnhUpg,
            canUnlockVoid,
            voidReqs,
            displayCompactionSizeGain,
            getVoidUpgTier,
            void_rep_upgs,
            buyVoidRepUpg,
            voidUpgActive,
            void_anh_upgs,
            void_anh_upg_rows,
            photons_unl,
            photon_data,
            getGluonScaleName,
            aq_unl,
            getAntiGluonScaleName,
            aq_upgs,
            buyAQUpg,
            hasAQUpg,
            getUltrawaveGain,
            getUltrawaveNext,
            minAllWaveAcc,
            dup_unl,
            unlockDup,
            getDuplicatorGain,
            buyDupEssence,
            dup_effects,
            dup_unlocks,
            hasDupEff,
            hasDupUnl,
            buyAQCharge,
            getHadronicBoostMag,
            getVoidUpgMaxTier,
            buyDupEssencePM,
            dupDepth,
            maxAllDupEssence,
            getBatBoostNextReq,
            battery_data,
            investFluid,
            maxAllVoidRepUpgs
        },
    })
}