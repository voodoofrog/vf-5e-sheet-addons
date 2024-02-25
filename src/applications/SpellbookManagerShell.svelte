<svelte:options accessors={true} />

<script>
  import { ApplicationShell } from '#runtime/svelte/component/core';
  import { TJSDocument } from '#runtime/svelte/store/fvtt/document';
  import { localize } from '#runtime/svelte/helper';
  import { getValidClasses } from '../spell-preparation';
  import SpellManagementComponent from '../components/SpellManagementComponent.svelte';
  import { MODULE_ID, SPELL_MANAGER } from '../constants';
  import { spellStores } from '../spell-preparation';

  export let elementRoot;
  export let actor;
  export let minLevel = 1;
  export let mode = SPELL_MANAGER.MODES.MANAGE;

  const spellStore = spellStores[actor.id];
  const spellFilter = (item) => item.type === 'spell';
  const levelFilter = (item) => item.system.level >= minLevel;
  const spellIdFilter = (item) => $spellStore.includes(item.id);
  const isAddMode = mode === SPELL_MANAGER.MODES.ADD;
  const actorDoc = new TJSDocument(actor);
  const filters = [spellFilter, levelFilter];
  const classes = getValidClasses(actor).map((vc) => vc.name);

  if (isAddMode) {
    filters.push(spellIdFilter);
  }

  const spells = actorDoc.embedded.create(Item, {
    name: 'spell',
    filters,
    sort: (a, b) => a.system.level - b.system.level || a.name.localeCompare(b.name)
  });
</script>

<ApplicationShell bind:elementRoot>
  <main>
    <div class="items-section card">
      <div class="items-header header">
        <h3 class="item-name spell-header">{localize(`${MODULE_ID}.${SPELL_MANAGER.ID}.headers.name`)}</h3>
        <div class="item-header spell-level">{localize(`${MODULE_ID}.${SPELL_MANAGER.ID}.headers.level`)}</div>
        {#if isAddMode}
          <div class="item-header spell-prep">{localize(`${MODULE_ID}.${SPELL_MANAGER.ID}.headers.prep`)}</div>
        {/if}
        <div class="item-header spell-source">{localize(`${MODULE_ID}.${SPELL_MANAGER.ID}.headers.source`)}</div>
      </div>
      <ol class="item-list unlist">
        {#each [...$spells] as spell (spell.id)}
          <SpellManagementComponent {spell} {classes} {mode} />
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

        .items-header .spell-prep {
          width: 155px;
        }

        .items-header .spell-source {
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
