var favored = {
    Firefin: 'Ink Saver (Sub)',
    Forge: 'Special Duration Up',
    Inkline: 'Defense Up',
    'Krak-On': 'Swim Speed Up',
    Rockenberg: 'Run Speed Up',
    Skalop: 'Quick Respawn',
    'Splash Mob': 'Ink Saver (Main)',
    SquidForce: 'Damage Up',
    Takoroka: 'Special Charge Up',
    Tentatek: 'Ink Recovery Up',
    Zekko: 'Special Saver',
    Zink: 'Quick Superjump'
};

var unfavored = {
    Firefin: 'Ink Recovery Up',
    Forge: 'Ink Saver (Sub)',
    Inkline: 'Damage Up',
    'Krak-On': 'Defense Up',
    Rockenberg: 'Swim Speed Up',
    Skalop: 'Special Saver',
    'Splash Mob': 'Run Speed Up',
    SquidForce: 'Ink Saver (Main)',
    Takoroka: 'Special Duration Up',
    Tentatek: 'Quick Superjump',
    Zekko: 'Special Charge Up',
    Zink: 'Quick Respawn'
};

var totalRolls = {
    'headgear': 0,
    'shirt': 0,
    'shoes': 0
};

function calculateR(brand) {
    // if brand is amiibo, cuttlegear, KOG, Squid Girl, or Famitsu, r = 13, else r = 33
    if (brand === 'Amiibo' || brand === 'Cuttlegear' || brand === 'KOG' || brand === 'Squid Girl' || brand === 'Famitsu') {
        return 13;
    }
    return 33;
}

function calculateP(sub1, sub2, sub3) {
    if (sub1 === sub2 && sub1 === sub3 && sub2 === sub3) {
        return 1;
    } else if (sub1 !== sub2 && sub1 !== sub3 && sub2 !== sub3) {
        return 6;
    }
    return 3;
}

function calculateAbc(r, brand, sub) {
    // If r is 13, we're looking at a brand that has the same odds for
    // every ability.
    if (r === 13) {
        return 1;
    }
    // if r isn't 13, we're looking at a brand that has favored and unfavored
    // abilities. Favored abilities roll 5 times more than regular abilities,
    // and unfavored abilities roll half as often.
    if (favored[brand] === sub) {
        return 10;
    }
    if (unfavored[brand] === sub) {
        return 1;
    }
    return 2;
}

function updateOdds(brand, sub1, sub2, sub3) {
    var p;
    var r;
    var n;
    var chanceOfFailure;
    var subs;
    var subOdds;

    // If we don't have a brand, we can't do anything,
    // so return 0 and save some calculation
    if (!brand || brand === '') {
        return 0;
    }
    r = calculateR(brand);
    // Build an array of subabilities that have a value
    subs = [sub1, sub2, sub3].filter(function(element) {
        return (element && element !== '');
    });
    // Grab the top half of the probability fraction for those subabilities
    subOdds = subs.map(function(element) {
        return calculateAbc(r, brand, element);
    });
    n = subs.length;

    if (n === 3) {
        // If we want 3 specific abilities, the number of permutations is
        // (different abilities) factorial. For example, if we want 3 of the
        // same ability, there's just 1 permutation - AAA. If we want 3
        // different abilities, there are 6 permutations:
        // ABC, ACB, BAC, BCA, CAB, CBA.
        p = calculateP(subs[0], subs[1], subs[2]);
        return p * subOdds[0] * subOdds[1] * subOdds[2] / Math.pow(r, 3);
    }
    if (n === 2 && subs[0] === subs[1]) {
        // If we want two of the same ability, we have 3 possible permutations:
        // AA_, A_A, _AA.
        return (Math.pow(subOdds[0], 2) * (3 * r - 2 * subOdds[0])) / Math.pow(r, 3);
    }
    if (n === 2) {
        // If we want two different abilities, we have 6 possible permutations:
        // AB_, BA_, A_B, B_A, _AB, _BA.
        return ((3 * subOdds[0] * subOdds[1]) * (2 * r - subOdds[0] - subOdds[1])) / Math.pow(r, 3);
    }
    if (n === 1) {
        // If we just want at least one of an ability, it's easier to calculate
        // the chance of not getting that ability in any slot, then find the
        // complement.
        chanceOfFailure = (r - subOdds[0]) / r;
        return 1 - Math.pow(chanceOfFailure, 3);
    }
    return 0;
}

// Given a probability, returns the number of rolls it would take to have at
// least a 50% chance at success in future rolls.
function getExpectedMajorityRolls(odds) {
    return odds ? Math.ceil(Math.log10(0.5) / Math.log10(1 - odds)) : 0;
}

// Given a probability, returns the expected number of rolls before the
// first success.
function getExpectedRolls(odds) {
    return odds ? Math.ceil(1 / odds) : 0;
}

function getOddPercent(odds) {
    return odds ? (odds * 100).toFixed(4) + '%' : '';
}

document.addEventListener('DOMContentLoaded', function() {
    // when the brand select box changes,
    // update the favored/unfavored text
    document.addEventListener('change', function(e) {
        var parent = e.target.parentNode;
        var type = parent.id;
        var brand = parent.getElementsByClassName('brand')[0].value;
        var sub1 = parent.getElementsByClassName('sub1')[0].value;
        var sub2 = parent.getElementsByClassName('sub2')[0].value;
        var sub3 = parent.getElementsByClassName('sub3')[0].value;
        var odds = updateOdds(brand, sub1, sub2, sub3);
        var oddPercent = getOddPercent(odds);
        var rolls = getExpectedRolls(odds);
        totalRolls[type] = rolls;
        parent.getElementsByClassName('odds')[0].textContent = oddPercent;
        parent.getElementsByClassName('expected-rolls')[0].textContent = rolls || '';
        parent.getElementsByClassName('favored')[0].textContent = favored[brand] || '';
        parent.getElementsByClassName('unfavored')[0].textContent = unfavored[brand] || '';
        document.getElementById('total-rolls').textContent = (totalRolls.headgear + totalRolls.shirt + totalRolls.shoes) || '';
    });
});
