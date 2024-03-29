import { TJSGameSettings } from '#runtime/svelte/store/fvtt/settings';
import { lt as semverLessThan } from 'semver';
import { MODULE_ID, SETTINGS } from './constants';
import { EditClassesButton } from './applications/edit-classes-button.js';
import {
  renderSpellPrepChanges,
  createSpell,
  updateSpellForCharacter,
  deleteSpellFromManager
} from './spell-preparation.js';
import '../styles/styles.scss';

export const gameSettings = new TJSGameSettings(MODULE_ID);
export let originalFilterItems;
export let originalFilterItem;

const {
  ADDITIONAL_CLASS_NAMES,
  EDIT_CLASS_NAMES_MENU,
  SHOW_PREP_COLOURS,
  USE_CLASS_SOURCES,
  PREP_BAR_TOP,
  PREP_BAR_BOTTOM,
  IDENTIFY_PERMISSION,
  REMOVE_ATTUNEMENT,
  ADD_SPELL_MANAGER
} = SETTINGS;

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(MODULE_ID);
});

Hooks.once('init', async () => {
  await game.settings.registerMenu(MODULE_ID, EDIT_CLASS_NAMES_MENU, {
    name: `${MODULE_ID}.settings.${EDIT_CLASS_NAMES_MENU}.name`,
    label: `${MODULE_ID}.settings.${EDIT_CLASS_NAMES_MENU}.label`,
    icon: 'fas fa-bars',
    type: EditClassesButton,
    restricted: true
  });
  await gameSettings.registerAll([
    {
      namespace: MODULE_ID,
      key: ADDITIONAL_CLASS_NAMES,
      options: {
        name: `${MODULE_ID}.settings.${ADDITIONAL_CLASS_NAMES}.name`,
        scope: 'world',
        config: false,
        type: Array,
        default: []
      }
    },
    {
      namespace: MODULE_ID,
      key: SHOW_PREP_COLOURS,
      options: {
        name: `${MODULE_ID}.settings.${SHOW_PREP_COLOURS}.name`,
        hint: `${MODULE_ID}.settings.${SHOW_PREP_COLOURS}.hint`,
        scope: 'client',
        config: true,
        type: Boolean,
        default: true
      }
    },
    {
      namespace: MODULE_ID,
      key: USE_CLASS_SOURCES,
      options: {
        name: `${MODULE_ID}.settings.${USE_CLASS_SOURCES}.name`,
        hint: `${MODULE_ID}.settings.${USE_CLASS_SOURCES}.hint`,
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
      }
    },
    {
      namespace: MODULE_ID,
      key: ADD_SPELL_MANAGER,
      options: {
        name: `${MODULE_ID}.settings.${ADD_SPELL_MANAGER}.name`,
        hint: `${MODULE_ID}.settings.${ADD_SPELL_MANAGER}.hint`,
        scope: 'client',
        config: true,
        type: Boolean,
        default: false
      }
    },
    {
      namespace: MODULE_ID,
      key: PREP_BAR_TOP,
      options: {
        name: `${MODULE_ID}.settings.${PREP_BAR_TOP}.name`,
        hint: `${MODULE_ID}.settings.${PREP_BAR_TOP}.hint`,
        scope: 'client',
        config: true,
        type: Boolean,
        default: true
      }
    },
    {
      namespace: MODULE_ID,
      key: PREP_BAR_BOTTOM,
      options: {
        name: `${MODULE_ID}.settings.${PREP_BAR_BOTTOM}.name`,
        hint: `${MODULE_ID}.settings.${PREP_BAR_BOTTOM}.hint`,
        scope: 'client',
        config: true,
        type: Boolean,
        default: false
      }
    },
    {
      namespace: MODULE_ID,
      key: IDENTIFY_PERMISSION,
      options: {
        name: `${MODULE_ID}.settings.${IDENTIFY_PERMISSION}.name`,
        hint: `${MODULE_ID}.settings.${IDENTIFY_PERMISSION}.hint`,
        scope: 'world',
        config: true,
        type: Number,
        default: 3,
        choices: {
          [CONST.USER_ROLES.PLAYER]: 'USER.RolePlayer',
          [CONST.USER_ROLES.TRUSTED]: 'USER.RoleTrusted',
          [CONST.USER_ROLES.ASSISTANT]: 'USER.RoleAssistant',
          [CONST.USER_ROLES.GAMEMASTER]: 'USER.RoleGamemaster'
        }
      }
    },
    {
      namespace: MODULE_ID,
      key: REMOVE_ATTUNEMENT,
      options: {
        name: `${MODULE_ID}.settings.${REMOVE_ATTUNEMENT}.name`,
        hint: `${MODULE_ID}.settings.${REMOVE_ATTUNEMENT}.hint`,
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
      }
    }
  ]);
  CONFIG.debug.hooks = false;
});

Hooks.once('ready', () => {
  console.log('5e Sheet Addons | Ready');
});

Hooks.on('getActorSheetHeaderButtons', (sheet) => {
  // Store original functions for use in override
  if (!originalFilterItems) {
    originalFilterItems = sheet._filterItems;
  }
  if (!originalFilterItem) {
    originalFilterItem = sheet._filterItem;
  }
});

Hooks.on('renderActorSheet5eCharacter2', (sheet, [html], data) => {
  renderSpellPrepChanges(sheet, html, data);

  // Handle unidentified items
  const actor = data?.actor;
  const actorItems = actor?.items;
  const inventoryItems = $(html).find('section.inventory-list .item-list li.item');

  if (semverLessThan(game.system.version, '3.0.4')) {
    // Remove price from display
    inventoryItems.each((idx, i) => {
      const item = actorItems?.get(i.dataset?.itemId);
      const { identified } = item.system;
      if (!identified) {
        $(i).children('.item-price').empty().addClass('empty');
      }
    });
  }

  // Handle character sheet attunement control
  if (
    game.user.role < game.settings.get(MODULE_ID, IDENTIFY_PERMISSION) &&
    game.settings.get(MODULE_ID, REMOVE_ATTUNEMENT)
  ) {
    const attunable = inventoryItems.filter(() => {
      return $(this).has('[data-action="attune"]');
    });
    attunable.each((idx, i) => {
      const item = actorItems?.get(i.dataset?.itemId);
      const { identified } = item.system;
      if (!identified) {
        $(i).children('.item-controls').children('[data-action="attune"]').remove();
      }
    });
  }
});

// eslint-disable-next-line no-unused-vars
Hooks.on('createItem', async (item, config, userId) => {
  if (item.type === 'spell' && item.parent?.type === 'character') {
    createSpell(item);
  }
});

Hooks.on('updateItem', async (item, data) => {
  if (item.type === 'spell' && item.parent?.type === 'character') {
    updateSpellForCharacter(item, data);
  }
});

Hooks.on('deleteItem', async (item, data, itemId) => {
  if (item.type === 'spell' && item.parent?.type === 'character') {
    deleteSpellFromManager(item.parent.id, itemId);
  }
});

Hooks.on('renderItemSheet', (sheet, [html]) => {
  // Handle Identify toggle on Item Sheet
  if (game.user.role < game.settings.get(MODULE_ID, IDENTIFY_PERMISSION)) {
    if (sheet.item?.system?.identified === false) {
      html
        .querySelectorAll('.dnd5e.sheet.item .sheet-header .item-subtitle label.identified:has(input:not([disabled]))')
        .forEach((n) => n.remove());
    }
  }
});

Hooks.on('dnd5e.getItemContextOptions', (item, buttons) => {
  // Handle Identify option in Item Context menu on Actor Sheet
  if (game.user.role < game.settings.get(MODULE_ID, IDENTIFY_PERMISSION)) {
    if (item.system?.identified === false) {
      buttons.findSplice((e) => e.name === 'DND5E.Identify');

      // Handle Attune option in Item Context menu on Actor Sheet
      if (game.settings.get(MODULE_ID, REMOVE_ATTUNEMENT)) {
        buttons.findSplice((e) => e.name === 'DND5E.ContextMenuActionAttune');
      }
    }
  }
});
