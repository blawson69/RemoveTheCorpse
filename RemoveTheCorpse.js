/*
RemoveTheCorpse
Removes tokens marked "dead" from the Turn Tracker

On Github:	https://github.com/blawson69
Contact me: https://app.roll20.net/users/1781274/ben-l

Like this script? Become a patron:
    https://www.patreon.com/benscripts
*/

var RemoveTheCorpse = RemoveTheCorpse || (function () {
    'use strict';

    //---- INFO ----//

    var version = '1.3.1',
    debugMode = false,
    MARKERS,
    ALT_MARKERS = [{name:'red', tag: 'red', url:"#C91010"}, {name: 'blue', tag: 'blue', url: "#1076C9"}, {name: 'green', tag: 'green', url: "#2FC910"}, {name: 'brown', tag: 'brown', url: "#C97310"}, {name: 'purple', tag: 'purple', url: "#9510C9"}, {name: 'pink', tag: 'pink', url: "#EB75E1"}, {name: 'yellow', tag: 'yellow', url: "#E5EB75"}, {name: 'dead', tag: 'dead', url: "X"}],
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
        MARKERS = JSON.parse(Campaign().get("token_markers"));
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
            message += 'You are currently configured to automatically remove a token from the turn tracker whenever the Dead Marker is applied to it.<br><div align="center"><a style="'
            + styles.button + '" href="!rtc toggleAuto">Turn Off</a></div>';
        } else {
            message += 'You are currently configured only for manual removal of tokens from the turn tracker. If you wish to automatically remove tokens '
            + 'when the Dead Marker is set on them, you may do so. This applies to <i>all</i> tokens.<br><div align="center"><a style="' + styles.button
            + '" href="!rtc toggleAuto">Turn On</a></div>';
        }

        var curr_marker = _.find(MARKERS, function (x) { return x.tag == state['RemoveTheCorpse'].deadMarker; });
        if (typeof curr_marker == 'undefined') curr_marker = _.find(ALT_MARKERS, function (x) { return x.tag == state['RemoveTheCorpse'].deadMarker; });

        message += '<h4>Dead Marker</h4>' + getMarker(curr_marker, marker_style);
        if (typeof curr_marker == 'undefined') message += '<b style="color: #c00;">Warning:</b> The token marker "' + state['RemoveTheCorpse'].deadMarker + '" is invalid!';
        else message += 'The current status marker to indicate a dead token during auto removal is "' + curr_marker.name + '".<br>';

        message += '<div align="center"><a style="' + styles.button + '" href="!rtc markers" title="This may be a very long list...">Choose Marker</a></div>';
        message += '<div style="text-align: center;"><a style="' + styles.textButton + '" href="!rtc setMarker &#63;&#123;Status Marker&#124;&#125;">Set manually</a></div>';
        showDialog('Help Menu', message);
    },

    setMarker = function (marker) {
        marker = marker.replace('=', '::');
        var status_markers = _.pluck(MARKERS, 'tag');
        _.each(_.pluck(ALT_MARKERS, 'tag'), function (x) { status_markers.push(x); });
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
        var message = '<table style="border: 0; width: 100%;" cellpadding="0" cellspacing="2">';
        _.each(ALT_MARKERS, function (marker) {
            message += '<tr><td>' + getMarker(marker, 'margin-right: 10px;') + '</td><td style="white-space: nowrap; width: 100%;">' + marker.name + '</td>';
            if (marker.tag == state['RemoveTheCorpse'].deadMarker) {
                message += '<td style="text-align: center;">Current</td>';
            } else {
                message += '<td style="text-align: center; white-space: nowrap; padding: 2px;"><a style="' + styles.button + '" href="!rtc setMarker ' + marker.tag + '">Set Marker</a></td>';
            }
            message += '</tr>';
        });

        _.each(MARKERS, function (icon) {
            message += '<tr><td>' + getMarker(icon, 'margin-right: 10px;') + '</td><td style="white-space: nowrap; width: 100%;">' + icon.name + '</td>';
            if (icon.tag == state['RemoveTheCorpse'].deadMarker) {
                message += '<td style="text-align: center;">Current</td>';
            } else {
                message += '<td style="text-align: center; white-space: nowrap; padding: 2px;"><a style="' + styles.button + '" href="!rtc setMarker ' + icon.tag.replace('::','=') + '">Set Marker</a></td>';
            }
            message += '</tr>';
        });

        message += '<tr><td colspan="3" style="text-align: center; padding: 2px;"><a style="' + styles.button + '" href="!rtc help">&#9668; Back</a></td></tr>';
        message += '</table>';
        showDialog('Choose Dead Marker', message);
    },

    getMarker = function (marker, style = '') {
        var marker_style = 'width: 24px; height: 24px;' + style;
        var return_marker = '<img src="" width="24" height="24" style="' + marker_style + ' border: 1px solid #ccc;" alt=" " />';
        if (typeof marker != 'undefined' && typeof marker.tag != 'undefined') {
            var status_markers = _.pluck(MARKERS, 'tag'),
            alt_marker = _.find(ALT_MARKERS, function (x) { return x.tag == marker.tag; });

            if (_.find(status_markers, function (x) { return x == marker.tag; })) {
                var icon = _.find(MARKERS, function (x) { return x.tag == marker.tag; });
                return_marker = '<img src="' + icon.url + '" width="24" height="24" style="' + marker_style + '" />';
            } else if (typeof alt_marker !== 'undefined') {
                if (alt_marker.url === 'X') {
                    marker_style += 'color: #C91010; font-size: 30px; line-height: 24px; font-weight: bold; text-align: center; padding-top: 0px; overflow: hidden;';
                    return_marker = '<div style="' + marker_style + '">X</div>';
                } else {
                    marker_style += 'background-color: ' + alt_marker.url + '; border: 1px solid #fff; border-radius: 50%;';
                    return_marker = '<div style="' + marker_style + '"></div>';
                }
            }
        }
        return return_marker;
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
