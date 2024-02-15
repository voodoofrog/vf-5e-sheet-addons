import { SvelteApplication } from '#runtime/svelte/application';
import SpellbookManagerShell from './SpellbookManagerShell.svelte';

export default class SpellBookManager extends SvelteApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'vf5e-spellbook-manager',
      classes: ['tjs-essential-svelte-esm'],
      resizable: true,
      minimizable: true,
      title: 'Spellbook Manager',

      svelte: {
        class: SpellbookManagerShell,
        target: document.body
      }
    });
  }
}
