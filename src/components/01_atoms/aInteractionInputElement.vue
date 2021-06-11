<template>
  <div input-field>
    <select v-if="inputScheme.type = 'boolean'" :value="inputValue" @input="$emit('input', $event.target.value)">
      <option value="true">True</option>
      <option value="false">False</option>
    </select>

  </div>
</template>

<script lang="ts">
import { parsedInteraction, parsedAction, parsedProperty } from '@/backend/TdParser';
import { DataSchemaTypes, InteractionAffordancesTypes } from '@/util/enums';
import Vue from 'vue';
export default Vue.extend({
  name: 'aInteractionInput',
  data() {
    return {
      inputValue: '',
      placeholder: '',
      uriVariables: [] as WADE.TdDataSchemaInterface[],
    };
  },
  props: {
    inputName: {
      type: String,
      required: true
    },
    inputScheme: {
      type: Object as () => WADE.TdDataSchemaInterface,
      required: true
    },
    inputValue: {
      required: true
    }
  },
  computed: {
  
  },
  methods: {
  }
});
</script>



<style scoped>
.btn-selection-container-selected {
  background: #305e5c !important;
}

.btn-selection-container-selected :hover {
  background: #305e5c !important;
}

.btn-input-container {
  background: #b5dfdd;
  height: 100%;
  background: #b5dfdd;
  display: flex;
  height: 100%;
  align-items: center;
  padding: 3px;
  border-bottom-right-radius: 3px;
  border-top-right-radius: 3px;
}

.input-text {
  border: 1px solid #393b3a;
  border-radius: 3px;
  height: 100%;
  padding: 3px;
  font-size: 14px;
  width: 70%;
  background: none;
}

.input-dropdown {
  border: 1px solid #393b3a;
  border-radius: 3px;
  height: 100%;
  padding: 3px;
  font-size: 14px;
  width: 70%;
  background: none;
  position: relative;
  display: inline-block;
}

.input-dropdown-content {
  padding: 3px;
  display: none;
  position: absolute;
  background-color: #f1f1f1;
  left: -100%;
  width: 200%;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  border-radius: 3px;
}

.input-dropdown-content:hover {
  background-color: #f1f1f1 !important;
}

.input-dropdown-btn {
  height: 100%;
  width: 100%;
  font-size: 14px;
  outline: none;
  border: none;
  background: none;
  text-align: left;
  padding-left: 1px;
  overflow: hidden;
}
.input-dropdown-content-visible {
  display: block;
}

.input-dropdown-content label {
  display: block;
}

.select-btn-container {
  width: 30%;
  height: 100%;
  text-align: center;
}

.select-btn-container img {
  max-height: 100%;
  object-fit: contain;
  max-width: 100%;
  padding: 5px;
}
</style>

