<template>
    <div id="interaction-selector-area">
        <div class="label">
            <h2>Interaction Selection</h2>
        </div>
        <div class="body">
            <div class="interaction-selection">
                <select name="interaction-type" id="interaction-type-select" v-model="selectedInteraction.type">
                    <option v-for="(type, index) in interactionTypeOptions" :key="index" :value="type" > {{type.charAt(0).toUpperCase() + type.slice(1)}} </option>
                </select>
                <aFilteredDropdown id="test" v-model="selectedInteraction.name" :options="currentInteractionsList" @input="setOpAndProt()"/>
                <select name="interaction-op" id="interaction-op-select" v-model="selectedInteraction.op" :disabled="!isFullySelected">
                    <option v-for="(op, index) in currentOperations" :key="index" :value="op" :selected="isFullySelected && index === 0"> {{getOperationString(op)}} </option>
                </select>
                <select name="interaction-protocol" id="interaction-protocol-select" v-model="selectedInteraction.protocol" :disabled="!isFullySelected">
                    <option v-for="(protocol, index) in currentProtocols" :key="protocol" :value="protocol" :selected="isFullySelected && index === 0"> {{protocol}} </option>
                </select>
            </div>
            <div class="uri-variables-area" v-if="Object.values(selectedInteraction.uriVariables.schemas).length > 0">
                <h3>Uri-Variables</h3>
                <div v-for="(uriVariable, name) in selectedInteraction.uriVariables.schemas" :key="name" class="uri-variables-element">
                    <div>
                        {{ name }}: {{ uriVariable.title }}
                    </div>
                    <aInputSchemaElement :inputName="name" :inputSchema="uriVariable" v-model="selectedInteraction.uriVariables.value[name]"/>
                </div>
            </div>
            <div class="interaction-input-area" v-if="this.interactionInputSchema">
                <h3>Inputs</h3>
                <div class="interaction-input">
                    <aInputSchemaElement :inputName="selectedInteraction.name + '-input'" :inputSchema="interactionInputSchema" v-model="selectedInteraction.input.value"/>
                </div>  
            </div>
            <div>
                <aButtonBasic btnLabel="Add to selection" btnClass="btn-config-small" btnOnClick="add-to-select" @add-to-select=" addToSelection()"/>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import aFilteredDropdown from '@/components/01_atoms/aFilteredDropdown.vue';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';
import aInputSchemaElement from '@/components/01_atoms/aInputSchemaElement.vue'
import { mapGetters, mapActions, mapMutations } from 'vuex';
import { parsedAction, parsedEvent, parsedInteraction, parsedProperty, ParsedTd } from '@/backend/TdParser';
export default Vue.extend({
    components: {
        aFilteredDropdown,
        aButtonBasic,
        aInputSchemaElement
    },
    data() {
        return {
            selectedInteraction: {
                name: "",
                type: "",
                protocol: "",
                op: "",
                uriVariables: {
                    schemas: {} as any,
                    value: {} as any
                },
                input: {
                    schema: {} as WADE.TdDataSchemaInterface | {} | null,
                    value: null as any | null
                }
            },
            selectedInteractionsList: [] as any[],
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
        isFullySelected() {
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
        },
        selectedInteractionObject() {
            let listToSearch: parsedInteraction[]  = []
            switch(this.selectedInteraction.type as "properties" | "actions" | "events") {
                case "properties": listToSearch = ((this as any).getParsedTdPropertiesList) as parsedProperty[]; break;
                case "actions": listToSearch = ((this as any).getParsedTdActionsList) as parsedAction[]; break;
                case "events": listToSearch = ((this as any).getParsedTdEventsList) as parsedEvent[]; break;
            }

            let interactionObj = listToSearch.find(interaction => interaction.interactionName === (this as any).selectedInteraction.name);
            return interactionObj
        },
        interactionInputSchema() {
            if(this.isFullySelected) {
                if(this.selectedInteraction.type === "properties" && this.selectedInteraction.op === "writeproperty") {
                    let schema =  ((this as any).selectedInteractionObject as parsedProperty).dataSchema;
                    this.selectedInteraction.input.schema = schema;
                    return schema;
                } else if (this.selectedInteraction.type === "actions" && this.selectedInteraction.op === "invokeaction") {
                    let schema: WADE.TdDataSchemaInterface | undefined | null = ((this as any).selectedInteractionObject as parsedAction).input;
                    schema = schema ? schema : null;
                    this.selectedInteraction.input.schema = schema ;
                    return schema;
                } else {
                    this.selectedInteraction.input.schema = null;
                    this.selectedInteraction.input.value = null;
                    return null; 
                }
            }
            return undefined;
        }
    },
    methods : { 
        ...mapActions('TdStore', ['addToSelectedInteractions', 'updateSelectedInteraction']),
        resetInteractionSelection() {
            this.selectedInteraction.name = "";
            this.selectedInteraction.protocol = "";
            this.selectedInteraction.op = "";
        },
        resetAll() {
            this.selectedInteraction.name = "";
            this.selectedInteraction.type = (this as any).interactionTypeOptions[0];
            this.selectedInteraction.protocol = "";
            this.selectedInteraction.op = "";
        },
        getOperationString(op: string) {
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
        },
        setOpAndProt() {
            if(this.isFullySelected) {
                this.selectedInteraction.op = this.currentOperations ? this.currentOperations[0] : "";
                this.selectedInteraction.protocol = this.currentProtocols[0];
            }
        },
        addToSelection() {
            let interactionObj = JSON.parse(JSON.stringify(this.selectedInteraction));
            (this as any).addToSelectedInteractions({interaction: interactionObj});
        },
    },
    watch: {
        '$route'() {
            this.resetAll();
        },
        'selectedInteractionObject' (obj) {
            if(!obj) {
                this.selectedInteraction.input = {
                    schema: null,
                    value: null
                };
                this.selectedInteraction.uriVariables = {
                    schemas: {},
                    value: {}
                };
            } 
            if(obj && obj.uriVariables) {
                this.selectedInteraction.uriVariables.schemas = obj.uriVariables;
                for (let uriVariable in this.selectedInteraction.uriVariables.schemas) {
                    this.$set(this.selectedInteraction.uriVariables.value, uriVariable, undefined);
                }
            }
        }
    }
})
</script>


<style lang="less" scoped>
#interaction-selector-area {
    width: 100%;
    height: 100%;
}

div.label {
    background-color: rgb(99, 99, 99);
    margin-bottom: 1%;
    box-shadow: 0pt 3pt 3pt -1pt gray;
}

div.body {
    padding: 1%;
}

.interaction-selection {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    width: 100%;
    height: fit-content;
    margin-bottom: 1%;
}

.interaction-selection input select{
    margin: 0 1pt;
}

.interaction-selection select:first-child {
    margin-left: 0;
}

.uri-variables-area {
    width: 100%;
    height: 40%;
    overflow: scroll;
    border: 1pt solid gray;
    border-radius: 5pt;
    margin-bottom: 1%;
}

.uri-variables-area h3 {
    border-bottom: 1pt solid gray;
    padding: 1%;
}


.uri-variables-area div.uri-variables-element {
    border-bottom: 1pt solid gray;
    padding: 1%;
}

.uri-variables-area div.uri-variables-element:last-child {
    border-bottom: 0
}

.uri-variables-element {
    width: 100%;
    height: fit-content;
}

.interaction-input-area {
    width: 100%;
    height: 40%;
    border: 1pt solid gray;
    border-radius: 5pt;
    margin-bottom: 1%;
}

.interaction-input-area h3 {
    border-bottom: 1pt solid gray;
    padding: 1%;
}

.interaction-input-area div.interaction-input {
    padding: 1%;
}
</style>