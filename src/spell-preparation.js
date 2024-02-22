import { writable } from 'svelte/store';
import { MODULE_ID, PREP_SELECTOR, SETTINGS, FLAGS } from './constants';
import SpellPrepBar from './components/SpellPrepBar.svelte';
import { originalFilterItems, originalFilterItem } from './index';

const { ADDITIONAL_CLASS_NAMES, SHOW_PREP_COLOURS, USE_CLASS_SOURCES, PREP_BAR_TOP, PREP_BAR_BOTTOM } = SETTINGS;

export const spellStore = writable([]);

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

export const getCurrentlyPrepped = (actor, className) => {
  const prepLimits = actor?.getFlag(MODULE_ID, FLAGS.PREP_LIMITS) || {};
  return typeof prepLimits?.[className] === 'number' ? prepLimits?.[className] : prepLimits?.[className]?.current;
};

export const prepComparator = (actor, spellcastingClass) => {
  const current = getCurrentlyPrepped(actor, spellcastingClass.name);
  const limit = getPrepLimit(actor, spellcastingClass);
  return current - limit;
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

export const renderSpellPrepChanges = (sheet, html, data) => {
  const spellListControls = $(html).find('item-list-controls[for="spellbook"]');
  const actor = data?.actor;
  const spellsList = $(html).find('section.spells-list');

  if (game.settings.get(MODULE_ID, PREP_BAR_TOP) && getValidClasses(actor).length > 0) {
    // Add the spell prep bar to to the top
    const div = document.createElement('div');
    spellListControls.before(div);
    addSpellPrepBar(div, actor);
  }

  if (game.settings.get(MODULE_ID, USE_CLASS_SOURCES)) {
    // Add new filter options for valid classes
    const spellListCards = spellsList.find('.card');
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

    if (game.settings.get(MODULE_ID, PREP_BAR_BOTTOM) && getValidClasses(actor).length > 0) {
      // Add the spell prep bar to to the bottom
      const div = document.createElement('div');
      spellsList.after(div);
      addSpellPrepBar(div, actor);
    }
  }

  if (getValidClasses(actor).length > 0) {
    const totalLimit = getPrepLimitsTotal(data?.actor);

    if (game.settings.get(MODULE_ID, SHOW_PREP_COLOURS)) {
      const spellItems = $('.card[data-type="spell"]').not('[data-level="0"]').find('.item-list');

      if (game.settings.get(MODULE_ID, USE_CLASS_SOURCES)) {
        // Add classes for prep limits display for sourced spells
        const classes = getValidClasses(actor);
        for (const cn of classes.map((vc) => vc.name)) {
          const classItem = classes.find((c) => c.name === cn);
          const prepComparison = prepComparator(actor, classItem);
          if (prepComparison >= 0) {
            const itemEntry = spellItems.find(`.item[data-spell-source="${cn}"]`);
            if (prepComparison > 0) {
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
};

// eslint-disable-next-line no-unused-vars
export const createSpell = (item) => {
  // const actor = new TJSDocument(item.parent);
  // new SpellBookManager({ svelte: { props: { actor, minLevel: 1 } } }).render(true, { focus: true });
};

// TODO: investigate how this will interact with characters who have prepared spells but no sources
export const updateSpellForCharacter = (item, data) => {
  const source = item.getFlag(MODULE_ID, FLAGS.SPELL_SOURCE);

  if (getPreparedCasterNames().includes(source)) {
    const actor = item.parent;
    const prepLimits = actor?.getFlag(MODULE_ID, FLAGS.PREP_LIMITS) || {};
    const wasPrepped = data?.system?.preparation?.prepared;
    const existingValue = getCurrentlyPrepped(actor, source);
    const current = existingValue || 0;
    prepLimits[source] = wasPrepped ? current + 1 : Math.max(0, current - 1);
    actor?.setFlag(MODULE_ID, FLAGS.PREP_LIMITS, prepLimits);
  }
};