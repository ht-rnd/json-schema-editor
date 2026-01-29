import { useMemo, useState } from "react";
import { JsonSchemaEditor } from "../../../components/ui/json-schema-editor";
import { EditorConfig } from "../components/EditorConfig";
import { exampleSchema } from "../data/examples";
import type { RootType } from "../types";

export function Editor() {
  const [rootType, setRootType] = useState<RootType>("object");
  const [selectedSchema, setSelectedSchema] = useState<string>("emptySchema");
  const [showOutput, setShowOutput] = useState<boolean>(true);

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
  };

  return (
    <div className="my-8 mx-16 min-h-[calc(100vh-113px)] flex flex-col gap-6">
      <EditorConfig
        rootType={rootType}
        selectedSchema={selectedSchema}
        schemas={schemas}
        showOutput={showOutput}
        onRootTypeChange={handleRootTypeChange}
        onSchemaChange={setSelectedSchema}
        onShowOutputChange={setShowOutput}
      />

      <p className="text-2xl font-medium">JSON Schema Editor</p>

      <JsonSchemaEditor
        key={`${rootType}-${selectedSchema}`}
        rootType={rootType}
        readOnly={false}
        showOutput={showOutput}
        defaultValue={exampleSchema[selectedSchema]}
      />
    </div>
  );
}
