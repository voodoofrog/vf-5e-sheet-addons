<script>
  import { TJSDocument } from '#runtime/svelte/store/fvtt/document';
  import { updateDoc } from './update-doc.js';
  import { MODULE_ID, PREP_SELECTOR, SETTINGS } from './constants';

  export let classes;
  export let item;
  item.setFlag(MODULE_ID, 'source', '');
  const spell = new TJSDocument(item);

  /*
                <select bind:value={$storeEase}>
                {#each easingList as entry}
                   <option value={easingFunc[entry]}>{entry}</option>
                {/each}
             </select>
  */
</script>

<li class="item">
  <div class="item-name" aria-label={$spell.name}>
    <img class="item-image gold-icon" src={$spell.img} alt={$spell.name} />
    <div class="name name-stacked">
      <span class="title">{$spell.name}</span>
    </div>
    <div class="tags">
      {#if $spell.system.properties.has('ritual')}
        <span aria-label="Ritual">
          <dnd5e-icon src="systems/dnd5e/icons/svg/items/spell.svg"></dnd5e-icon>
        </span>
      {/if}
      {#if $spell.system.properties.has('concentration')}
        <span aria-label="Concentration">
          <dnd5e-icon src="systems/dnd5e/icons/svg/statuses/concentrating.svg"></dnd5e-icon>
        </span>
      {/if}
    </div>
  </div>
  <div class="item-detail item-prep {$spell.system.preparation.mode === 'always' ? 'empty' : ''}">
    {#if $spell.system.preparation.mode !== 'always'}
      <input type="checkbox" bind:checked={$spell.system.preparation.prepared} use:updateDoc={{ doc: spell, accessor: 'system.preparation.prepared' }} />
    {/if}
  </div>
  <div class="item-detail item-source">
    <select name="spell-source" class="spell-source roboto-upper unselect" bind:value={$spell.flags.source} use:updateDoc={{ doc: spell, accessor: 'flags.source' }}>
      <option value="">None</option>
      {#each classes as cClass}
        <option value={cClass.name}>{cClass.name}</option>
      {/each}
    </select>
  </div>
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

  .item .item-prep {
    width: 60px;
  }

  .item .item-source {
    width: 180px;
  }

  .item .item-prep {
    flex-direction: column;
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

  select.spell-source {
    height: 14px;
    width: 180px;
    padding: 0;
  }

  .spell-source {
    font-size: var(--font-size-12);
    color: var(--color-text-dark-5);
    width: 30px;
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
