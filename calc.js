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

function calculateAbc(rNum, brand, sub) {
    if (rNum === 13) {
        return 1;
    }
    if (sub === favored[brand]) {
        return 10;
    }
    if (sub === unfavored[brand]) {
        return 1;
    }
    if (!brand || brand === '') {
        return rNum;
    }
    return 2;
}

function calculateP(sub1, sub2, sub3) {
    if (sub1 === sub2 && sub1 === sub3 && sub2 === sub3) {
        return 1;
    } else if (sub1 !== sub2 && sub1 !== sub3 && sub2 !== sub3) {
        return 6;
    }
    return 3;
}

function updateOdds(brand, sub1, sub2, sub3) {
    var n = [sub1, sub2, sub3].reduce(function(prev, curr) {
        if (curr && curr !== '') {
            return prev + 1;
        }
        return prev;
    }, 0);
    var r = calculateR(brand);
    var a = calculateAbc(r, brand, sub1);
    var b = calculateAbc(r, brand, sub2);
    var c = calculateAbc(r, brand, sub3);

    var p;
    var z;
    if (n === 3) {
        p = calculateP(sub1, sub2, sub3);
        z = p * a * b * c / Math.pow(r, 3);
    } else {
        a = (a === r || !sub1 || sub1 === '' ? 0 : a);
        b = (b === r || !sub2 || sub2 === '' ? 0 : b);
        c = (c === r || !sub3 || sub3 === '' ? 0 : c);

        if (n === 2 && (sub1 === sub2 || sub1 === sub3 || sub2 === sub3)) {
            z = (3 * r * Math.pow(a, 2) - 2 * Math.pow(a, 3)) / Math.pow(r, 3);
            z += (3 * r * Math.pow(b, 2) - 2 * Math.pow(b, 3)) / Math.pow(r, 3);
            z += (3 * r * Math.pow(c, 2) - 2 * Math.pow(c, 3)) / Math.pow(r, 3);
            z /= 2;
        } else if (n === 2) {
            z = 2 * r * a * b - b * Math.pow(a, 2) - a * Math.pow(b, 2);
            z += 2 * r * a * c - c * Math.pow(a, 2) - a * Math.pow(c, 2);
            z += 2 * r * b * c - c * Math.pow(b, 2) - b * Math.pow(c, 2);
            z *= 3 / Math.pow(r, 3);
        } else if (n === 1) {
            z = (3 * Math.pow(r, 2) * a - 3 * r * Math.pow(a, 2) + Math.pow(a, 3)) / Math.pow(r, 3);
            z += (3 * Math.pow(r, 2) * b - 3 * r * Math.pow(b, 2) + Math.pow(b, 3) ) / Math.pow(r, 3);
            z += (3 * Math.pow(r, 2) * c - 3 * r * Math.pow(c, 2) + Math.pow(c, 3) ) / Math.pow(r, 3);
        }
    }
    return z;
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
        var oddPercent = odds ? (odds * 100).toFixed(4) + '%' : '';
        var rolls = odds ? Math.ceil(Math.log10(0.5) / Math.log10(1 - odds)) : 0;
        totalRolls[type] = rolls;
        parent.getElementsByClassName('odds')[0].textContent = oddPercent;
        parent.getElementsByClassName('expected-rolls')[0].textContent = rolls || '';
        parent.getElementsByClassName('favored')[0].textContent = favored[brand] || '';
        parent.getElementsByClassName('unfavored')[0].textContent = unfavored[brand] || '';
        document.getElementById('total-rolls').textContent = (totalRolls.headgear + totalRolls.shirt + totalRolls.shoes) || '';
    });
});
