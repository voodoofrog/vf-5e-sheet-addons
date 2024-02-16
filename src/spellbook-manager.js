import { SvelteApplication } from '#runtime/svelte/application';
import SpellbookManagerShell from './SpellbookManagerShell.svelte';

export default class SpellBookManager extends SvelteApplication {
  static get defaultOptions() {
    const options = foundry.utils.mergeObject(super.defaultOptions, {
      id: 'vf5e-spellbook-manager',
      classes: ['tjs-essential-svelte-esm'],
      resizable: true,
      minimizable: true,
      title: 'Spellbook Manager',
      width: 550,

      svelte: {
        class: SpellbookManagerShell,
        target: document.body
      }
    });
    // console.log('****** ', options);
    return options;
  }
}
