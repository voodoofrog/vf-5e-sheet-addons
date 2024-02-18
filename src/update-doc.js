import { TJSDocument } from '#runtime/svelte/store/fvtt/document';
import { safeAccess } from '#runtime/util/object';

/**
 * Provides a basic action to update a Foundry document on change events.
 *
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} node - Target input element.
 *
 * @param {{ doc: TJSDocument, accessor: string }}  options - Options
 *
 * @returns {import('svelte/action').ActionReturn} Action lifecycle methods.
 */
export function updateDoc(node, { doc, accessor } = {}) {
  if (
    !(node instanceof HTMLInputElement) &&
    !(node instanceof HTMLSelectElement) &&
    !(node instanceof HTMLTextAreaElement)
  ) {
    throw new TypeError(
      `updateDoc error: 'node' must be an instance of HTMLInputElement, HTMLSelectElement, or HTMLTextAreaElement.`
    );
  }

  if (!(doc instanceof TJSDocument)) {
    throw new TypeError(`updateDoc error: 'doc' must be an instance of TJSDocument.`);
  }

  if (typeof accessor !== 'string') {
    throw new TypeError(`updateDoc error: 'accessor' must be a string.`);
  }

  let currentDocValue;
  let valueKey = 'value';
  switch (node.type) {
    case 'text':
    case 'number':
      valueKey = 'value';
      break;
    case 'checkbox':
      valueKey = 'checked';
      break;
  }

  const unsubscribe = doc.subscribe(onDocChange);

  /**
   * Updates `doc` w/ current focused state.
   *
   * @param {Event}  ev - Change event.
   */
  function onChange(ev) {
    const document = doc.get();
    if (!document) {
      console.warn('updateDoc.onChange warning: no associated document on change.');
      return;
    }

    document.update({ [accessor]: ev.target[valueKey] });
  }

  /**
   * @param {foundry.abstract.Document} docRef - Foundry document changing.
   */
  function onDocChange(docRef) {
    if (!docRef) {
      console.warn('updateDoc.onDocChange warning: no associated document on change.');
      return;
    }

    const newValue = safeAccess(docRef, accessor);
    if (currentDocValue !== newValue) {
      currentDocValue = newValue;
      node.value = currentDocValue;
    }
  }

  /**
   * Activate listeners.
   */
  function activateListeners() {
    node.addEventListener('change', onChange);
  }

  /**
   * Remove listeners.
   */
  function removeListeners() {
    node.removeEventListener('change', onChange);
  }

  activateListeners();

  return {
    // Currently not implemented, but this is where you'd update the options for this action.
    // IE changing the TJSDocument or accessor field.
    update: () => {},

    destroy: () => {
      removeListeners();
      unsubscribe();
    }
  };
}
