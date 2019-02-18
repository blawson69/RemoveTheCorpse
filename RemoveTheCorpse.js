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

    var version = '1.1',
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
        var message = '<h4>!rtc &lt;token_id&gt;</h4>Manually removes the token with '
        + 'the matching id from the turn tracker.<br><br><h4>Auto Remove</h4>';
        if (state['RemoveTheCorpse'].autoRemove) {
            message += 'You are currently configured to automatically remove a token from the turn tracker whenever the Dead Marker is applied to it.<br><div align="center"><a style="' + styles.button + '" href="!rtc toggleAuto">Turn Off</a></div>';
        } else {
            message += 'You are currently configured only for manual removal of tokens from the turn tracker. If you wish to automatically remove tokens '
            + 'when the Dead Marker is set on them, you may do so. This applies to <i>all</i> tokens.<br><div align="center"><a style="' + styles.button + '" href="!rtc toggleAuto">Turn On</a></div>';
        }
        message += '<h4>Dead Marker</h4>The current status marker to indicate a dead token is set to <b><i>"' + state['RemoveTheCorpse'].deadMarker + '"</i></b>.<br>'
        + '<div align="center"><a style="' + styles.button + '" href="!rtc setMarker &#63;&#123;Status Marker&#124;dead&#124;red&#124;death-zone&#124;skull&#124;broken-skull&#124;angel-outfit&#125;">Change Marker</a></div>';
        showDialog('Help Menu', message);
    },

    setMarker = function (marker) {
        var status_markers = ['blue', 'brown', 'green', 'pink', 'purple', 'red', 'yellow', 'all-for-one', 'angel-outfit', 'archery-target', 'arrowed', 'aura', 'back-pain', 'black-flag', 'bleeding-eye', 'bolt-shield', 'broken-heart', 'broken-shield', 'broken-skull', 'chained-heart', 'chemical-bolt', 'cobweb', 'dead', 'death-zone', 'drink-me', 'edge-crack', 'fishing-net', 'fist', 'fluffy-wing', 'flying-flag', 'frozen-orb', 'grab', 'grenade', 'half-haze', 'half-heart', 'interdiction', 'lightning-helix', 'ninja-mask', 'overdrive', 'padlock', 'pummeled', 'radioactive', 'rolling-bomb', 'screaming', 'sentry-gun', 'skull', 'sleepy', 'snail', 'spanner', 'stopwatch', 'strong', 'three-leaves', 'tread', 'trophy', 'white-tower'];
        if (_.find(status_markers, function (tmp) {return tmp === marker; })) {
            state['RemoveTheCorpse'].deadMarker = marker;
        } else {
            showDialog('Error', '"' + marker + '" is an invalid status marker. Try again.');
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
