<template>
  <div id="monaco-editor">

  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import * as Monaco from 'monaco-editor';
import path from 'path';
import { readFileSync } from 'fs';
import { getRootDirInDev, isDevelopment } from '@/util/helpers';

export default Vue.extend({
    model: {
        prop: 'code',
        event: 'change'
    },
    props: {
        code: {
            type: String,
            required: true
        },
        language: {
            type: String,
            required: true
        },
        diagnosticOptionsParamters: {
            type: Object as () => WADE.MonacoDiagnosticOptions,
            required: false
        }
    },
    data() {
        return {
            monacoEditor: {} as Monaco.editor.IStandaloneCodeEditor,
            modelContentListener: {} as Monaco.IDisposable,
        };
    },
    mounted() {
        this.$nextTick(function() {
            const container = document.getElementById('monaco-editor');
            const modelUriString = this.diagnosticOptionsParamters ? this.diagnosticOptionsParamters.modelUri : "urn:document:"+ this.language;
            const modelUri = Monaco.Uri.parse(modelUriString);
            const model =  Monaco.editor.createModel(this.code, this.language, modelUri);
            
            console.log(this.diagnosticOptionsParamters.schema);
            if(this.language == "json" && this.diagnosticOptionsParamters.schema) {

                let schema = this.diagnosticOptionsParamters.schema;
                if(schema === "td-schema") {
                    let tdSchemaPath = "";
                    if(isDevelopment()) {
                        tdSchemaPath = path.join(getRootDirInDev(), "src/util/td-schema.json");
                    } else {
                        tdSchemaPath = path.join(process.resourcesPath, "td-schema.json");
                    }
                    schema = JSON.parse(readFileSync(tdSchemaPath).toString());
                }

                // https://stackoverflow.com/questions/60458574/is-there-any-way-to-disable-fetching-based-on-the-schema-field-in-monaco-editor
                const json = JSON.stringify(schema);
                const blob = new Blob([json], {type: "application/json"});
                const schemaUri = URL.createObjectURL(blob);

                Monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                    validate: true,
                    enableSchemaRequest: true,
                    schemas: [{
                        uri: schemaUri,
                        fileMatch: [modelUriString],
                        schema: schema
                    }],
                })
            }
            
            if (container) this.monacoEditor = Monaco.editor.create(container, {
                model: model,
                scrollBeyondLastLine: false,
                fontSize: 15,
                tabSize: 4
            });

            window.onresize = () => {
                this.monacoEditor.layout();
            };

            this.$eventHub.$on('tab-clicked', () => {setTimeout(() => {this.monacoEditor.layout(); }, 3); });
            this.modelContentListener = this.monacoEditor.onDidChangeModelContent((e) => this.$emit('change', this.monacoEditor.getValue()));
        });
    },
    beforeUpdate() {
        let model: Monaco.editor.ITextModel|null = null;
        if(this.monacoEditor) model = this.monacoEditor.getModel();
        if(model) model.dispose();
    },
    beforeDestroy() {
        this.$eventHub.$off('tab-clicked');
        this.modelContentListener.dispose();
        this.monacoEditor.dispose();
    },
    watch: {
        code(newCode: string, oldCode: string) {
            if (this.monacoEditor.getValue() !== newCode) this.monacoEditor.setValue(newCode);
        },
        language(newLanguage: string, oldLanguage: string) {
            const model = this.monacoEditor.getModel();
            if (model) Monaco.editor.setModelLanguage(model, newLanguage);
        }
    }
});
</script>

<style>
    #monaco-editor {
        height: 100%;
        width: 100%;
    }
</style>