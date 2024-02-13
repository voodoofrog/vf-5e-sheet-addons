import { MODULE_ID, PREP_SELECTOR } from './constants';
import '../styles/styles.css';

const getPreparedCasterNames = () => [
  game.i18n.localize(`${MODULE_ID}.class-names.artificer`),
  game.i18n.localize(`${MODULE_ID}.class-names.cleric`),
  game.i18n.localize(`${MODULE_ID}.class-names.druid`),
  game.i18n.localize(`${MODULE_ID}.class-names.paladin`),
  game.i18n.localize(`${MODULE_ID}.class-names.wizard`)
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

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(MODULE_ID);
});

Hooks.once('init', async () => {});

Hooks.once('ready', () => {
  console.log('5e Sheet Addons | Ready');
});

Hooks.on('renderActorSheet5eCharacter2', (_, [html], data) => {
  if (data?.spellcasting) {
    let totalLimit = 0;
    for (const sc of data.spellcasting) {
      const { label } = sc;
      if (getPreparedCasterNames().some((cn) => label.includes(cn))) {
        const spellcastingBox = $(html).find(`.spellcasting.card:contains(${label}) .info`);
        const limit = getLimit(data?.actor, sc);
        totalLimit += limit;
        spellcastingBox.append(`
        <div class="preparation">
           <span class="label">${game.i18n.localize(`${MODULE_ID}.spellcasting.prep-limit`)}</span>
           <span class="value">${limit}</span>
        </div>
        `);
      }
    }
    if (data?.preparedSpells === totalLimit) {
      $(html).find(PREP_SELECTOR).addClass('prep-limit');
    } else if (data?.preparedSpells > totalLimit) {
      $(html).find(PREP_SELECTOR).addClass('prep-exceeded');
    }
  }
});
