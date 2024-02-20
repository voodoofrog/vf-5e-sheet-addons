<svelte:options accessors={true} />

<script>
  import { TJSDocument } from '#runtime/svelte/store/fvtt/document';
  import SpellBookManager from '../applications/spellbook-manager';
  import { MODULE_ID, SETTINGS, FLAGS } from '../constants';
  import { getValidClasses, getPrepLimit, getPrepLimitsTotal } from '../index';

  export let actor = void 0;

  const classes = getValidClasses(actor);
  const prepLimits = actor?.getFlag(MODULE_ID, FLAGS.PREP_LIMITS) || {};
  const classSourcesEnabled = game.settings.get(MODULE_ID, SETTINGS.USE_CLASS_SOURCES);
  const totalPrepared = actor?.items
    ?.filter((i) => i.type === 'spell')
    .filter((spell) => {
      const prep = spell.system.preparation;
      return spell.system.level > 0 && prep.mode === 'prepared' && prep.prepared;
    }).length;
</script>

<div class="spell-prep-controls">
  <h3>Spell Preparation</h3>
  {#if classSourcesEnabled}
    {#each classes as c}
      <div class="entry">{c.name} {prepLimits?.[c]?.current || totalPrepared}/{getPrepLimit(actor, c)}</div>
    {/each}
  {:else}
    <div class="entry">Total {totalPrepared}/{getPrepLimitsTotal(actor)}</div>
  {/if}
  {#if classSourcesEnabled}
    <button
      type="button"
      class="spells-manage gold-button"
      aria-label="Manage Spell Sources"
      on:click={() => {
        const actorDoc = new TJSDocument(actor);
        new SpellBookManager({ svelte: { props: { actor: actorDoc, minLevel: 1 } } }).render(true, { focus: true });
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

      &:last-of-type {
        border-right: 1px solid var(--dnd5e-color-gold);
      }
    }

    .spells-manage {
      margin: 0 0.25rem 0 auto;
    }
  }
</style>
