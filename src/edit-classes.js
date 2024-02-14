import { MODULE_ID, SETTINGS } from './constants';
export class EditClasses extends FormApplication {
  constructor(object, options = {}) {
    const classNames = game.settings.get(MODULE_ID, SETTINGS.ADDITIONAL_CLASS_NAMES);
    options.height = 500;
    super(object, options);
    this.classNames = classNames || [];
    this.originalNames = deepClone(this.classNames);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: `${MODULE_ID}-edit-classes`,
      title: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.EDIT_CLASS_NAMES_MENU}.title`),
      template: `./modules/${MODULE_ID}/templates/edit-classes.hbs`,
      width: 600,
      closeOnSubmit: true,
      resizable: true,
      popOut: true
    });
  }

  getData() {
    return { classNames: this.classNames, dirtyMap: this.dirtyMap };
  }

  _updateObject() {
    game.settings.set(MODULE_ID, SETTINGS.ADDITIONAL_CLASS_NAMES, this.classNames);
    this.submitting = true;
  }

  addName() {
    this.classNames.push('');
    this.render(true);
  }

  removeName(event) {
    const idx = event.currentTarget.closest('.item').dataset.idx;
    this.classNames.splice(idx, 1);
    $(`.item[data-idx="${idx}"]`, this.element).remove();
  }

  changeName(event) {
    const idx = event.currentTarget.closest('.item').dataset.idx;
    this.classNames[idx] = $(event.currentTarget).val().trim();
    if (!this.submitting) this.render(true);
  }

  undoChanges(event) {
    const idx = event.currentTarget.closest('.item').dataset.idx;
    const originalName = this.originalNames[idx];
    this.classNames[idx] = originalName;
    if (!this.submitting) this.render(true);
  }

  activateListeners(html) {
    super.activateListeners(html);

    $('a[data-action="create"]', html).click(this.addName.bind(this));

    $('input[name="edit-name"]', html).blur(this.changeName.bind(this));
    $('a[data-action="undo"]', html).click(this.undoChanges.bind(this));
    $('a[data-action="delete"]', html).click(this.removeName.bind(this));

    $('button[name="submit"]', html).click(this._onSubmit.bind(this));
    $('button[name="cancel"]', html).click(() => this.close());
  }
}
