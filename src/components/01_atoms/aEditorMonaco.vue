<template>
  <div :id="id" class="monaco-editor">

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
        editorOptions: {
            type: Object as () => Monaco.editor.IStandaloneEditorConstructionOptions,
            required: false
        },
        id: {
            type: String,
            required: true
        },
        cursorPositon: {
            type: Object as () => Monaco.IPosition,
            required: false
        },
        diagnosticOptionsParamters: {
            type: Object as () => WADE.MonacoDiagnosticOptions | null,
            required: false
        }
    },
    data() {
        return {
            monacoEditor: {} as Monaco.editor.IStandaloneCodeEditor,
            modelContentListener: {} as Monaco.IDisposable,
            options: {}
        };
    },
    methods: {
        
    },
    mounted() {
        this.$nextTick(function() {
            const container = document.getElementById(this.id);
            const modelUriString = this.diagnosticOptionsParamters ? this.diagnosticOptionsParamters.modelUri : "urn:document:"+ this.language;
            const modelUri = Monaco.Uri.parse(modelUriString);
            const model =  Monaco.editor.createModel(this.code, this.language, modelUri);

            // Schema 
            let json: string;
            let blob: Blob;
            let schemaUri: string;
            let schema: object | "td-schema";
            if(this.language == "json" && this.diagnosticOptionsParamters) {
                schema = this.diagnosticOptionsParamters.schema;
                if(schema === "td-schema") {
                    let tdSchemaPath = "";
                    if(isDevelopment()) {
                        tdSchemaPath = path.join(getRootDirInDev(), "src/util/td-schema.json");
                    } else {
                        tdSchemaPath = path.join(process.resourcesPath, "td-schema.json");
                    }
                    schema = JSON.parse(readFileSync(tdSchemaPath).toString());
                } else if (typeof schema === "object") {
                    let tmp = {};
                    for(let prop in schema) {
                        if(prop !== "value") tmp[prop] =  schema[prop];
                    }
                    schema = tmp
                }

                // https://stackoverflow.com/questions/60458574/is-there-any-way-to-disable-fetching-based-on-the-schema-field-in-monaco-editor
                json = JSON.stringify(schema);
                blob = new Blob([json], {type: "application/json"});
                schemaUri = URL.createObjectURL(blob);
            }

            let newOptions = {
                model: model,
                scrollBeyondLastLine: false,
                fontSize: 15,
                tabSize: 4
            }

            if(this.editorOptions) Object.assign(newOptions, this.editorOptions)
            
            this.options = newOptions;
            if (container) this.monacoEditor = Monaco.editor.create(container, newOptions);
            if(this.cursorPositon) this.monacoEditor.setPosition(this.cursorPositon)


            window.onresize = () => {
                this.monacoEditor.layout();
            };

            this.monacoEditor.onDidFocusEditorText(() => {
                console.log(schema);
                if(this.diagnosticOptionsParamters && this.language == "json") {
                    Monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                        validate: true,
                        enableSchemaRequest: true,
                        schemas: [{
                            uri: schemaUri,
                            fileMatch: [modelUriString],
                            schema: schema
                        }],
                    });
                }
            });

            this.monacoEditor.addCommand(Monaco.KeyCode.KEY_S | Monaco.KeyMod.CtrlCmd, () => {this.$emit('save')});

            this.$eventHub.$on('tab-clicked', () => {setTimeout(() => {this.monacoEditor.layout(); }, 3); });
            this.modelContentListener = this.monacoEditor.onDidChangeModelContent((e) => this.$emit('change', this.monacoEditor.getValue()));
        });
    },
    beforeUpdate() {
        let model: Monaco.editor.ITextModel|null = null;
        if(this.monacoEditor) model = this.monacoEditor.getModel();
        //if(model) model.dispose();
    },
    updated() {
        console.log(this.id +"editor updated");
        
    },
    beforeDestroy() {
        this.$eventHub.$off('tab-clicked');
        this.modelContentListener.dispose();

        let model: Monaco.editor.ITextModel|null = null;
        if(this.monacoEditor) model = this.monacoEditor.getModel();
        if(model) model.dispose();
        
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
    .monaco-editor {
        height: 100%;
        width: 100%;
    }
</style>