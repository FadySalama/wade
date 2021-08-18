<template>
  <div class="td-page-container">
    <mTabbar :tabbarElements="getTdTabbar" v-on:tab-clicked="tabClicked" />

    <!-- Tab Config -->
    <div
      v-if="currentTabId === 'config'"
      :class="getSidebarActive ? 'td-config border-top' : 'td-config full-screen border-top'"
    >
      <oConfig class="td-config-child-el" />
      <!-- <oProtocolSelection class="td-config-child-el" /> -->
    </div>
    <!-- Tab Virtual Thing -->
    <div
      v-if="currentTabId === 'virtual'"
      :class="getSidebarActive ? 'td-virtual border-top' : 'td-virtual border-top full-screen'"
    >
      <oVirtual />
      <oVirtualThing />
    </div>
    <!-- Tab Performance -->
    <div
      v-if="currentTabId === 'performance'"
      :class="getSidebarActive ? 'td-performance border-top' : 'td-performance border-top full-screen'"
    >
      <tPerformance />
    </div>
    <!-- Tab Editor & Selection & Results (default tab) -->
    <div
      v-if="currentTabId === 'editor'"
      :class="getSidebarActive ? 'td-editor border-top' : 'td-editor border-top full-screen'"
    >
      <aStatusbar class="td-page-statusbar" :statusMessage="statusMessage" />
      <!-- TODO no property statusMessage exists on aStatusbar! can be removed? -->
      <div class="td-main">
        <div class="td-editor-area">
          <mUrlBar
            v-if="showUrlBar"
            class="url-bar"
            :button="fetchButton"
            :buttonAction="fetchFunction"
            v-on:btn-clicked="hideUrlBar"
            v-on:cancel-btn-clicked="hideUrlBar"
          />
          <div :class="showUrlBar ? 'editor-showUrlBar' : 'editor-full'">
            <oEditor v-on:hide-url-bar="hideUrlBar" v-on:open-config="tabClicked('config')" />
          </div>
        </div>
        <div class="td-testing-area">
          <div class="interaction-selection-area panel">
            <mInteractionSelectorEditor/>
          </div>
          <div class="selected-interactions-area panel">
            <oInteractionSelectionEditor/>
          </div>
          <div class="interaction-results-area panel">
            <oResults/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions, mapMutations } from 'vuex';
import aStatusbar from '@/components/01_atoms/aStatusbar.vue';
import mTabbar from '@/components/02_molecules/mTabbar.vue';
import mUrlBar from '@/components/02_molecules/mUrlBar.vue';
import mInteractionSelectorEditor from '@/components/02_molecules/mInteractionSelectorEditor.vue';
import oInteractionSelectionEditor from '@/components/03_organisms/oInteractionSelectionEditor.vue';
import oConfig from '@/components/03_organisms/oConfig.vue';
import oEditor from '@/components/03_organisms/oEditor.vue';
import oVirtual from '@/components/03_organisms/oVirtual.vue';
import oVirtualThing from '@/components/03_organisms/oVirtualThing.vue';
import oSelection from '@/components/03_organisms/oSelection.vue';
import oResults from '@/components/03_organisms/oResults.vue';
import oProtocolSelection from '@/components/03_organisms/oProtocolSelection.vue';
import tPerformance from '@/components/04_templates/tPerformance.vue';
import { TdStateEnum, TDTabsEnum } from '../../util/enums';

export default Vue.extend({
  name: 'tThingDescription',
  components: {
    aStatusbar,
    oConfig,
    oProtocolSelection,
    oEditor,
    oVirtual,
    oVirtualThing,
    oSelection,
    oResults,
    mInteractionSelectorEditor,
    oInteractionSelectionEditor,
    mTabbar,
    mUrlBar,
    tPerformance
  },
  created() {
    this.changeActiveTab();
    this.$eventHub.$on('dropdown-clicked', this.tabClicked);
    this.$store.commit('SidebarStore/setActiveElement', this.$route.params.id);
  },
  beforeDestroy() {
    this.$eventHub.$off('dropdown-clicked');
  },
  data() {
    return {
      tdId: '',
      currentTabId: TDTabsEnum.EDITOR as TDTabsEnum | string,
      statusMessage: '',
      showUrlBar: false,
      fetchButton: {
        btnLabel: 'Fetch Td',
        btnClass: 'btn-url-bar',
        btnOnClick: 'btn-clicked'
      },
    };
  },
  computed: {
    ...mapGetters('TdStore', ['getTdTabbar']),
    ...mapGetters('SidebarStore', ['getSidebarActive']),
    id() {
      return (this as any).$route.params.id;
    }
  },
  methods: {
    ...mapMutations('TdStore', ['setActiveTab']),
    ...mapActions('TdStore', ['fetchTD']),
    hideUrlBar() {
      if (this.showUrlBar) this.showUrlBar = false;
    },
    tabClicked(args: any | TDTabsEnum) {
      if (args.btnValue === 'td-url') {
        this.showUrlBar = true;
      }
      if (typeof args === 'string') this.currentTabId = args;
    },
    changeActiveTab(): void {
      (this as any).setActiveTab({
        tabbarKey: 'tdTabs',
        activeTab: this.currentTabId
      });
    },
    async fetchFunction(url: string) {
        (this as any).fetchTD({uri: url}).then((fetchedTd) => {
          if (fetchedTd) (this as any).$eventHub.$emit('fetched-td', fetchedTd);
        });
      }
  },
  watch: {
    // Check if router id changed and change active sidebar element
    '$route.params.id'(id) {
      this.$store.commit('SidebarStore/setActiveElement', id);
      this.tdId = id;
      this.currentTabId = TDTabsEnum.EDITOR;
    },
    // Change active tab if tab id changed
    'currentTabId'() {
      this.changeActiveTab();
    }
  }
});
</script>

<style scoped>
.td-page-container {
  display: flex;
  flex-direction: column;
}

.td-editor {
  height: 93%;
}

.td-config {
  height: 93%;
  width: 100%;
  display: flex;
}

.td-virtual {
  height: 100%;
  width: 100%;
  display: flex;
}

.td-config-child-el {
  width: 50%;
  height: 100%;
}

.td-main {
  height: 93%;
  width: 100%;
  overflow: auto;
}

.td-main::-webkit-scrollbar {
    display: inline;
}

.td-main::-webkit-scrollbar-track {
    background-color: #939C9E;
    border-radius: 5pt;
}

.td-main::-webkit-scrollbar-thumb {
    background-color: #b5dfdd;
    border-radius: 5pt;
}

.td-editor-area {
  height: 99.4%;
  width: 100%;
}

.td-testing-area {
  height: 100%;
  width: 100%;
  display: flex;
  border-top: 1pt solid darkgray;
  border-left: 0pt;
}

.td-testing-area div.panel {
  border-right: 0pt solid black;
}

.td-testing-area div.panel:last-child {
  border-right: 0;
}

.interaction-selection-area {
  width: 30%;
}

.selected-interactions-area {
  width: 30%;
}

.interaction-results-area {
  height: 100%;
  width: 40%;
}


.td-performance {
  height: 93%;
  width: 100%;
  display: flex;
}

.url-bar {
  width: 100%;
  height: 8%;
}

.editor-full {
  height: 100%;
}

.editor-showUrlBar {
  height: 92%;
}
</style>
