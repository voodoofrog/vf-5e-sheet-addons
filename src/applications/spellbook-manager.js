import { SvelteApplication } from '#runtime/svelte/application';
import { localize } from '#runtime/svelte/helper';
import SpellbookManagerShell from './SpellbookManagerShell.svelte';
import { MODULE_ID, SPELL_MANAGER } from '../constants';

export default class SpellBookManager extends SvelteApplication {
  static get defaultOptions() {
    const options = foundry.utils.mergeObject(super.defaultOptions, {
      id: `${MODULE_ID}-${SPELL_MANAGER}`,
      classes: [MODULE_ID],
      resizable: true,
      minimizable: true,
      title: localize(`${MODULE_ID}.${SPELL_MANAGER}.title`),
      width: 550,

      svelte: {
        class: SpellbookManagerShell,
        target: document.body
      }
    });

    return options;
  }
}
