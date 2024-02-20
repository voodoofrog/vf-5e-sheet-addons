import { writable } from 'svelte/store';
import { TJSGameSettings } from '#runtime/svelte/store/fvtt/settings';
import { MODULE_ID, PREP_SELECTOR, SETTINGS, FLAGS } from './constants';
import { EditClassesButton } from './applications/edit-classes-button.js';
import SpellPrepBar from './components/SpellPrepBar.svelte';
import '../styles/styles.scss';

export const spellStore = writable([]);
export const gameSettings = new TJSGameSettings(MODULE_ID);
let originalFilterItems;
let originalFilterItem;

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

export const getValidClasses = (actor) =>
  Object.values(actor?.classes).filter((c) => getPreparedCasterNames().includes(c.name));

export const getPrepLimit = (actor, spellcastingClass) => {
  const {
    system: {
      levels,
      spellcasting: { ability }
    }
  } = spellcastingClass;
  return levels + actor?.system?.abilities?.[ability]?.mod;
};

export const getPrepLimitsTotal = (actor) => {
  let result = 0;
  const classes = getValidClasses(actor);

  for (const c of classes) {
    result += getPrepLimit(actor, c);
  }

  return result;
};

const filterClickHandler = (event) => {
  const filter = $(event?.currentTarget)?.data('filter');
  const sheet = event?.data;
  if (sheet._filters.spellbook.properties.has(filter)) {
    sheet._filters.spellbook.properties.delete(filter);
  } else {
    sheet._filters.spellbook.properties.add(filter);
  }
  sheet.render();
};

const addSpellPrepBar = (target, actor) => {
  new SpellPrepBar({
    target: target.parentElement,
    anchor: target,
    props: { actor }
  });
  target.remove();
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
  await gameSettings.registerAll([
    {
      namespace: MODULE_ID,
      key: ADDITIONAL_CLASS_NAMES,
      options: {
        name: `${MODULE_ID}.settings.${ADDITIONAL_CLASS_NAMES}.name`,
        scope: 'world',
        config: false,
        type: Array,
        default: ['foo', 'bar']
      }
    },
    {
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
  const spellListControls = $(html).find('item-list-controls[for="spellbook"]');
  const actor = data?.actor;
  const div = document.createElement('div');
  spellListControls.before(div);
  addSpellPrepBar(div, actor);

  if (game.settings.get(MODULE_ID, USE_CLASS_SOURCES)) {
    // Add new filter options for valid classes
    const spellListCards = $(html).find('.spells-list .card');
    const actorItems = actor?.items;
    const spellItems = spellListCards.find('.item-list li');
    const filterList = spellListControls.find('search .filter-list');
    const prepText = game.i18n.localize(`${MODULE_ID}.spellcasting.preparable`);
    for (const c of getValidClasses(actor).map((vc) => vc.name)) {
      const enabled = sheet._filters.spellbook.properties.has(c);
      filterList.append(`
        <li>
          <button type="button" class="filter-item ${enabled ? 'active' : ''}" data-filter="${c}">${c} ${prepText}</button>
        </li>
      `);
      filterList.find(`button[data-filter="${c}"]`).on('click', sheet, filterClickHandler);
    }

    // Add data attribute to spells
    spellListCards
      .not('[data-level="0"]')
      .find('.item-list li')
      .each((idx, s) => {
        const source = actorItems?.get(s.dataset?.itemId)?.getFlag(MODULE_ID, FLAGS.SPELL_SOURCE);
        $(s).attr('data-spell-source', `${source}`);
      });

    // Render the active filters
    sheet._filterItems = (items, filters) => {
      const retVal = originalFilterItems.call({ _filterItem: originalFilterItem, actor }, items, filters);
      const sources = new Set(getPreparedCasterNames());

      return retVal.filter((item) => {
        const sourcesFilter = sources.intersection(filters);
        if (sourcesFilter.size && !sourcesFilter.has(item.getFlag(MODULE_ID, FLAGS.SPELL_SOURCE))) return false;
        return true;
      });
    };

    // Add source name to spell subtitles
    spellItems.each((idx, s) => {
      const source = actorItems?.get(s.dataset?.itemId)?.getFlag(MODULE_ID, FLAGS.SPELL_SOURCE);
      if (source) {
        $(s).find('.subtitle').append(` (${source})`);
      }
    });
  }

  if (data?.spellcasting) {
    const totalLimit = getPrepLimitsTotal(data?.actor);

    if (game.settings.get(MODULE_ID, SHOW_PREP_COLOURS)) {
      const spellItems = $('.card[data-type="spell"]').not('[data-level="0"]').find('.item-list');

      if (game.settings.get(MODULE_ID, USE_CLASS_SOURCES)) {
        // Add classes for prep limits display for sourced spells
        const classes = getValidClasses(actor);
        for (const cn of classes.map((vc) => vc.name)) {
          const prepLimits = actor?.getFlag(MODULE_ID, FLAGS.PREP_LIMITS);
          const currentPrepped = typeof prepLimits?.[cn] === 'number' ? prepLimits?.[cn] : prepLimits?.[cn]?.current;
          const classItem = classes.find((c) => c.name === cn);
          const classMaxPrepped = getPrepLimit(data?.actor, classItem);
          if (currentPrepped >= classMaxPrepped) {
            const itemEntry = spellItems.find(`.item[data-spell-source="${cn}"]`);
            if (currentPrepped > classMaxPrepped) {
              itemEntry.find(PREP_SELECTOR).addClass('prep-exceeded');
              itemEntry.addClass('prep-exceeded');
            } else {
              itemEntry.find(PREP_SELECTOR).addClass('prep-limit');
              itemEntry.addClass('prep-limit');
            }
          }
        }
      } else {
        // Add classes for simple prep limits display
        const prepSelector = spellItems.find(PREP_SELECTOR);
        const itemEntry = spellItems.find('.item');

        if (data?.preparedSpells === totalLimit) {
          prepSelector.addClass('prep-limit');
          itemEntry.addClass('prep-limit');
        } else if (data?.preparedSpells > totalLimit) {
          prepSelector.addClass('prep-exceeded');
          itemEntry.addClass('prep-exceeded');
        }
      }
    }
  }
});

/* Hooks.on('createItem', async (item, config, userId) => {
   if (item.type === 'spell' && item.parent?.type === 'character') {
    const actor = new TJSDocument(item.parent);
    new SpellBookManager({ svelte: { props: { actor, minLevel: 1 } } }).render(true, { focus: true });
  }
});*/

// TODO: investigate how this will interact with characters who have prepared spells but no sources
Hooks.on('updateItem', async (item, data) => {
  if (item.type === 'spell' && item.parent?.type === 'character') {
    const source = item.getFlag(MODULE_ID, FLAGS.SPELL_SOURCE);

    if (getPreparedCasterNames().includes(source)) {
      const prepLimits = item.parent.getFlag(MODULE_ID, FLAGS.PREP_LIMITS) || {};
      const wasPrepped = data?.system?.preparation?.prepared;
      const existingValue =
        typeof prepLimits?.[source] === 'number' ? prepLimits?.[source] : prepLimits?.[source]?.current;
      const current = existingValue || 0;
      prepLimits[source] = wasPrepped ? current + 1 : Math.max(0, current - 1);
      item.parent.setFlag(MODULE_ID, FLAGS.PREP_LIMITS, prepLimits);
    }
  }
});
