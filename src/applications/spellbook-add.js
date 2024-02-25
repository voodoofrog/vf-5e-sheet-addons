import { MODULE_ID, SPELL_MANAGER } from '../constants';
import { spellStores } from '../spell-preparation';
import SpellBookManager from './spellbook-manager';

export default class SpellBookAdd extends SpellBookManager {
  static get defaultOptions() {
    const options = foundry.utils.mergeObject(super.defaultOptions, {
      id: `${MODULE_ID}-${SPELL_MANAGER.ID}-${SPELL_MANAGER.MODES.ADD}`,
      title: game.i18n.localize(`${MODULE_ID}.${SPELL_MANAGER.ID}.title`),

      svelte: {
        props: {
          minLevel: 1,
          mode: SPELL_MANAGER.MODES.ADD
        }
      }
    });

    return options;
  }

  static createId(actorId) {
    return `${MODULE_ID}-${SPELL_MANAGER.ID}-${SPELL_MANAGER.MODES.ADD}-${actorId}`;
  }

  async close(options) {
    const actorId = this.options.svelte?.props?.actor?.id;

    if (actorId) {
      spellStores[actorId].reset();
    }

    return super.close(options);
  }
}
