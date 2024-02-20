<svelte:options accessors={true} />

<script>
  import { ApplicationShell } from '#runtime/svelte/component/core';
  import { TJSDocument } from '#runtime/svelte/store/fvtt/document';
  import { localize } from "#runtime/svelte/helper";
  import { getValidClasses } from '../index';
  import SpellManagementComponent from '../components/SpellManagementComponent.svelte';
  import { MODULE_ID, SPELL_MANAGER } from '../constants';

  export let elementRoot;
  export let actor = new TJSDocument();
  export let minLevel = 1;

  const spellFilter = (data) => data.type === 'spell';
  const levelFilter = (data) => data.system.level >= minLevel;

  const spells = actor.embedded.create(Item, {
    name: 'spell',
    filters: [spellFilter, levelFilter],
    sort: (a, b) => a.system.level - b.system.level || a.name.localeCompare(b.name)
  });

  const classes = getValidClasses(actor);
</script>

<ApplicationShell bind:elementRoot>
  <main>
    <div class="items-section card">
      <div class="items-header header">
        <h3 class="item-name spell-header">{localize(`${MODULE_ID}.${SPELL_MANAGER}.headers.name`)}</h3>
        <div class="item-header spell-level">{localize(`${MODULE_ID}.${SPELL_MANAGER}.headers.level`)}</div>
        <div class="item-header item-source">{localize(`${MODULE_ID}.${SPELL_MANAGER}.headers.source`)}</div>
      </div>
      <ol class="item-list unlist">
        {#each [...$spells] as item (item.id)}
          <SpellManagementComponent {item} {classes} />
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

        .items-header .spell-level {
          width: 50px;
        }

        .items-header .item-source {
          width: 180px;
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
