/*
RemoveTheCorpse
Removes tokens marked "dead" from the Turn Tracker

On Github:	https://github.com/blawson69
Contact me: https://app.roll20.net/users/1781274/ben-l
Like this script? Buy me a coffee: https://venmo.com/theBenLawson
*/

var RemoveTheCorpse = RemoveTheCorpse || (function () {
    'use strict';

    //---- INFO ----//

    var version = '1.2',
    debugMode = false,
    styles = {
        box:  'background-color: #fff; border: 1px solid #000; padding: 8px 10px; border-radius: 6px; margin-left: -40px; margin-right: 0px;',
        title: 'padding: 0 0 10px 0; color: ##591209; font-size: 1.5em; font-weight: bold; font-variant: small-caps; font-family: "Times New Roman",Times,serif;',
        button: 'background-color: #000; border-width: 0px; border-radius: 5px; padding: 5px 8px; margin: 8px 0; color: #fff; text-align: center;',
        textButton: 'background-color: transparent; border: none; padding: 0; color: #591209; text-decoration: underline;',
        code: 'font-family: "Courier New", Courier, monospace; background-color: #ddd; color: #000; padding: 2px 4px;',
    },

    checkInstall = function () {
        if (!_.has(state, 'RemoveTheCorpse')) state['RemoveTheCorpse'] = state['RemoveTheCorpse'] || {};
        if (typeof state['RemoveTheCorpse'].autoRemove == 'undefined') state['RemoveTheCorpse'].autoRemove = false;
        if (typeof state['RemoveTheCorpse'].deadMarker == 'undefined') state['RemoveTheCorpse'].deadMarker = 'dead';
        log('--> RemoveTheCorpse v' + version + ' <-- Initialized');
        if (debugMode) showDialog('Initialized', 'RemoveTheCorpse has loaded...');
    },

    //----- INPUT HANDLER -----//

    handleInput = function (msg) {
        if (msg.type == 'api' && msg.content.startsWith('!rtc') && playerIsGM(msg.playerid)) {
            var parms = msg.content.split(/\s+/i);
            if (parms[1]) {
                switch (parms[1]) {
                    case 'toggleAuto':
                        toggleAuto();
                        break;
                    case 'setMarker':
                        setMarker(msg.content.split(/\s+/i).pop().toLowerCase());
                        break;
                    case 'markers':
                        showMarkers();
                        break;
                    case 'help':
                    case 'config':
                        showHelp();
                        break;
                    default:
                        removeCorpse(parms[1]);
                }
            } else {
                showHelp(msg);
            }
		}
    },

    //---- PRIVATE FUNCTIONS ----//

    removeCorpse = function (corpse_id) {
        if(Campaign().get("turnorder") !== "") {
            var to = JSON.parse(Campaign().get("turnorder"));
            var nto = _.filter(to, function (obj) { return obj.id !== corpse_id; });
            Campaign().set("turnorder", JSON.stringify(nto));
        }
    },

    showHelp = function (msg) {
        var marker_style = 'margin: 5px 10px 0 0; display: block; float: left;';
        var message = '<h4>!rtc &lt;token_id&gt;</h4>Manually removes the token with '
        + 'the matching id from the turn tracker.<br><br><h4>Auto Remove</h4>';
        if (state['RemoveTheCorpse'].autoRemove) {
            message += 'You are currently configured to automatically remove a token from the turn tracker whenever the Dead Marker is applied to it.<br><div align="center"><a style="' + styles.button + '" href="!rtc toggleAuto">Turn Off</a></div>';
        } else {
            message += 'You are currently configured only for manual removal of tokens from the turn tracker. If you wish to automatically remove tokens '
            + 'when the Dead Marker is set on them, you may do so. This applies to <i>all</i> tokens.<br><div align="center"><a style="' + styles.button + '" href="!rtc toggleAuto">Turn On</a></div>';
        }
        message += '<h4>Dead Marker</h4>' + getMarker(state['RemoveTheCorpse'].deadMarker, marker_style)
        + 'The current status marker to indicate a dead token during auto removal is "'
        + state['RemoveTheCorpse'].deadMarker + '".<br>';
        message += '<div align="center"><a style="' + styles.button + '" href="!rtc markers">Change Marker</a></div>';
        showDialog('Help Menu', message);
    },

    setMarker = function (marker) {
        var status_markers = ['blue', 'brown', 'green', 'pink', 'purple', 'red', 'yellow', 'all-for-one', 'angel-outfit', 'archery-target', 'arrowed', 'aura', 'back-pain', 'black-flag', 'bleeding-eye', 'bolt-shield', 'broken-heart', 'broken-shield', 'broken-skull', 'chained-heart', 'chemical-bolt', 'cobweb', 'dead', 'death-zone', 'drink-me', 'edge-crack', 'fishing-net', 'fist', 'fluffy-wing', 'flying-flag', 'frozen-orb', 'grab', 'grenade', 'half-haze', 'half-heart', 'interdiction', 'lightning-helix', 'ninja-mask', 'overdrive', 'padlock', 'pummeled', 'radioactive', 'rolling-bomb', 'screaming', 'sentry-gun', 'skull', 'sleepy', 'snail', 'spanner', 'stopwatch', 'strong', 'three-leaves', 'tread', 'trophy', 'white-tower'];
        if (_.find(status_markers, function (tmp) {return tmp === marker; })) {
            state['RemoveTheCorpse'].deadMarker = marker;
        } else {
            showDialog('Error', 'The status marker "' + marker + '" is invalid. Please try again.');
        }
        showHelp();
    },

    toggleAuto = function () {
        state['RemoveTheCorpse'].autoRemove = !state['RemoveTheCorpse'].autoRemove;
        showHelp();
    },

	showDialog = function (title, content) {
        title = (title == '') ? '' : '<div style=\'' + styles.title + '\'>' + title + '</div>';
        var body = '<div style=\'' + styles.box + '\'>' + title + '<div>' + content + '</div></div>';
        sendChat('RemoveTheCorpse','/w GM ' + body, null, {noarchive:true});
	},

    showMarkers = function () {
        var status_markers = ['red', 'angel-outfit', 'broken-skull', 'dead', 'death-zone', 'skull'];
        var message = '<table style="border: 0; align: center;" cellpadding="0" cellspacing="2">';
        _.each(status_markers, function(marker) {
            message += '<tr><td style="white-space: nowrap;">' + getMarker(marker, 'margin-right: 10px;') + '</td><td style="white-space: nowrap; width: 100%;">' + marker + '</td>';
            if (marker == state['RemoveTheCorpse'].deadMarker) {
                message += '<td style="text-align: center;">Current</td>';
            } else {
                message += '<td style="text-align: center; white-space: nowrap;"><a style="' + styles.button + '" href="!rtc setMarker ' + marker + '">Set Marker</a></td>';
            }
            message += '</tr>';
        });
        message += '<tr><td colspan="3" style="text-align: center;"><a style="' + styles.button
        + '" href="!rtc help">&#9668; Back</a> &nbsp; <a style="' + styles.button
        + '" href="!rtc setMarker &#63;&#123;Status Marker&#124;&#125;">Different Marker</a></td></tr>';
        message += '</table>';
        showDialog('Choose Dead Marker', message);
    },

    getMarker = function (marker, style = '') {
        let X = '';
        let marker_style = 'width: 24px; height: 24px;';
        var marker_pos = {red:"#C91010",  blue: "#1076C9",  green: "#2FC910",  brown: "#C97310",  purple: "#9510C9",  pink: "#EB75E1",  yellow: "#E5EB75",  dead: "X",  skull: 0, sleepy: 34, "half-heart": 68, "half-haze": 102, interdiction: 136, snail: 170, "lightning-helix": 204, spanner: 238, "chained-heart": 272, "chemical-bolt": 306, "death-zone": 340, "drink-me": 374, "edge-crack": 408, "ninja-mask": 442, stopwatch: 476, "fishing-net": 510, overdrive: 544, strong: 578, fist: 612, padlock: 646, "three-leaves": 680, "fluffy-wing": 714, pummeled: 748, tread: 782, arrowed: 816, aura: 850, "back-pain": 884, "black-flag": 918, "bleeding-eye": 952, "bolt-shield": 986, "broken-heart": 1020, cobweb: 1054, "broken-shield": 1088, "flying-flag": 1122, radioactive: 1156, trophy: 1190, "broken-skull": 1224, "frozen-orb": 1258, "rolling-bomb": 1292, "white-tower": 1326, grab: 1360, screaming: 1394,  grenade: 1428,  "sentry-gun": 1462,  "all-for-one": 1496,  "angel-outfit": 1530,  "archery-target": 1564};

        if (typeof marker_pos[marker] === 'undefined') return false;

        if (Number.isInteger(marker_pos[marker])) {
            marker_style += 'background-image: url(https://roll20.net/images/statussheet.png);'
            + 'background-repeat: no-repeat; background-position: -' + marker_pos[marker] + 'px 0;';
        } else if (marker_pos[marker] === 'X') {
            marker_style += 'color: red; font-size: 32px; font-weight: bold; text-align: center; padding-top: 5px; overflow: hidden;';
            X = 'X';
        } else {
            marker_style += 'background-color: ' + marker_pos[marker]
            + '; border: 1px solid #fff; border-radius: 50%;';
        }

        marker_style += style;

        return '<div style="' + marker_style + '">' + X + '</div>';
    },

    corpseListener = function (token, prev) {
        if (state['RemoveTheCorpse'].autoRemove && token.get('status_' + state['RemoveTheCorpse'].deadMarker)) {
            removeCorpse(token.get('id'));
        }
    },

    //---- PUBLIC FUNCTIONS ----//

    registerEventHandlers = function () {
		on('chat:message', handleInput);
        on("change:token:statusmarkers", corpseListener);

        // Make sure we detect status changes from other scripts
        if (typeof TokenMod !== 'undefined' && TokenMod.ObserveTokenChange) {
            TokenMod.ObserveTokenChange((obj,prev) => {
                corpseListener(obj, prev);
            });
        }

        if (typeof CombatTracker !== 'undefined' && CombatTracker.ObserveTokenChange) {
            CombatTracker.ObserveTokenChange((obj,prev) => {
                corpseListener(obj, prev);
            });
        }

        if (typeof DeathTracker !== 'undefined' && DeathTracker.ObserveTokenChange) {
            DeathTracker.ObserveTokenChange((obj,prev) => {
                corpseListener(obj, prev);
            });
        }
	};

    return {
		checkInstall: checkInstall,
		registerEventHandlers: registerEventHandlers
	};
}());

on("ready", function () {
    RemoveTheCorpse.checkInstall();
    RemoveTheCorpse.registerEventHandlers();
});
