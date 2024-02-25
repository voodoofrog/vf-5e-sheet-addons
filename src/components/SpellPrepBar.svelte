<svelte:options accessors={true} />

<script>
  import { TJSDocument } from '#runtime/svelte/store/fvtt/document';
  import { localize } from '#runtime/svelte/helper';
  import SpellBookManager from '../applications/spellbook-manager';
  import { MODULE_ID, SETTINGS } from '../constants';
  import {
    getValidClasses,
    getPrepLimit,
    getPrepLimitsTotal,
    getCurrentlyPrepped,
    prepComparator
  } from '../spell-preparation';

  export let actor = void 0;

  const classes = getValidClasses(actor);
  const classSourcesEnabled = game.settings.get(MODULE_ID, SETTINGS.USE_CLASS_SOURCES);
  const totalLimit = getPrepLimitsTotal(actor);
  const totalPrepared = actor?.items
    ?.filter((i) => i.type === 'spell')
    .filter((spell) => {
      const prep = spell.system.preparation;
      return spell.system.level > 0 && prep.mode === 'prepared' && prep.prepared;
    }).length;
</script>

<div class="spell-prep-controls">
  <h3>{localize(`${MODULE_ID}.spell-prep-bar.heading`)}</h3>
  {#if classSourcesEnabled}
    {#each classes as c}
      <div class="entry {prepComparator(actor, c) > 0 ? 'prep-exceeded' : ''}">
        <span class="class-name">{c.name}</span>
        <span class="prep-limits {prepComparator(actor, c) === 0 ? 'prep-reached' : ''}">
          {getCurrentlyPrepped(actor, c.name) || 0}/{getPrepLimit(actor, c)}
        </span>
      </div>
    {/each}
  {:else}
    <div class="entry {totalPrepared > totalLimit ? 'prep-exceeded' : ''}">
      <span class="prep-total">{localize(`${MODULE_ID}.spell-prep-bar.prep-total`)}</span>
      <span class="prep-limits {totalPrepared === totalLimit ? 'prep-reached' : ''}">{totalPrepared}/{totalLimit}</span>
    </div>
  {/if}
  {#if classSourcesEnabled}
    <button
      type="button"
      class="spells-manage gold-button"
      aria-label="Manage Spell Sources"
      on:click={() => {
        const actorDoc = new TJSDocument(actor);
        new SpellBookManager({
          id: SpellBookManager.createId(actor.id),
          svelte: { props: { actor: actorDoc } }
        }).render(true, { focus: true });
      }}
    >
      <i class="fas fa-feather"></i>
    </button>
  {/if}
</div>

<style lang="scss">
  .spell-prep-controls {
    border-radius: 4px;
    background: var(--dnd5e-color-iron-gray);
    box-shadow: 0 0 6px var(--dnd5e-shadow-45);
    border: 1px solid var(--dnd5e-color-gold);
    display: flex;
    flex-direction: row;
    align-items: center;
    color: var(--dnd5e-color-gold);

    h3 {
      border: none;
      margin: 0 0.5rem;
      font-family: var(--dnd5e-font-roboto-slab);
      font-size: var(--font-size-13);
      font-weight: bold;
    }

    div.entry {
      font-family: var(--dnd5e-font-roboto-condensed);
      text-transform: uppercase;
      font-size: var(--font-size-11);
      border-left: 1px solid var(--dnd5e-color-gold);
      padding: 0.75rem;
      display: flex;
      flex-direction: row;
      gap: 0.5rem;

      &.prep-exceeded {
        color: var(--dnd5e-color-red);
        text-shadow: 1px 0 0 var(--dnd5e-color-red);
      }

      .prep-reached {
        color: var(--dnd5e-color-hp-2);
        text-shadow: 1px 0 0 var(--dnd5e-color-hp-2);
      }

      &:last-of-type {
        border-right: 1px solid var(--dnd5e-color-gold);
      }
    }

    .spells-manage {
      margin: 0 0.25rem 0 auto;
    }
  }
</style>
