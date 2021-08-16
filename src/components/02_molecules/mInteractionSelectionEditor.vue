<template>
  <div class="full-width">
    <div class="label">
      <h2>Selected Interactions Editor</h2>
    </div>
    
    <aListSimple class="full-width list" :list="selectedInteractionsList">
    </aListSimple>
    <aButtonBasic btnLabel="Invoke Actions" btnClass="btn-config-small" btnOnClick="invoke-interactions" @invoke-interactions="invokeInteractions()"/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';
import aListSimple from '@/components/01_atoms/aListSimple.vue';
import { mapGetters, mapActions, mapMutations } from 'vuex';
export default Vue.extend({
    components: {
        aButtonBasic,
        aListSimple
    },
    computed: {
      ...mapGetters('TdStore', ['getSelections']),
      selectedInteractionsList() {
        let selectedInteractions: WADE.VueInteractionConfig[] = (this as any).getSelections;
        let listItems = selectedInteractions.map((selected) => {return {label: selected.name, payload: selected}})
        let list: WADE.ListInterface = {header: "Selected Interactions", items: listItems};
        return list;
      }
    },
    methods: {
      ...mapActions('TdStore', ['invokeInteractions']),
    }
})
</script>

<style>
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