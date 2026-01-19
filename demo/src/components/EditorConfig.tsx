import { Label } from "../../../components/json-schema-editor/ui/label";
import { Checkbox } from "../../../components/json-schema-editor/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/json-schema-editor/ui/select";
import { RootType } from "src/types";
import { EditorConfigProps } from "src/types/props";

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
  theme,
  rootType,
  selectedSchema,
  schemas,
  styles,
  onRootTypeChange,
  onSchemaChange,
  onStylesChange,
}: EditorConfigProps) {
  return (
    <div>
      <p className="text-2xl font-medium mb-6">Editor Configuration</p>
      <div className="border border-input rounded-lg p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="p-4 rounded-md border border-input">
          <p className="text-sm font-medium text-foreground mb-4">SCHEMA</p>

          <div className="flex flex-col gap-2 mb-4">
            <Label
              htmlFor="root-type"
              className="text-sm text-muted-foreground"
            >
              Root Type
            </Label>
            <Select
              value={rootType}
              onValueChange={(value) => onRootTypeChange(value as RootType)}
            >
              <SelectTrigger id="root-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className={`bg-background text-foreground border-input ${theme}`}
              >
                <SelectItem value="object">Object</SelectItem>
                <SelectItem value="array">Array</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="schema-example"
              className="text-sm text-muted-foreground"
            >
              Example
            </Label>
            <Select value={selectedSchema} onValueChange={onSchemaChange}>
              <SelectTrigger id="schema-example" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className={`bg-background text-foreground border-input ${theme}`}
              >
                {schemas.map((schemaName) => (
                  <SelectItem key={schemaName} value={schemaName}>
                    {schemaLabels[schemaName] || schemaName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4 p-4 rounded-md border border-input">
          <p className="text-sm font-medium text-foreground mb-4">
            FORM DIMENSIONS
          </p>

          <div className="grid grid-cols-2 gap-3  mb-4">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="form-width"
                className="text-sm text-muted-foreground"
              >
                Width
              </Label>
              <Select
                value={styles.form?.width || "full"}
                onValueChange={(value: any) =>
                  onStylesChange({
                    ...styles,
                    form: { ...styles.form!, width: value },
                  })
                }
              >
                <SelectTrigger id="form-width" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={`bg-background text-foreground border-input ${theme}`}
                >
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="md">Medium</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="form-height"
                className="text-sm text-muted-foreground"
              >
                Height
              </Label>
              <Select
                value={styles.form?.height || "md"}
                onValueChange={(value: any) =>
                  onStylesChange({
                    ...styles,
                    form: { ...styles.form!, height: value },
                  })
                }
              >
                <SelectTrigger id="form-height" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={`bg-background text-foreground border-input ${theme}`}
                >
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="md">Medium</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-sm font-medium text-foreground  mb-4">
            OUTPUT DIMENSIONS
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="output-width"
                className="text-sm text-muted-foreground"
              >
                Width
              </Label>
              <Select
                value={styles.output?.width || "full"}
                onValueChange={(value: any) =>
                  onStylesChange({
                    ...styles,
                    output: { ...styles.output!, width: value },
                  })
                }
              >
                <SelectTrigger id="output-width" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={`bg-background text-foreground border-input ${theme}`}
                >
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="md">Medium</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="output-height"
                className="text-sm text-muted-foreground"
              >
                Height
              </Label>
              <Select
                value={styles.output?.height || "md"}
                onValueChange={(value: any) =>
                  onStylesChange({
                    ...styles,
                    output: { ...styles.output!, height: value },
                  })
                }
              >
                <SelectTrigger id="output-height" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={`bg-background text-foreground border-input ${theme}`}
                >
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="md">Medium</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-md border border-input">
          <p className="text-sm font-medium text-foreground mb-4">LAYOUT</p>

          <div className="flex flex-col gap-2 mb-4">
            <Label
              htmlFor="output-position"
              className="text-sm text-muted-foreground"
            >
              Output Position
            </Label>
            <Select
              value={styles.output?.position || "bottom"}
              onValueChange={(value: any) =>
                onStylesChange({
                  ...styles,
                  output: { ...styles.output!, position: value },
                })
              }
            >
              <SelectTrigger id="output-position" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className={`bg-background text-foreground border-input ${theme}`}
              >
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="spacing" className="text-sm text-muted-foreground">
              Spacing
            </Label>
            <Select
              value={styles.spacing || "md"}
              onValueChange={(value: any) =>
                onStylesChange({ ...styles, spacing: value })
              }
            >
              <SelectTrigger id="spacing" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className={`bg-background text-foreground border-input ${theme}`}
              >
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-4 rounded-md border border-input">
          <p className="text-sm font-medium text-foreground mb-4">
            DISPLAY OPTIONS
          </p>

          <div className="flex items-center gap-3 p-2 rounded">
            <Checkbox
              id="show-json"
              checked={styles.output?.showJson ?? true}
              onCheckedChange={(checked) =>
                onStylesChange({
                  ...styles,
                  output: { ...styles.output!, showJson: !!checked },
                })
              }
            />
            <Label
              htmlFor="show-json"
              className="text-sm text-foreground cursor-pointer flex-1"
            >
              Show JSON Output
            </Label>
          </div>
        </div>

        <div className="p-4 rounded-md border border-input">
          <p className="text-sm font-medium text-foreground mb-4">
            SETTINGS PANEL
          </p>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="settings-width"
              className="text-sm text-muted-foreground"
            >
              Width
            </Label>
            <Select
              value={styles.settings?.width || "md"}
              onValueChange={(value: any) =>
                onStylesChange({
                  ...styles,
                  settings: { ...styles.settings!, width: value },
                })
              }
            >
              <SelectTrigger id="settings-width" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className={`bg-background text-foreground border-input ${theme}`}
              >
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
                <SelectItem value="full">Full</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
