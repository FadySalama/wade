<template>
  <div class="full-width">
    <div class="label">
      <h2>Selected Interactions Editor</h2>
    </div>

    <draggable id="selected-interactions-list" v-model="selectedInteractionsList">
      <div class="selected-interaction" v-for="(interaction,index) in selectedInteractionsList" :key="index">
        <mSelectedInteraction 
        :selectedInteraction="interaction"
        :index="index"
        />
      </div>      
    </draggable>

    <aButtonBasic btnLabel="Execute Interactions" btnClass="btn-config-small" btnOnClick="execute-interactions" @execute-interactions="executeInteractions()"/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import draggable from 'vuedraggable';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';
import mSelectedInteraction from '@/components/02_molecules/mSelectedInteraction.vue';
import { mapGetters, mapActions, mapMutations } from 'vuex';
export default Vue.extend({
    components: {
        draggable,
        aButtonBasic,
        mSelectedInteraction
    },
    computed: {
      ...mapGetters('TdStore', ['getSelections']),
      selectedInteractionsList: {
        get() {
          return ((this as any).getSelections as WADE.VueInteractionConfig);
        },
        set(newList: WADE.VueInteractionConfig) {
          console.log(newList);
          (this as any).setSelections(newList);
        }
      }
    },
    methods: {
      ...mapActions('TdStore', ['executeInteractions', 'updateSelectedInteractionList']),
      ...mapMutations('TdStore', ['setSelections'])
    }
})
</script>

<style>
#selected-interactions-list {
  border-top: 0;
  border-bottom: 1pt solid gray;
  border-left: 1pt solid gray;
  border-right: 1pt solid gray;
}

#selected-interactions-list div.selected-interaction{
  border-bottom: 1pt solid gray
}

#selected-interactions-list div.selected-interaction:last-child{
  border-bottom: 0
}

.full-width {
  width: 100%
}

div.label {
  padding: 1%;
  background-color: rgb(99, 99, 99);
  box-shadow: 0pt 3pt 3pt -1pt gray;
  margin-bottom: 1%;
}

.list {
  height: 50%;
}
</style>