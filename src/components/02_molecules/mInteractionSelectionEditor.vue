<template>
  <aButtonBasic btnLabel="Invoke Actions" btnClass="btn-config-small" btnOnClick="invoke-interactions" @invoke-interactions="invokeInteractions"/>
</template>

<script lang="ts">
import Vue from 'vue'
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';
import { mapGetters, mapActions, mapMutations } from 'vuex';
export default Vue.extend({
    components: {
        aButtonBasic
    },
    computed: {
      ...mapActions('TdStore', ['invokeInteractions'])
    }
})
</script>

<style>

</style>