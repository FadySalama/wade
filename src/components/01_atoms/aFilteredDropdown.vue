<template>
  <div class="filtered-dropdown-area">
    <div class="text-input-area">
        <input type="text" 
        :id="id" :value="textInput"
        @input="$emit('input', $event.target.value)"
        @focus="dropdownOpened = true"
        @blur="dropdownOpened = false">
        <aIcon v-if="options"  :iconSrcPath="imageSrc" :mouseOverIconSrcPath="hoverImageSrc"/>
    </div>
    <div v-if="dropdownOpened" class="dropdown-menu">
        <div class="dropdown-option" v-for="opt in filteredOptions" :key="opt" @mousedown.prevent @click="selectOption(opt)">
            {{opt}}
        </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import aIcon from '@/components/01_atoms/aIcon.vue'
export default Vue.extend({
    name: 'aFilteredDropdown',
    components: {
        aIcon
    },
    model: {
        prop: 'textInput',
        event: 'input'
    },
    props: {
        id: {
            type: String,
            required: true
        },
        options: {
            type: Array as () => Array<string>,
            required: false
        },
        textInput: {
            type: String,
            required: true
        } 
    },
    data() {
        return {
            dropdownOpened: false
        }
    },
    computed: {
        imageSrc() {
            if(this.dropdownOpened) return 'arrow_down'; else return 'arrow_right';
        },
        hoverImageSrc() {
            if(this.dropdownOpened) return 'arrow_down_white'; else return 'arrow_right_white';
        },
        filteredOptions() {
           if(this.options) return this.options.filter((str) => str.toLowerCase().includes(this.textInput.toLowerCase()));
        }
    },
    methods: {
        selectOption(option: string) {
            this.$emit('input', option);
            this.dropdownOpened = false;
        },
    }
})
</script>

<style scoped>
.filtered-dropdown-area {
    width: 100%;
    height: fit-content;
    position: relative;
}
.text-input-area {
    display: flex;
    flex-flow: row nowrap;
    border: 0.1pt solid black;
    border-radius: 1pt;
    width: 99%;
    height: 25pt;
}

.text-input-area * {
    background-color: white;
}

.text-input-area input {
    border: none;
    width: 100%;
    padding-left: 5%;
}

.dropdown-menu {
    padding: 2pt;
    position: absolute;
    right: 3pt;
    display: block;
    background-color: #f1f1f1;
    width: fit-content;
    min-width: 75%;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
    border-radius: 3px;
    text-align: right;
}

.dropdown-option:hover{
    background: #305e5c !important;
    color: white;
}

</style>