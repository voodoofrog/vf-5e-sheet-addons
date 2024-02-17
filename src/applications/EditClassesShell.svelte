<svelte:options accessors={true} />

<script>
  import { getContext } from 'svelte';
  import { ApplicationShell } from '#runtime/svelte/component/core';
  import { localize } from '#runtime/svelte/helper';
  import { MODULE_ID, SETTINGS } from '../constants';

  export let elementRoot;
  export let classNamesRead;
  export let classNamesWrite;
  export let temp;
  const { application } = getContext('#external');

  $temp = deepClone($classNamesRead);
</script>

<ApplicationShell bind:elementRoot>
  <form class="vf-settings categories flexcol">
    <div class="scrollable">
      <ol class="items-list">
        <li class="items-header flexrow">
          <h3 class="item-name flexrow">
            {localize(`${MODULE_ID}.settings.${SETTINGS.EDIT_CLASS_NAMES_MENU}.header.name`)}
          </h3>
          <div class="item-controls flexrow">
            <!-- svelte-ignore a11y-missing-attribute -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <a
              class="item-control"
              data-tooltip={localize(`${MODULE_ID}.settings.${SETTINGS.EDIT_CLASS_NAMES_MENU}.tooltip.create`)}
              aria-label="Add"
              on:click={() => {
                $temp = [...$temp, ''];
              }}
              ><i class="fas fa-plus"></i> Add
            </a>
          </div>
        </li>
        <ol class="item-list">
          {#each $temp as className, index}
            <li class="item flexrow" data-idx={index}>
              <div class="item-name flexrow">
                <input type="text" name="edit-name" bind:value={className} />
              </div>
              <div class="item-controls flexrow">
                <!-- svelte-ignore a11y-missing-attribute -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <!-- svelte-ignore missing-declaration -->
                <a
                  class="item-control"
                  data-tooltip={localize('vf-5e-sheet-addons.settings.edit-class-names-menu.tooltip.undo')}
                  on:click={() => {
                    const tempClone = deepClone($temp);
                    tempClone[index] = $classNamesRead[index];
                    $temp = tempClone;
                  }}><i class="fas fa-rotate-left"></i></a
                >
                <!-- svelte-ignore a11y-missing-attribute -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <!-- svelte-ignore missing-declaration -->
                <a
                  class="item-control"
                  data-tooltip={localize('vf-5e-sheet-addons.settings.edit-class-names-menu.tooltip.delete')}
                  on:click={() => {
                    const tempClone = deepClone($temp);
                    tempClone.splice(index);
                    $temp = tempClone;
                  }}><i class="fas fa-trash"></i></a
                >
              </div>
            </li>
          {/each}
        </ol>
      </ol>
    </div>
    <footer class="flexcol">
      <p>{localize('vf-5e-sheet-addons.settings.edit-class-names-menu.note')}</p>
      <div class="flexrow">
        <button
          type="button"
          name="submit"
          on:click={() => {
            $classNamesWrite = $temp;
            application.close();
          }}
        >
          <i class="far fa-save"></i>
          {localize('vf-5e-sheet-addons.settings.edit-class-names-menu.button.save')}
        </button>
        <button
          type="button"
          name="cancel"
          on:click={() => {
            application.close();
          }}
        >
          <i class="fas fa-cancel"></i>
          {localize('vf-5e-sheet-addons.settings.edit-class-names-menu.button.cancel')}
        </button>
      </div>
    </footer>
  </form>
</ApplicationShell>

<style lang="scss">
  .vf-settings.categories {
    height: 100%;

    .scrollable {
      flex: 1;
      padding: 1rem;
      overflow: hidden auto;

      .items-list {
        list-style: none;
        margin: 0;
        padding: 0;
        overflow-y: auto;
        scrollbar-width: thin;
        color: var(--dnd5e-color-tan);

        .items-header {
          height: 28px;
          margin: 2px 0;
          padding: 0;
          align-items: center;
          background: rgba(0, 0, 0, 0.05);
          border: var(--dnd5e-border-groove);
          font-weight: bold;

          h3 {
            padding-left: 5px;
            font-family: var(--dnd5e-font-modesto);
            font-size: var(--font-size-16);
            font-weight: 700;
            text-align: left;
            border-bottom: none;
            margin: 0;
          }

          > * {
            font-size: var(--font-size-12);
            text-align: center;
          }
        }

        .item-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .item {
          align-items: center;
          padding: 0 2px;

          .item-name {
            flex: 2;
            margin: 0;
            overflow: hidden;
            font-size: var(--font-size-13);
            text-align: left;
            align-items: center;
          }
        }

        .item-controls {
          flex: 0 0 60px;
          justify-content: space-between;

          a {
            font-size: var(--font-size-12);
            text-align: center;
          }
        }
      }
    }

    footer {
      margin: 1rem;
      flex: 0;
    }
  }
</style>
