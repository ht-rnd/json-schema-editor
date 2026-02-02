import { Checkbox } from "../../../components/ui/checkbox";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import type { RootType } from "../types";
import type { EditorConfigProps } from "../types/props";

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

export function EditorConfig({
  rootType,
  selectedSchema,
  schemas,
  showOutput,
  onRootTypeChange,
  onSchemaChange,
  onShowOutputChange,
}: EditorConfigProps) {
  return (
    <div>
      <p className="text-2xl font-medium mb-6">Editor Configuration</p>

      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Label htmlFor="root-type" className="w-full text-sm text-muted-foreground">
            Root Type
          </Label>

          <Select value={rootType} onValueChange={(value) => onRootTypeChange(value as RootType)}>
            <SelectTrigger id="root-type">
              <SelectValue />
            </SelectTrigger>

            <SelectContent className="bg-background text-foreground border-input">
              <SelectItem value="object">Object</SelectItem>
              <SelectItem value="array">Array</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="schema-example" className="w-full text-sm text-muted-foreground">
            Example
          </Label>

          <Select value={selectedSchema} onValueChange={onSchemaChange}>
            <SelectTrigger id="schema-example">
              <SelectValue />
            </SelectTrigger>

            <SelectContent className="bg-background text-foreground border-input">
              {schemas.map((schemaName) => (
                <SelectItem key={schemaName} value={schemaName}>
                  {schemaLabels[schemaName] || schemaName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="show-json" className="w-full text-sm text-muted-foreground">
            Show JSON Output
          </Label>

          <Checkbox
            id="show-json"
            checked={showOutput}
            onCheckedChange={(checked) => onShowOutputChange(!!checked)}
            className="w-8 h-8 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
