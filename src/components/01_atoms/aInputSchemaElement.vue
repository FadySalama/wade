<template>
  <div class="input-field-area">
    <aEditorMonaco class="input-field object" 
      v-if="inputSchema.type === 'array'" language="json" code="[]" 
      :id="inputName+'-editor'" 
      :editorOptions="{minimap: {enabled: false}}" 
      :diagnosticOptionsParamters="diaOptionsParams" 
      @change="emitValue($event)"
    />

    <select v-if="inputSchema.type === 'boolean'" 
      :value="inputValue" 
      @input="emitValue($event.target.value)">
      <option value="true">True</option>
      <option value="false">False</option>
    </select>

    <input v-if="inputSchema.type === 'number'" 
      type="number" placeholder="number" 
      :min="inputSchema.minimum" 
      :max="inputSchema.maximum" 
      :step="inputSchema.multipleOf ? inputSchema.multipleOf : 0.01" 
      :value="inputValue" 
      @input="emitValue($event.target.value)"
    >

    <input v-if="inputSchema.type === 'integer'" 
      type="number" placeholder="integer" 
      :min="inputSchema.minimum" 
      :max="inputSchema.maximum" 
      :step="inputSchema.multipleOf ? inputSchema.multipleOf : 1" 
      :value="inputValue"
      @input="emitValue($event.target.value)"
    >

    <aEditorMonaco class="input-field object"
      v-if="inputSchema.type === 'object'" 
      code="{}" language="json"
      :id="inputName+'-editor'"
      :editorOptions="{minimap: {enabled: false}}" 
      :diagnosticOptionsParamters="diaOptionsParams" 
      @change="emitValue($event)"
    />

    <aEditorMonaco class="input-field string" 
      v-if="inputSchema.type === 'string'" 
      code='""' language="json" 
      :id="inputName+'-editor'" 
      :diagnosticOptionsParamters="diaOptionsParams" 
      :editorOptions="{minimap: {enabled: false}, lineNumbers: 'off'}" 
      @change="emitValue($event)"
    />
    
  </div>
</template>

<script lang="ts">
import aEditorMonaco from '@/components/01_atoms/aEditorMonaco.vue';
import Vue from 'vue';
export default Vue.extend({
  name: 'aInputSchemaElement',
  model:{
    prop: 'inputValue',
    event: 'input'
  },
  components: {
    aEditorMonaco,
  },
  data() {
    return {
      placeholder: '',
    };
  },
  props: {
    inputName: {
      type: String,
      required: true
    },
    inputSchema: {
      type: Object as () => WADE.TdDataSchemaInterface,
      required: true
    },
    inputValue: {
      required: false
    }
  },
  computed: {
    diaOptionsParams(): WADE.MonacoDiagnosticOptions {
      return {
        modelUri: `urn:${this.inputName}:inputSchema`,
        schema: this.inputSchema
      }
    }
  },
  methods: {
    emitValue(value: any) {
      if(value) {
        try {
          this.$emit('input', JSON.parse(value));
        } catch (error) {
          this.$emit('input', undefined);
        }
      } else {
        this.$emit('input', undefined);
      }
    }
  }
});
</script>



<style scoped>
.input-field-area {
  width: 100%;
  height: 75%;
}

.input-field {
  width: 100%;
}

.object {
  height: 72pt;
}

.string {
  height: 18pt;
}




</style>

