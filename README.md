# VoodooFrog's 5e Sheet Addons

![GitHub Downloads (specific asset, latest release)](https://img.shields.io/github/downloads/voodoofrog/vf-5e-sheet-addons/latest/module.zip?style=for-the-badge&logo=github&label=Downloads%20(Latest%20Release)&color=%2388ff00)
![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fgithub.com%2Fvoodoofrog%2Fvf-5e-sheet-addons%2Freleases%2Fdownload%2F1.0.0-beta.2%2Fmodule.json&query=%24.compatibility.minimum&style=for-the-badge&label=Foundry%20Version&color=%23FF6E20)


## Basic Information

This module adds some functionality to the new default 5e system sheet to show spell preparation information on the spells tab.

For each prepared caster defined in the module (Artificer, Cleric, Druid, Paladin, and Wizard) it will, by default, show a bar at the top of the Spells tab which gives the spell preparation limit for the class.

Even better, it includes a means to set the class source of your spells so that you can actually see when you are hitting the limits or exceeding the preparation limits for each of your prepared caster classes. Or if you prefer you can set it to do a very simple calculation of the total of all the spell preparation limits for each valid class on the character. Either way, the limits are then used to determine the colour of the spell preparation icons by each _preparable_ spell — green if the total limit is hit, and red if it is exceeded.

There are settings in the module too, so that these features can be turned on or off, and if you have any custom preparation style casting classes there is a menu in the settings to add their class names. Note that when entering these names you should use the name as it appears on the Spells tab of the sheet, title case and all. This was the only way I could find to tie the sheet data to the actor data, but hey, it works!

Right now, this is just in beta, and I won't be submitting to the Foundry list until I'm sure it's fine and I have written proper documentation.

## Install
Manifest: `https://github.com/voodoofrog/vf-5e-sheet-addons/releases/latest/download/module.json`

### The Module In Action
![a screenshot of the module in action](screenshot.png)
