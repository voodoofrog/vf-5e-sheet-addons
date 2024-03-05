<svelte:options accessors={true} />

<script>
  import { onDestroy } from 'svelte';
  import { ApplicationShell } from '#runtime/svelte/component/core';
  import { TJSDocument } from '#runtime/svelte/store/fvtt/document';
  import { localize } from '#runtime/svelte/helper';
  import { getValidClasses } from '../spell-preparation';
  import SpellManagementComponent from '../components/SpellManagementComponent.svelte';
  import { MODULE_ID, SPELL_MANAGER, SETTINGS, FLAGS } from '../constants';
  import { spellStores } from '../spell-preparation';

  export let elementRoot;
  export let actor;
  export let minLevel = 1;
  export let mode = SPELL_MANAGER.MODES.MANAGE;

  const spellStore = spellStores[actor.id];
  const spellFilter = (item) => item.type === 'spell';
  const levelFilter = (item) => item.system.level >= minLevel;
  const spellIdFilter = (item) => $spellStore.includes(item.id);
  const prepFilter = (item) => item.system.preparation.mode === 'prepared';
  const isAddMode = mode === SPELL_MANAGER.MODES.ADD;
  const actorDoc = new TJSDocument(actor);
  const filters = [spellFilter, levelFilter];
  const classes = getValidClasses(actor).map((vc) => vc.name);
  const sourcesEnabled = game.settings.get(MODULE_ID, SETTINGS.USE_CLASS_SOURCES);
  let updating = false;

  if (isAddMode) {
    filters.push(spellIdFilter);
  } else {
    filters.push(prepFilter);
  }

  const spells = actorDoc.embedded.create(Item, {
    name: 'spell',
    filters,
    sort: (a, b) => a.system.level - b.system.level || a.name.localeCompare(b.name)
  });

  const onChangeSelect = async (accessor, value) => {
    updating = true;
    for (const spell of spells) {
      await spell.update({ [accessor]: value });
    }
    updating = false;
  };

  onDestroy(() => actorDoc.destroy());
</script>

<ApplicationShell bind:elementRoot>
  <main>
    {#if sourcesEnabled || isAddMode}
      <div class="quick-setter card">
        <h3 class="title">{localize(`${MODULE_ID}.${SPELL_MANAGER.ID}.headers.quick-set`)}</h3>
        {#if isAddMode}
          <div class="spell-prep quick-select">
            <select
              name="system.preparation.mode"
              class="roboto-upper unselect"
              on:change={(e) => onChangeSelect('system.preparation.mode', e.currentTarget.value)}
              disabled={updating}
            >
              <option value="" disabled selected={!updating}>
                {localize(`${MODULE_ID}.${SPELL_MANAGER.ID}.quick-set.prep`)}
              </option>
              {#each Object.entries(CONFIG.DND5E.spellPreparationModes) as [key, value]}
                <option value={key}>{value}</option>
              {/each}
            </select>
          </div>
        {/if}
        {#if sourcesEnabled}
          <div class="spell-sources quick-select">
            <select
              name="spell-source"
              class="roboto-upper unselect"
              on:change={(e) => onChangeSelect(`flags.${MODULE_ID}.${FLAGS.SPELL_SOURCE}`, e.currentTarget.value)}
              disabled={updating}
            >
              <option value="" disabled selected={!updating}>
                {localize(`${MODULE_ID}.${SPELL_MANAGER.ID}.quick-set.source`)}
              </option>
              <option value="">Other</option>
              {#each classes as c}
                <option value={c}>{c}</option>
              {/each}
            </select>
          </div>
        {/if}
      </div>
    {/if}
    <div class="items-section card">
      <div class="items-header header">
        <h3 class="item-name spell-header">{localize(`${MODULE_ID}.${SPELL_MANAGER.ID}.headers.name`)}</h3>
        <div class="item-header spell-level">{localize(`${MODULE_ID}.${SPELL_MANAGER.ID}.headers.level`)}</div>
        {#if isAddMode}
          <div class="item-header spell-prep">{localize(`${MODULE_ID}.${SPELL_MANAGER.ID}.headers.prep`)}</div>
        {/if}
        {#if sourcesEnabled}
          <div class="item-header spell-source">{localize(`${MODULE_ID}.${SPELL_MANAGER.ID}.headers.source`)}</div>
        {/if}
      </div>
      <ol class="item-list unlist">
        {#key !updating}
          {#each [...$spells] as spell (spell.id)}
            <SpellManagementComponent {spell} {classes} {mode} {updating} />
          {/each}
        {/key}
      </ol>
    </div>
  </main>
</ApplicationShell>

<style lang="scss">
  @mixin card-style {
    border-radius: 4px;
    box-shadow: 0 0 6px var(--dnd5e-shadow-45);
    border: 1px solid var(--dnd5e-color-gold);
  }

  main {
    text-align: center;
    display: flex;
    flex-direction: column;
    min-height: fit-content;

    --tjs-input-text-width: 100px;

    .quick-setter {
      position: relative;
      align-items: stretch;
      display: flex;
      margin-bottom: 0.5rem;

      &.card {
        @include card-style;
        background: var(--dnd5e-color-iron-gray);

        .title {
          border: none;
          margin: 0;
          padding: 0.5rem;
          font-family: var(--dnd5e-font-roboto-slab);
          font-size: var(--font-size-13);
          font-weight: bold;
          line-height: 1;
          text-align: left;
          flex: 1;
          color: var(--dnd5e-color-gold);
        }

        .spell-sources {
          width: 180px;
        }

        .spell-prep {
          width: 155px;
        }

        .quick-select {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: var(--font-size-12);
          padding-top: 2px;

          select.unselect {
            border: none;
            padding: 0;
            background: transparent;
            height: unset;
            color: var(--dnd5e-color-gold);

            option {
              color: var(--color-text-dark-5);
            }
          }

          .roboto-upper {
            font-family: var(--dnd5e-font-roboto);
            font-weight: bold;
            text-transform: uppercase;
          }
        }
      }
    }

    .items-section {
      position: relative;

      &.card {
        @include card-style;
        background: var(--dnd5e-color-card);

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
