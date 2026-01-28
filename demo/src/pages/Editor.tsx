import { JsonSchemaEditor } from "@json-schema-editor";
import { useState, useMemo } from "react";
import { RootType } from "src/types";
import { exampleSchema } from "../data/examples";
import type { Styles } from "../../../components/json-schema-editor/lib/constants";
import { EditorConfig } from "../components/EditorConfig";

export function Editor() {
  const [rootType, setRootType] = useState<RootType>("object");
  const [selectedSchema, setSelectedSchema] = useState<string>("emptySchema");
  const [styles, setStyles] = useState<Partial<Styles>>({
    form: { width: "full", height: "md" },
    output: { position: "bottom", showJson: true, width: "full", height: "md" },
    settings: { width: "md" },
    spacing: "md",
  });

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
        styles={styles}
        onRootTypeChange={handleRootTypeChange}
        onSchemaChange={setSelectedSchema}
        onStylesChange={setStyles}
      />

      <p className="text-2xl font-medium">JSON Schema Editor</p>

      <JsonSchemaEditor
        key={`${rootType}-${selectedSchema}`}
        rootType={rootType}
        readOnly={false}
        defaultValue={exampleSchema[selectedSchema]}
        styles={styles}
      />
    </div>
  );
}
