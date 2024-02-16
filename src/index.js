import { writable } from 'svelte/store';
import { TJSDocument } from '#runtime/svelte/store/fvtt/document';
import { MODULE_ID, PREP_SELECTOR, SETTINGS } from './constants';
import { EditClasses } from './edit-classes';
import SpellBookManager from './spellbook-manager.js';
import '../styles/styles.scss';

const { ADDITIONAL_CLASS_NAMES, EDIT_CLASS_NAMES_MENU, SHOW_PREP_NUMBER, SHOW_PREP_COLOURS } = SETTINGS;

export const getPreparedCasterNames = () => [
  game.i18n.localize(`${MODULE_ID}.class-names.artificer`),
  game.i18n.localize(`${MODULE_ID}.class-names.cleric`),
  game.i18n.localize(`${MODULE_ID}.class-names.druid`),
  game.i18n.localize(`${MODULE_ID}.class-names.paladin`),
  game.i18n.localize(`${MODULE_ID}.class-names.wizard`),
  ...game.settings.get(MODULE_ID, ADDITIONAL_CLASS_NAMES)
];

const getLimit = (actor, scData) => {
  const spellcastingClass = Object.values(actor?.classes).find((c) => {
    return scData?.label === game.i18n.localize('DND5E.SpellcastingClass').replace('{class}', c.name);
  });
  const {
    system: { levels }
  } = spellcastingClass;
  return levels + scData?.ability?.value;
};
export const spellStore = writable([]);

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(MODULE_ID);
});

Hooks.once('init', async () => {
  await game.settings.register(MODULE_ID, ADDITIONAL_CLASS_NAMES, {
    name: `${MODULE_ID}.settings.${ADDITIONAL_CLASS_NAMES}.name`,
    hint: `${MODULE_ID}.settings.${ADDITIONAL_CLASS_NAMES}.hint`,
    scope: 'world',
    config: false,
    type: Array,
    default: ['foo', 'bar']
  });
  await game.settings.registerMenu(MODULE_ID, EDIT_CLASS_NAMES_MENU, {
    name: `${MODULE_ID}.settings.${EDIT_CLASS_NAMES_MENU}.name`,
    label: `${MODULE_ID}.settings.${EDIT_CLASS_NAMES_MENU}.label`,
    icon: 'fas fa-bars',
    type: EditClasses
  });
  await game.settings.register(MODULE_ID, SHOW_PREP_NUMBER, {
    name: `${MODULE_ID}.settings.${SHOW_PREP_NUMBER}.name`,
    hint: `${MODULE_ID}.settings.${SHOW_PREP_NUMBER}.hint`,
    scope: 'client',
    config: true,
    type: Boolean,
    default: true
  });
  await game.settings.register(MODULE_ID, SHOW_PREP_COLOURS, {
    name: `${MODULE_ID}.settings.${SHOW_PREP_COLOURS}.name`,
    hint: `${MODULE_ID}.settings.${SHOW_PREP_COLOURS}.hint`,
    scope: 'client',
    config: true,
    type: Boolean,
    default: true
  });
});

Hooks.once('ready', () => {
  console.log('5e Sheet Addons | Ready');
  // const actor = new TJSDocument(game.actors.get('ikQVvGJuzZu4r4Fv'));
  // new SpellBookManager({ svelte: { props: { actor } } }).render(true, { focus: true });
});

// .dnd5e2.sheet.actor.character .sheet-header > .right > div:last-child
// $("p").css("background-color", "yellow");
Hooks.on('renderActorSheet5eCharacter2', (_, [html], data) => {
  const spellTab = $(html).find('form.interactable');
  spellTab.append(`
    <button type="button" class="spells-manage gold-button" aria-label="Manage Spell Sources">
      <i class="fas fa-feather"></i>
    </button>
  `);
  if (data?.spellcasting) {
    let totalLimit = 0;
    for (const sc of data.spellcasting) {
      const { label } = sc;
      if (getPreparedCasterNames().some((cn) => label.includes(cn))) {
        const limit = getLimit(data?.actor, sc);
        totalLimit += limit;
        if (game.settings.get(MODULE_ID, SHOW_PREP_NUMBER)) {
          const spellcastingBox = $(html).find(`.spellcasting.card:contains(${label}) .info`);
          spellcastingBox.append(`
            <div class="preparation">
              <span class="label">${game.i18n.localize(`${MODULE_ID}.spellcasting.prep-limit`)}</span>
              <span class="value">${limit}</span>
            </div>
        `);
        }
      }
    }
    if (game.settings.get(MODULE_ID, SHOW_PREP_COLOURS)) {
      if (data?.preparedSpells === totalLimit) {
        $(html).find(PREP_SELECTOR).addClass('prep-limit');
      } else if (data?.preparedSpells > totalLimit) {
        $(html).find(PREP_SELECTOR).addClass('prep-exceeded');
      }
    }
  }
});

Hooks.on('createItem', async (item, options, userId) => {
  // TODO: Create an application that will allow for setting sources
  // const actor = game.actors.get('ikQVvGJuzZu4r4Fv');
  // new SpellBookManager({ svelte: { props: { actor } } }).render(true, { focus: true });
});
