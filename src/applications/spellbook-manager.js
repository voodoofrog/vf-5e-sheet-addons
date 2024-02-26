import { SvelteApplication } from '#runtime/svelte/application';
import SpellbookManagerShell from './SpellbookManagerShell.svelte';
import { MODULE_ID, SPELL_MANAGER } from '../constants';

export default class SpellBookManager extends SvelteApplication {
  static get defaultOptions() {
    const options = foundry.utils.mergeObject(super.defaultOptions, {
      id: `${MODULE_ID}-${SPELL_MANAGER.ID}`,
      classes: [MODULE_ID],
      resizable: true,
      minimizable: true,
      title: game.i18n.localize(`${MODULE_ID}.${SPELL_MANAGER.ID}.title`),
      width: 550,
      height: 'auto',

      svelte: {
        class: SpellbookManagerShell,
        target: document.body,
        props: {
          minLevel: 1,
          mode: SPELL_MANAGER.MODES.MANAGE
        }
      }
    });

    return options;
  }

  static createId(actorId) {
    return `${MODULE_ID}-${SPELL_MANAGER.ID}-${actorId}`;
  }
}
