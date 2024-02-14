# VoodooFrog's 5e Sheet Addons

This module adds some functionality to the new default 5e system sheet to show spell preparation information on the spells tab.

For each prepared caster defined in the module (Artificer, Cleric, Druid, Paladin, and Wizard) it will, by default, show a new column in the Spellcasting box at the top of the tab which gives the spell preparation limit for the class.

Furthermore, it does a very simple calculation of the total of all the spell preparation limits for each valid class on the character. This is then used to determine the colour of the spell preparation icons by each _preparable_ spell — green if the total limit is hit, and red if it is exceeded. Be aware, while I'd _love_ to have it accurately apply the preparation limit per spell for the class, the data is just not there.

There are some settings in the module too, so that these features can be turned on or off, and if you have any custom preparation style casting classes there is a menu in the settings to add their class names. Note that when entering these names you should use the name as it appears on the Spells tab of the sheet, title case and all. Again, this was the only way I could find to tie the sheet data to the actor data, but hey, it works!

Right now, this is just in beta, and I won't be submitting to the Foundry list until I'm sure it's fine.
