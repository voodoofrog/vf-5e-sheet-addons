import { writable } from 'svelte/store';
import { TJSDocument } from '#runtime/svelte/store/fvtt/document';
import { TJSGameSettings } from '#runtime/svelte/store/fvtt/settings';
import { MODULE_ID, PREP_SELECTOR, SETTINGS } from './constants';
import { EditClassesButton } from './applications/edit-classes-button.js';
import SpellBookManager from './applications/spellbook-manager.js';
import '../styles/styles.scss';

export const spellStore = writable([]);
export const gameSettings = new TJSGameSettings(MODULE_ID);

const { ADDITIONAL_CLASS_NAMES, EDIT_CLASS_NAMES_MENU, SHOW_PREP_NUMBER, SHOW_PREP_COLOURS, USE_CLASS_SOURCES } =
  SETTINGS;

export const getPreparedCasterNames = () => [
  game.i18n.localize(`${MODULE_ID}.class-names.artificer`),
  game.i18n.localize(`${MODULE_ID}.class-names.cleric`),
  game.i18n.localize(`${MODULE_ID}.class-names.druid`),
  game.i18n.localize(`${MODULE_ID}.class-names.paladin`),
  game.i18n.localize(`${MODULE_ID}.class-names.wizard`),
  ...game.settings.get(MODULE_ID, ADDITIONAL_CLASS_NAMES)
];

const getSpellcastingClassBySource = (actor, source) => Object.values(actor?.classes).find((c) => source === c.name);
const getSpellcastingClassByLabel = (actor, label) =>
  Object.values(actor?.classes).find(
    (c) => label === game.i18n.localize('DND5E.SpellcastingClass').replace('{class}', c.name)
  );

const getLimit = (actor, { source, label }) => {
  let spellcastingClass;

  if (source) {
    spellcastingClass = getSpellcastingClassBySource(actor, source);
  } else if (label) {
    spellcastingClass = getSpellcastingClassByLabel(actor, label);
  } else {
    throw new Error('getLimit error: must supply source or label.');
  }

  const {
    system: {
      levels,
      spellcasting: { ability }
    }
  } = spellcastingClass;
  return levels + actor?.system?.abilities?.[ability]?.mod;
};

const spellManagerButtonHandler = (event) => {
  const data = event.data;
  const actor = new TJSDocument(data.actor);
  new SpellBookManager({ svelte: { props: { actor, minLevel: 1 } } }).render(true, { focus: true });
};

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(MODULE_ID);
});

Hooks.once('init', async () => {
  await game.settings.registerMenu(MODULE_ID, EDIT_CLASS_NAMES_MENU, {
    name: `${MODULE_ID}.settings.${EDIT_CLASS_NAMES_MENU}.name`,
    label: `${MODULE_ID}.settings.${EDIT_CLASS_NAMES_MENU}.label`,
    icon: 'fas fa-bars',
    type: EditClassesButton
  });
  await gameSettings.register({
    namespace: MODULE_ID,
    key: ADDITIONAL_CLASS_NAMES,
    options: {
      name: `${MODULE_ID}.settings.${ADDITIONAL_CLASS_NAMES}.name`,
      hint: `${MODULE_ID}.settings.${ADDITIONAL_CLASS_NAMES}.hint`,
      scope: 'world',
      config: false,
      type: Array,
      default: ['foo', 'bar']
    }
  });
  await gameSettings.register({
    namespace: MODULE_ID,
    key: SHOW_PREP_NUMBER,
    options: {
      name: `${MODULE_ID}.settings.${SHOW_PREP_NUMBER}.name`,
      hint: `${MODULE_ID}.settings.${SHOW_PREP_NUMBER}.hint`,
      scope: 'client',
      config: true,
      type: Boolean,
      default: true
    }
  });
  await gameSettings.register({
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
  });
  await gameSettings.register({
    namespace: MODULE_ID,
    key: USE_CLASS_SOURCES,
    options: {
      scope: 'world',
      config: false,
      type: Boolean,
      default: true
    }
  });
  CONFIG.debug.hooks = false;
});

Hooks.once('ready', () => {
  console.log('5e Sheet Addons | Ready');
});

Hooks.on('renderActorSheet5eCharacter2', (_, [html], data) => {
  if (game.settings.get(MODULE_ID, USE_CLASS_SOURCES)) {
    const spellSearch = $(html).find('item-list-controls[for="spellbook"] search ul.unlist.controls');
    spellSearch.append(`
      <li>
        <button type="button" class="spells-manage unbutton filter-control active" aria-label="Manage Spell Sources">
          <i class="fas fa-feather"></i>
        </button>
      </li>
    `);
    spellSearch.find('.spells-manage').on('click', { actor: data.actor }, spellManagerButtonHandler);

    $(html)
      .find('.spells-list .card')
      .not('[data-level="0"]')
      .find('.item-list li')
      .each((idx, s) => {
        const source = data?.actor?.items?.get(s.dataset?.itemId)?.getFlag(MODULE_ID, 'source');
        $(s).attr('data-spell-source', `${source}`);
      });

    $(html)
      .find('.spells-list .card .item-list li')
      .each((idx, s) => {
        const source = data?.actor?.items?.get(s.dataset?.itemId)?.getFlag(MODULE_ID, 'source');
        if (source) {
          $(s).find('.subtitle').append(` (${source})`);
        }
      });

    const filterList = $(html).find('item-list-controls[for="spellbook"] search .filter-list');
    for (const c of getPreparedCasterNames()) {
      filterList.append(`
        <li>
          <button type="button" class="filter-item" data-filter="${c}">${c}</button>
        </li>
      `);
    }
  }
  if (data?.spellcasting) {
    let totalLimit = 0;

    for (const sc of data.spellcasting) {
      const { label } = sc;
      if (getPreparedCasterNames().some((cn) => label.includes(cn))) {
        const limit = getLimit(data?.actor, { label: sc?.label });
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
      if (game.settings.get(MODULE_ID, USE_CLASS_SOURCES)) {
        for (const cn of getPreparedCasterNames()) {
          const limit = data?.actor?.getFlag(MODULE_ID, 'prepLimits')?.[cn];
          if (limit?.current >= limit?.max) {
            const prepSelector = $(html).find(`.item[data-spell-source="${cn}"] ${PREP_SELECTOR}`);
            if (limit?.current > limit?.max) {
              prepSelector.addClass('prep-exceeded');
            } else {
              prepSelector.addClass('prep-limit');
            }
          }
        }
      } else {
        const prepSelector = $(html).find(PREP_SELECTOR);
        if (data?.preparedSpells === totalLimit) {
          prepSelector.addClass('prep-limit');
        } else if (data?.preparedSpells > totalLimit) {
          prepSelector.addClass('prep-exceeded');
        }
      }
    }
  }
});

// Hooks.on('createItem', async (item, options, userId) => {});

// TODO: investigate how this will interact with characters who have prepared spells but no sources
Hooks.on('updateItem', async (item, data) => {
  if (item.type === 'spell' && item.parent?.type === 'character') {
    const source = item.getFlag(MODULE_ID, 'source');
    if (getPreparedCasterNames().includes(source)) {
      const prepLimits = item.parent.getFlag(MODULE_ID, 'prepLimits') || {};
      const limit = getLimit(item.parent, { source });
      const wasPrepped = data?.system?.preparation?.prepared;
      const current = prepLimits[source]?.current || 0;
      prepLimits[source] = {
        max: limit,
        current: wasPrepped ? current + 1 : Math.max(0, current - 1)
      };
      item.parent.setFlag(MODULE_ID, 'prepLimits', prepLimits);
    }
  }
});
