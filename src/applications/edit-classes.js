import { SvelteApplication } from '#runtime/svelte/application';
import { localize } from '#runtime/svelte/helper';
import { writable } from 'svelte/store';
import { MODULE_ID, SETTINGS } from '../constants';
import { gameSettings } from '../index';
import EditClassesShell from './EditClassesShell.svelte';

export class EditClasses extends SvelteApplication {
  constructor(options) {
    super(options);

    try {
      this.state.set(game.settings.get(MODULE_ID, SETTINGS.ADDITIONAL_CLASS_NAMES));
    } catch (err) {
      /**/
    }
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: `${MODULE_ID}-edit-classes`,
      classes: [MODULE_ID],
      resizable: true,
      minimizable: true,
      title: localize(`${MODULE_ID}.settings.${SETTINGS.EDIT_CLASS_NAMES_MENU}.title`),
      width: 600,

      svelte: {
        class: EditClassesShell,
        target: document.body,
        props: () => {
          return {
            classNamesRead: gameSettings.getReadableStore(SETTINGS.ADDITIONAL_CLASS_NAMES),
            classNamesWrite: gameSettings.getWritableStore(SETTINGS.ADDITIONAL_CLASS_NAMES),
            temp: writable([])
          };
        }
      }
    });
  }
}
