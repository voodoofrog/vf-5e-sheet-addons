<svelte:options accessors={true} />

<script>
  import { flip } from 'svelte/animate';

  import { rippleFocus } from '#runtime/svelte/action/animate';
  import { ApplicationShell } from '#runtime/svelte/component/core';
  import { TJSDocument } from '#runtime/svelte/store/fvtt/document';
  import { DynReducerHelper } from '#runtime/svelte/store/reducer';
  import { localize } from '#runtime/svelte/helper';
  import { MODULE_ID, PREP_SELECTOR, SETTINGS } from './constants';

  import { TJSInput } from '#standard/component';

  export let elementRoot;

  const filterSearch = DynReducerHelper.filters.regexObjectQuery('type');
  filterSearch.set('spell');

  const actor = new TJSDocument();

  const wildcard = actor.embedded.create(Item, {
    name: 'wildcard',
    filters: [filterSearch],
    sort: (a, b) => a.name.localeCompare(b.name)
  });

  /**
   * Handles parsing the drop event and sets new document source.
   *
   * @param {DragEvent}   event -
   */
  function onDrop(event) {
    try {
      actor.setFromDataTransfer(JSON.parse(event.dataTransfer.getData('text/plain')));
    } catch (err) {
      /**/
    }
  }
</script>

<ApplicationShell bind:elementRoot>
  <main>
    <div class="drop" on:drop={onDrop} role="region" aria-dropeffect="none" aria-label="Document drop target">
      Drop Actor Document Here<br />
      {#if $actor}
        Name: {$actor?.name}
      {/if}
    </div>
    <div class="items-section card">
      <div class="items-header header">
        <h3 class="item-name spell-header">Spell</h3>
        <div class="item-header item-prep">Prepared</div>
        <div class="item-header item-source">Source</div>
      </div>
      <ol class="item-list unlist">
        {#each [...$wildcard] as item (item.id)}
          <li class="item">
            <div class="item-name" aria-label={item.name}>
              <img class="item-image gold-icon" src={item.img} alt={item.name} />
              <div class="name name-stacked">
                <span class="title">{item.name}</span>
              </div>
              <div class="tags">
                {#if item.system.components.ritual}
                  <span aria-label="Ritual">
                    <dnd5e-icon src="systems/dnd5e/icons/svg/items/spell.svg"></dnd5e-icon>
                  </span>
                {/if}
                {#if item.system.components.concentration}
                  <span aria-label="Concentration">
                    <dnd5e-icon src="systems/dnd5e/icons/svg/statuses/concentrating.svg"></dnd5e-icon>
                  </span>
                {/if}
              </div>
            </div>
            <div class="item-detail item-prep {item.system.preparation.mode === 'always' ? 'empty' : ''}">
              {#if item.system.preparation.mode !== 'always'}
                <input type="checkbox" bind:checked={item.system.preparation.prepared} />
              {/if}
            </div>
            <div class="item-detail item-source">
              <select name="spell-source" class="spell-source roboto-upper unselect">
                <option value="">None</option>
                <option value="wiz">Wizard</option>
                <option value="war">Warlock</option>
                <option value="bar">Bard</option>
                <option value="dru">Druid</option>
                <option value="pal">Paladin</option>
                <option value="cle">Cleric</option>
              </select>
            </div>
          </li>
        {/each}
      </ol>
    </div>
  </main>
</ApplicationShell>

<style lang="scss">
  main {
    text-align: center;
    display: flex;
    flex-direction: column;

    --tjs-input-text-width: 100px;

    .items-section {
      position: relative;

      &.card {
        border-radius: 4px;
        background: var(--dnd5e-color-card);
        box-shadow: 0 0 6px var(--dnd5e-shadow-45);
        border: 1px solid var(--dnd5e-color-gold);

        .items-header,
        .item {
          display: flex;
          align-items: stretch;
        }

        .header {
          background: linear-gradient(to right, var(--dnd5e-color-hd-1), var(--dnd5e-color-hd-2));
          color: white;
          border-radius: 3px 3px 0 0;
          border-bottom: 1px solid var(--dnd5e-color-gold);
        }

        .items-header .item-name,
        .item .item-name {
          flex: 1;
          display: flex;
          gap: 0.5rem;
          align-items: center;
          line-height: 1;
          position: relative;
        }

        .items-header .item-prep,
        .item .item-prep {
          width: 40px;
        }

        .items-header .item-source,
        .item .item-source {
          width: 180px;
        }

        .items-header .item-prep,
        .item .item-prep {
          flex-direction: column;
        }

        .header h3 {
          border: none;
          margin: 0;
          padding: 0.5rem;
          font-family: var(--dnd5e-font-roboto-slab);
          font-size: var(--font-size-13);
          font-weight: bold;
          line-height: 1;
        }

        .items-header .item-detail,
        .item .item-detail,
        .items-header .item-header {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .items-header .item-header {
          font-family: var(--dnd5e-font-roboto-condensed);
          text-transform: uppercase;
          font-size: var(--font-size-11);
        }

        .items-header .item-header:last-child,
        .item .item-detail:last-child {
          padding-right: 0.5rem;
        }

        .unlist {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .item {
          border-bottom: var(--dnd5e-border-dotted);
        }

        .items-header .item-name:not(h3),
        .item .item-name:not(h3) {
          padding: 0.25rem;
        }

        .items-header .item-image,
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

        .items-header .item-name .title,
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

        .items-header .item-name .tags,
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

        .items-header .item-detail.empty::after,
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
      }
    }

    div.drop {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 10px;
      border: 2px solid rgba(0, 0, 0, 0.2);
      padding: 0.25em;
      margin-bottom: 0.25em;
    }

    h1 {
      color: #ff3e00;
      text-transform: uppercase;
      font-size: 1.5em;
      font-weight: 100;
    }

    li {
      text-align: start;
    }
  }
</style>
