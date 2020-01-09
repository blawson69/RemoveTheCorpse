# RemoveTheCorpse

> **New in v1.3:** RemoveTheCorpse has been updated to support the new [custom token markers](https://wiki.roll20.net/Custom_Token_Markers).

This [Roll20](http://roll20.net/) script removes tokens from the turn tracker, and was created to be used in conjunction with other scripts during combat to prevent deceased characters from being left in the turn tracker after they die. Tokens can be removed manually through a command or you can set the script to remove tokens whenever a designated Dead Marker is set on them.

## Config

Typing `!rtc help` or `!rtc config` in the chat will display a Config Menu that gives you the syntax for manual removal of tokens. It also displays the current configuration option settings and provides links to change those settings.

## Dead Marker

RemoveTheCorpse looks for a particular status marker when in Auto Removal mode. This Dead Marker defaults to the "dead" status marker (the big red X) but can be changed to any custom token marker you wish to use. The Config Menu provides a "Choose Marker" button to display all token markers *including custom token markers* for easy selection, or you can use the "set manually" link to provide the name or name::ID combo for any valid status markers.

## Manual Removal
To manually remove a token from the turn tracker, type `!rtc <token_id>` into chat. Use `@{selected|token_id}` or any other method of passing the token id. This method does *not* rely on the Dead Marker. Only one token id can be removed at a time.

## Auto Removal
You may set RemoveTheCorpse to automatically remove tokens from the turn tracker whenever the Dead Marker is set on a token. The default setting is OFF. The Config Menu has a link for toggling this feature on and off, and you can also send `!rtc toggleAuto` to chat as well.

RemoveTheCorpse listens for status marker changes made through the TokenMod, CombatTracker, and DeathTracker scripts, so be aware of this when configuring this script.
