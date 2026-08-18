import { useMemo, useState } from "react";
import { JsonSchemaEditor } from "../../../components/ui/json-schema-editor";
import type { JSONSchema } from "../../../src/lib/core/types";
import { EditorConfig } from "../components/EditorConfig";
import { exampleSchema } from "../data/examples";
import type { RootType } from "../types";

export function Editor() {
  const [rootType, setRootType] = useState<RootType>("object");
  const [selectedSchema, setSelectedSchema] = useState<string>("emptySchema");
  const [showOutput, setShowOutput] = useState<boolean>(true);
  const [defaultOutputCollapsed, setDefaultOutputCollapsed] = useState<boolean>(false);
  const [importedSchema, setImportedSchema] = useState<JSONSchema | null>(null);
  const [editorKey, setEditorKey] = useState(0);

  const schemas = useMemo(() => {
    return Object.entries(exampleSchema)
      .filter(([schemaName, schema]) => {
        if (!schema) {
          return (
            (schemaName === "emptySchema" && rootType === "object") ||
            (schemaName === "emptyArray" && rootType === "array")
          );
        }
        return schema.type === rootType;
      })
      .map(([schemaName]) => schemaName);
  }, [rootType]);

  const handleRootTypeChange = (newRootType: RootType) => {
    setRootType(newRootType);
    setSelectedSchema(newRootType === "object" ? "emptySchema" : "emptyArray");
    setImportedSchema(null);
    setEditorKey((key) => key + 1);
  };

  const handleSchemaChange = (schemaName: string) => {
    setSelectedSchema(schemaName);
    setImportedSchema(null);
    setEditorKey((key) => key + 1);
  };

  const handleJsonRootTypeChange = (newRootType: RootType, schema?: JSONSchema) => {
    setRootType(newRootType);
    setSelectedSchema(newRootType === "object" ? "emptySchema" : "emptyArray");
    setImportedSchema(schema ?? null);
    setEditorKey((key) => key + 1);
  };

  return (
    <div className="my-8 mx-16 min-h-[calc(100vh-113px)] flex flex-col gap-6">
      <EditorConfig
        rootType={rootType}
        selectedSchema={selectedSchema}
        schemas={schemas}
        showOutput={showOutput}
        defaultOutputCollapsed={defaultOutputCollapsed}
        onRootTypeChange={handleRootTypeChange}
        onSchemaChange={handleSchemaChange}
        onShowOutputChange={setShowOutput}
        onDefaultOutputCollapsedChange={setDefaultOutputCollapsed}
      />

      <p className="text-2xl font-medium">JSON Schema Editor</p>

      <JsonSchemaEditor
        key={`${rootType}-${selectedSchema}-${defaultOutputCollapsed}-${editorKey}`}
        rootType={rootType}
        readOnly={false}
        showOutput={showOutput}
        defaultOutputCollapsed={defaultOutputCollapsed}
        defaultValue={importedSchema ?? exampleSchema[selectedSchema]}
        onRootTypeChange={handleJsonRootTypeChange}
      />
    </div>
  );
}
