import { TJSGameSettings } from '#runtime/svelte/store/fvtt/settings';
import { MODULE_ID, SETTINGS } from './constants';
import { EditClassesButton } from './applications/edit-classes-button.js';
import { renderSpellPrepChanges, createSpell, updateSpellForCharacter } from './spell-preparation.js';
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
  PREP_BAR_BOTTOM
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
