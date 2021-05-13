<template>
  <div id="interaction-selector-area">
    <div>
        <h3>Interaction Selection</h3>
    </div>
    <div class="interaction-selection">
        <select name="interaction-type" id="interaction-type-select" v-model="selectedInteraction.type" @change="resetInteractionSelection()">
            <option v-for="(type, index) in interactionTypeOptions" :key="index" :value="type" > {{type.charAt(0).toUpperCase() + type.slice(1)}} </option>
        </select>
        <aFilteredDropdown id="test" v-model="selectedInteraction.name" :options="currentInteractionsList"/>
        <select name="interaction-op" id="interaction-op-select" v-model="selectedInteraction.op" :disabled="!enableOpAndProtocol">
            <option v-for="(op, index) in currentOperations" :key="index" :value="op" > {{getOpertaionString(op)}} </option>
        </select>
        <select name="interaction-protocol" id="interaction-protocol-select" v-model="selectedInteraction.protocol" :disabled="!enableOpAndProtocol">
            <option v-for="protocol in currentProtocols" :key="protocol" :value="protocol"> {{protocol}} </option>
        </select>
    </div>
    <div>
        {{selectedInteraction.name}}    
    </div>
    <div>
        <aButtonBasic btnLabel="Add to selection" btnClass="btn-config-small" btnOnClick="add-to-select" @add-to-select="selectedInteractionsList.push(selectedInteraction)"/>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import aFilteredDropdown from '@/components/01_atoms/aFilteredDropdown.vue';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';
import { mapGetters, mapActions, mapMutations } from 'vuex';
import { parsedAction, parsedEvent, parsedProperty, ParsedTd } from '@/backend/TdParser';
export default Vue.extend({
    components: {
        aFilteredDropdown,
        aButtonBasic
    },
    data() {
        return {
            selectedInteraction: {
                name: "",
                type: "",
                protocol: "",
                op: "",
                inputs: null
            },
            selectedInteractionsList: []
        }
    },
    computed: {
        ...mapGetters('TdStore',
        ['getParsedTdPropertiesList', 'getParsedTdActionsList', 'getParsedTdEventsList', 'getParsedTdProtocols', 'getParsedTdOperations']),
        propertiesList() {
            let properties: parsedProperty[] = (this as any).getParsedTdPropertiesList;
            return properties.map((prop) => prop.interactionName);
        },
        actionsList() {
            let actions: parsedAction[] = (this as any).getParsedTdActionsList;
            return actions.map((action) => action.interactionName);
        },
        eventsList() {
            let events: parsedEvent[] = (this as any).getParsedTdEventsList;
            return events.map((event) => event.interactionName);
        }, 
        currentInteractionsList() {
            switch((this as any).selectedInteraction.type) {
                case "properties":
                    return (this as any).propertiesList;
                case "actions":
                    return (this as any).actionsList;
                case "events":
                    return (this as any).eventsList;
            }
        },
        currentProtocols() {
            if(this.selectedInteraction.name === "") {
                return (this as any).getParsedTdProtocols;
            } else {
                switch(this.selectedInteraction.type) {
                    case "properties":
                        let properties: parsedProperty[] = (this as any).getParsedTdPropertiesList;
                        let neededProp = properties.find((prop) => prop.interactionName === (this as any).selectedInteraction.name);
                        if(neededProp) return neededProp.availableProtocols;
                        break;
                    case "actions":
                        let actions: parsedAction[] = (this as any).getParsedTdActionsList;
                        let neededAction = actions.find((action) => action.interactionName === (this as any).selectedInteraction.name);
                        if(neededAction) return neededAction.availableProtocols;
                        break;
                    case "events":
                        let events: parsedEvent[] = (this as any).getParsedTdEventsList;
                        let neededEvents = events.find((event) => event.interactionName === (this as any).selectedInteraction.name);
                        if(neededEvents) return neededEvents.availableProtocols;
                        break;
                }
                return null;
            }
        },
        interactionTypeOptions() {
            let interactionTypes: string[] = []
            if(this.propertiesList.length > 0) interactionTypes.push("properties");
            if(this.actionsList.length > 0) interactionTypes.push("actions");
            if(this.eventsList.length > 0) interactionTypes.push("events");
            this.selectedInteraction.type = interactionTypes[0];
            return interactionTypes;
        },
        currentOperations() {
            if(this.selectedInteraction.name === "") {
                let allOperations: string[] = (this as any).getParsedTdOperations;
                let filteredOpertions: string[] = [];
                switch(this.selectedInteraction.type) {
                    case "properties":
                        if(allOperations.includes('readproperty')) filteredOpertions.push('readproperty');
                        if(allOperations.includes('writeproperty')) filteredOpertions.push('writeproperty');
                        if(allOperations.includes('observeproperty')) filteredOpertions.push('observeproperty');
                        if(allOperations.includes('unobserveproperty')) filteredOpertions.push('unobserveproperty');
                        return filteredOpertions;
                    case "actions":
                        if(allOperations.includes('invokeaction')) filteredOpertions.push('invokeaction');
                        return filteredOpertions;
                    case "events":
                        if(allOperations.includes('subscribeevent')) filteredOpertions.push('subscribeevent');
                        if(allOperations.includes('unsubscribeevent')) filteredOpertions.push('unsubscribeevent');
                        return filteredOpertions;
                }
                return null;
            } else {
                switch(this.selectedInteraction.type) {
                    case "properties":
                        let properties: parsedProperty[] = (this as any).getParsedTdPropertiesList;
                        let neededProp = properties.find((prop) => prop.interactionName === (this as any).selectedInteraction.name);
                        if(neededProp) return neededProp.availableOperations;
                        break;
                    case "actions":
                        let actions: parsedAction[] = (this as any).getParsedTdActionsList;
                        let neededAction = actions.find((action) => action.interactionName === (this as any).selectedInteraction.name);
                        if(neededAction) return neededAction.availableOperations;
                        break;
                    case "events":
                        let events: parsedEvent[] = (this as any).getParsedTdEventsList;
                        let neededEvents = events.find((event) => event.interactionName === (this as any).selectedInteraction.name);
                        if(neededEvents) return neededEvents.availableOperations;
                        break;
                }
                return null;
            }
        },
        enableOpAndProtocol() {
            switch((this as any).selectedInteraction.type) {
                case 'properties':
                    if(this.propertiesList.includes(this.selectedInteraction.name)) return true;
                    break;
                case 'actions':
                    if(this.actionsList.includes(this.selectedInteraction.name)) return true;
                    break;
                case 'events':
                    if(this.eventsList.includes(this.selectedInteraction.name)) return true;
                    break;
            }
            return false;
        }
    },
    methods : { 
        ...mapActions('TdStore', ['pushToSelections']),
        resetInteractionSelection() {
            this.selectedInteraction.name = "";
        },
        resetAll() {
            this.selectedInteraction.name = "";
            this.selectedInteraction.type = "";
            this.selectedInteraction.protocol = "";
            this.selectedInteraction.op = (this as any).interactionTypeOptions[0];
        },
        getOpertaionString(op: string) {
            switch(op) {
                case 'readproperty':
                    return 'read';
                case 'writeproperty':
                    return 'write';
                case 'observeproperty':
                    return 'observe';
                case 'unobserveproperty':
                    return 'unobserve';
                case 'invokeaction':
                    return 'invoke';
                case 'subscribeevent':
                    return 'subscribe';
                case 'unsubscribeevent':
                    return 'unsubscribe';
            }
        }
    },
    watch: {
        '$route'() {
            this.resetAll();
        }
    }
})
</script>


<style lang="less" scoped>
#interaction-selector-area {
    width: 100%;
    height: 100%;
}

.interaction-selection {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    width: 100%;
    height: fit-content;
}

.interaction-selection input {
    margin: 0 1pt;
}

</style>