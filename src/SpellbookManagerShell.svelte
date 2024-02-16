<svelte:options accessors={true} />

<script>
  import { ApplicationShell } from '#runtime/svelte/component/core';
  import { TJSDocument } from '#runtime/svelte/store/fvtt/document';
  import { DynReducerHelper } from '#runtime/svelte/store/reducer';
  import { getPreparedCasterNames } from './index';
  import SpellComponent from './SpellComponent.svelte';

  export let elementRoot;
  export let actor = new TJSDocument();

  const filterSearch = DynReducerHelper.filters.regexObjectQuery('type');
  filterSearch.set('spell');

  const spells = actor.embedded.create(Item, {
    name: 'spell',
    filters: [filterSearch],
    sort: (a, b) => a.name.localeCompare(b.name)
  });

  const classes = actor.get().items.filter((i) => i.type === 'class' && getPreparedCasterNames().includes(i.name));
</script>

<ApplicationShell bind:elementRoot>
  <main>
    <div class="items-section card">
      <div class="items-header header">
        <h3 class="item-name spell-header">Spell</h3>
        <div class="item-header item-source">Source</div>
      </div>
      <ol class="item-list unlist">
        {#each [...$spells] as item (item.id)}
          <SpellComponent {item} {classes} />
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

        .items-header {
          display: flex;
          align-items: stretch;
        }

        .header {
          background: linear-gradient(to right, var(--dnd5e-color-hd-1), var(--dnd5e-color-hd-2));
          color: white;
          border-radius: 3px 3px 0 0;
          border-bottom: 1px solid var(--dnd5e-color-gold);
        }

        .items-header .item-name {
          flex: 1;
          display: flex;
          gap: 0.5rem;
          align-items: center;
          line-height: 1;
          position: relative;
        }

        .items-header .item-prep {
          width: 60px;
        }

        .items-header .item-source {
          width: 180px;
        }

        .items-header .item-prep {
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

        .items-header .item-header:last-child {
          padding-right: 0.5rem;
        }

        .unlist {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .items-header .item-name:not(h3) {
          padding: 0.25rem;
        }
      }
    }
  }
</style>
