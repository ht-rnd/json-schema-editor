import { Controller, useFormContext } from "react-hook-form";
import { RootProps } from "../../../interfaces/interfaces";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { Hammer, PlusCircle, Settings, TriangleAlert } from "lucide-react";

export const Root = ({
  theme,
  readOnly,
  rootType,
  onAddField,
  onOpenSettings,
}: RootProps) => {
  const { control } = useFormContext();

  return (
    <div className="flex gap-2">
      <Input value="root" disabled className="w-40" />

      <Select disabled value={rootType}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          className={`${theme} max-h-52 bg-background text-foreground border-input`}
        >
          <SelectItem value={rootType}>{rootType}</SelectItem>
        </SelectContent>
      </Select>

      <Controller
        control={control}
        name="root.title"
        render={({ field }) => (
          <Input
            placeholder="Title"
            disabled={readOnly}
            className="flex-1"
            {...field}
          />
        )}
      />

      <Controller
        control={control}
        name="root.description"
        render={({ field }) => (
          <Input
            placeholder="Description"
            disabled={readOnly}
            className="flex-1"
            {...field}
          />
        )}
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button disabled size="icon">
            <TriangleAlert />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Required</p>
        </TooltipContent>
      </Tooltip>

      {/*{rootType === "object" && (
        <Controller
          control={control}
          name="root.isModifiable"
          render={({ field }) => (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={readOnly}
                  size="icon"
                  variant={field.value ? "default" : "outline"}
                  onClick={() => {
                    field.onChange(!field.value);
                  }}
                >
                  <Hammer />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>X-Modifiable</p>
              </TooltipContent>
            </Tooltip>
          )}
        />
      )}*/}

      <div className="border-l-2 border-input"></div>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => onOpenSettings("root")}
      >
        <Settings className="text-blue-500" />
      </Button>

      {rootType === "object" && (
        <Button
          size="icon"
          variant="ghost"
          disabled={readOnly}
          onClick={onAddField}
        >
          <PlusCircle className="text-green-500" />
        </Button>
      )}

      <div></div>
    </div>
  );
};
