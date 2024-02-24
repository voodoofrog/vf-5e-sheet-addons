import { SvelteApplication } from '#runtime/svelte/application';
import SpellbookManagerShell from './SpellbookManagerShell.svelte';
import { MODULE_ID, SPELL_MANAGER } from '../constants';
import { spellStore } from '../spell-preparation';

export default class SpellBookManager extends SvelteApplication {
  static get defaultOptions() {
    const options = foundry.utils.mergeObject(super.defaultOptions, {
      id: `${MODULE_ID}-${SPELL_MANAGER.ID}`,
      classes: [MODULE_ID],
      resizable: true,
      minimizable: true,
      title: game.i18n.localize(`${MODULE_ID}.${SPELL_MANAGER.ID}.title`),
      width: 550,

      svelte: {
        class: SpellbookManagerShell,
        target: document.body
      }
    });

    return options;
  }

  async close(options) {
    spellStore.reset();
    return super.close(options);
  }
}
