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

    var version = '1.0',

    checkInstall = function () {
        if (!_.has(state, 'RemoveTheCorpse')) state['RemoveTheCorpse'] = state['RemoveTheCorpse'] || {};
        if (typeof state['RemoveTheCorpse'].autoRemove == 'undefined') state['RemoveTheCorpse'].autoRemove = false;
        if (typeof state['RemoveTheCorpse'].deadMarker == 'undefined') state['RemoveTheCorpse'].deadMarker = 'dead';
        log('--> RemoveTheCorpse v' + version + ' <-- Initialized');
    },

    //----- INPUT HANDLER -----//

    handleInput = function (msg) {
        if (msg.type == 'api' && msg.content.startsWith('!rtc') && playerIsGM(msg.playerid)) {
            var parms = msg.content.split(/\s+/i);
            if (parms[1]) {
                switch (parms[1]) {
                    case 'toggleAuto':
                        toggleAuto(msg);
                        break;
                    case 'setMarker':
                        setMarker(msg);
                        break;
                    case 'help':
                    case 'config':
                        showHelp(msg);
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
        var message = '<b>!rtc help</b> or <b>!rtc config</b><br>Sends this dialog to the chat window.<br><br>'
        + '<b>!rtc &lt;token_id&gt;</b><br>Manually removes the token with the matching id from the turn tracker.<br><br>'
        + '<b>Auto Remove</b><br>';
        if (state['RemoveTheCorpse'].autoRemove) {
            message += 'You are currently configured to automatically remove tokens whenever the Dead Marker is applied.<br><a href="!rtc toggleAuto">Turn Off</a><br><br>';
        } else {
            message += 'You are currently configured only for manual removal of tokens from the turn tracker. If you wish to automatically remove tokens '
            + 'when the Dead Marker is set on them, you may do so. This applies to <i>all</i> tokens.<br><a href="!rtc toggleAuto">Turn On</a><br><br>';
        }
        message += '<b>Dead Marker</b><br>The current status marker to indicate a dead token is set to <b><i>"' + state['RemoveTheCorpse'].deadMarker + '"</i></b>. '
        + 'If you wish to use a different status marker, '
        + '<a href="!rtc setMarker &#63;&#123;Status Marker&#124;dead&#124;red&#124;death-zone&#124;skull&#124;broken-skull&#124;angel-outfit&#125;">click here</a>';
        showDialog('Help Menu', message);
    },

    setMarker = function (msg) {
        var status_markers = ['blue', 'brown', 'green', 'pink', 'purple', 'red', 'yellow', 'all-for-one', 'angel-outfit', 'archery-target', 'arrowed', 'aura', 'back-pain', 'black-flag', 'bleeding-eye', 'bolt-shield', 'broken-heart', 'broken-shield', 'broken-skull', 'chained-heart', 'chemical-bolt', 'cobweb', 'dead', 'death-zone', 'drink-me', 'edge-crack', 'fishing-net', 'fist', 'fluffy-wing', 'flying-flag', 'frozen-orb', 'grab', 'grenade', 'half-haze', 'half-heart', 'interdiction', 'lightning-helix', 'ninja-mask', 'overdrive', 'padlock', 'pummeled', 'radioactive', 'rolling-bomb', 'screaming', 'sentry-gun', 'skull', 'sleepy', 'snail', 'spanner', 'stopwatch', 'strong', 'three-leaves', 'tread', 'trophy', 'white-tower'];
        var marker = msg.content.split(/\s+/i).pop().toLowerCase();
        if (_.has(status_markers, marker) > -1) {
            state['RemoveTheCorpse'].deadMarker = marker;
            showDialog('Dead Marker', 'You have set the dead marker to <b><i>"' + state['RemoveTheCorpse'].deadMarker + '"</i></b>.');
        } else {
            showDialog('Error', '"' + marker + '" is an invalid status marker. Try again.');
        }
    },

    toggleAuto = function (msg) {
        if (state['RemoveTheCorpse'].autoRemove) {
            state['RemoveTheCorpse'].autoRemove = false;
            showDialog('Auto Remove', 'The automatic removal of a token from the turn tracker has been turned OFF. <a href="!rtc toggleAuto">Turn On</a>');
        } else {
            state['RemoveTheCorpse'].autoRemove = true;
            showDialog('Auto Remove', 'The automatic removal of a token from the turn tracker has been turned ON. <a href="!rtc toggleAuto">Turn Off</a>');
        }
    },

	showDialog = function (title, content) {
		// Outputs a 5e Shaped dialog box for the GM
        var message = '/w GM &{template:5e-shaped} {{title=' + title + '}} {{content=' + content + '}}';
        sendChat('RemoveTheCorpse', message, null, {noarchive:true});
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
