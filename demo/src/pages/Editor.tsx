import { JsonSchemaEditor } from "@json-schema-editor";
import { useState, useMemo } from "react";
import { RootType } from "src/interfaces";
import { exampleSchema } from "../data/examples";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/json-schema-editor/ui/select";
import { Label } from "../../../components/json-schema-editor/ui/label";

const schemaLabels: Record<string, string> = {
  emptySchema: "Empty Schema",
  emptyArray: "Empty Array",
  user: "User Profile",
  product: "Product",
  config: "App Config",
  todoList: "Todo List",
  stringArray: "Tags Array",
  numberArray: "Scores Array",
};

export function Editor() {
  const [rootType, setRootType] = useState<RootType>("object");
  const [selectedSchema, setSelectedSchema] = useState<string>("emptySchema");

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
    <div className="my-8 mx-16 min-h-[calc(100vh-105px)] flex flex-col gap-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Label htmlFor="root-type">Root Type:</Label>
          <Select
            value={rootType}
            onValueChange={(value) => handleRootTypeChange(value as RootType)}
          >
            <SelectTrigger id="root-type" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="object">Object</SelectItem>
              <SelectItem value="array">Array</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="schema-example">Load Example:</Label>
          <Select value={selectedSchema} onValueChange={setSelectedSchema}>
            <SelectTrigger id="schema-example" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {schemas.map((schemaName) => (
                <SelectItem key={schemaName} value={schemaName}>
                  {schemaLabels[schemaName] || schemaName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <JsonSchemaEditor
        key={`${rootType}-${selectedSchema}`}
        rootType={rootType}
        readOnly={false}
        defaultValue={exampleSchema[selectedSchema]}
      />
    </div>
  );
}
