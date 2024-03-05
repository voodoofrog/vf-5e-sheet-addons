<script>
  import { localize } from '#runtime/svelte/helper';
  import { MODULE_ID, FLAGS, SPELL_MANAGER, SETTINGS } from '../constants.js';

  export let classes;
  export let spell;
  export let mode;
  export let updating;

  const source = spell.flags?.[MODULE_ID]?.[FLAGS.SPELL_SOURCE] || '';
  const sourcesEnabled = game.settings.get(MODULE_ID, SETTINGS.USE_CLASS_SOURCES);

  const onChangeSelect = (accessor, value) => {
    spell.update({ [accessor]: value });
  };
</script>

<li class="item">
  <div class="item-name" aria-label={spell.name}>
    <img class="item-image gold-icon" src={spell.img} alt={spell.name} />
    <div class="name name-stacked">
      <span class="title">{spell.name}</span>
    </div>
    <div class="tags">
      {#if spell.system.properties.has('ritual')}
        <span aria-label={localize('DND5E.Item.Property.Ritual')}>
          <dnd5e-icon src="systems/dnd5e/icons/svg/items/spell.svg"></dnd5e-icon>
        </span>
      {/if}
      {#if spell.system.properties.has('concentration')}
        <span aria-label={localize('DND5E.Item.Property.Concentration')}>
          <dnd5e-icon src="systems/dnd5e/icons/svg/statuses/concentrating.svg"></dnd5e-icon>
        </span>
      {/if}
    </div>
  </div>
  <div class="item-detail spell-level">{spell.system.level}</div>
  {#if mode === SPELL_MANAGER.MODES.ADD}
    <div class="item-detail spell-prep">
      <select
        name="system.preparation.mode"
        class="roboto-upper unselect"
        on:change={(e) => onChangeSelect('system.preparation.mode', e.currentTarget.value)}
        disabled={updating}
      >
        {#each Object.entries(CONFIG.DND5E.spellPreparationModes) as [key, value]}
          <option value={key} selected={key === spell.system.preparation.mode}>{value}</option>
        {/each}
      </select>
    </div>
  {/if}
  {#if sourcesEnabled}
    <div class="item-detail spell-source">
      <select
        name="spell-source"
        class="roboto-upper unselect"
        on:change={(e) => onChangeSelect(`flags.${MODULE_ID}.${FLAGS.SPELL_SOURCE}`, e.currentTarget.value)}
        disabled={spell.system.preparation.mode !== 'prepared' || updating}
      >
        <option value="" selected={source === ''}>{localize(`${MODULE_ID}.${SPELL_MANAGER.ID}.default-option`)}</option>
        {#each classes as c}
          <option value={c} selected={c === source}>{c}</option>
        {/each}
      </select>
    </div>
  {/if}
</li>

<style lang="scss">
  .item {
    display: flex;
    align-items: stretch;
  }

  .item .item-name {
    flex: 1;
    display: flex;
    gap: 0.5rem;
    align-items: center;
    line-height: 1;
    position: relative;
  }

  .item .spell-level {
    width: 50px;
  }

  .item .spell-source {
    width: 180px;
  }

  .item .item-detail {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .item .item-detail:last-child {
    padding-right: 0.5rem;
  }

  .item {
    border-bottom: var(--dnd5e-border-dotted);
  }

  .item .item-name:not(h3) {
    padding: 0.25rem;
  }

  .item .item-image {
    width: 32px;
    height: 32px;
    object-fit: cover;
  }

  .gold-icon {
    border: 2px solid var(--dnd5e-color-gold);
    box-shadow: 0 0 4px var(--dnd5e-shadow-45);
    border-radius: 0;
    background-color: var(--dnd5e-color-light-gray);
  }

  .name-stacked {
    display: flex;
    flex-direction: column;
  }

  .item .item-name .title {
    transition: text-shadow 250ms ease;
    font-size: var(--font-size-13);
  }

  .name-stacked .title {
    font-family: var(--dnd5e-font-roboto-slab);
    font-size: var(--font-size-14);
    font-weight: bold;
  }

  .name-stacked .subtitle {
    font-family: var(--dnd5e-font-roboto);
    font-size: var(--font-size-10);
    color: var(--color-text-dark-5);
  }

  .item .item-name .tags {
    position: absolute;
    right: 0.5rem;
    opacity: 0.25;
    font-size: var(--font-size-14);
    display: flex;
    align-items: center;
    gap: 0.25rem;
    --icon-fill: var(--dnd5e-color-black);
  }

  .item .item-detail.empty::after {
    content: '–';
    color: var(--color-text-light-6);
    font-weight: normal;
  }

  .spell-source {
    font-size: var(--font-size-12);
    color: var(--color-text-dark-5);
    width: 30px;
    padding-top: 2px;
    text-align: center;
  }

  .spell-prep {
    font-size: var(--font-size-12);
    color: var(--color-text-dark-5);
    width: 155px;
    padding-top: 2px;
    text-align: center;
  }

  select.unselect {
    border: none;
    padding: 0;
    background: transparent;
    height: unset;
  }

  .roboto-upper {
    font-family: var(--dnd5e-font-roboto);
    font-weight: bold;
    text-transform: uppercase;
  }
</style>
