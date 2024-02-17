import { EditClasses } from './edit-classes.js';

export class EditClassesButton extends FormApplication {
  static #editClasses;

  static showSettings() {
    this.#editClasses = this.#editClasses ? this.#editClasses : new EditClasses();
    this.#editClasses.render(true, { focus: true });

    return this.#editClasses;
  }

  /**
   * @inheritDoc
   */
  constructor(options = {}) {
    super({}, options);
    EditClassesButton.showSettings();
  }

  // eslint-disable-next-line no-unused-vars
  async _updateObject(event, formData) {}

  render() {
    this.close();
  }
}
