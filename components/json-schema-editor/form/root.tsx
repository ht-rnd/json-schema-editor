import { PlusCircle, Settings, TriangleAlert } from "lucide-react";
import * as React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { cn } from "../lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export interface RootProps extends React.HTMLAttributes<HTMLDivElement> {
  readOnly?: boolean;
  rootType?: "object" | "array";
  onAddField?: () => void;
  onOpenSettings?: (path: string) => void;
}

const Root = React.forwardRef<HTMLDivElement, RootProps>(
  (
    { className, readOnly = false, rootType = "object", onAddField, onOpenSettings, ...props },
    ref,
  ) => {
    const { control } = useFormContext();

    return (
      <div ref={ref} className={cn("flex gap-2", className)} {...props}>
        <Input value="root" disabled className="w-40" />

        <Select disabled value={rootType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-52">
            <SelectItem value={rootType}>{rootType}</SelectItem>
          </SelectContent>
        </Select>

        <Controller
          control={control}
          name="root.title"
          render={({ field }) => (
            <Input placeholder="Title" disabled={readOnly} className="flex-1 min-w-24" {...field} />
          )}
        />

        <Controller
          control={control}
          name="root.description"
          render={({ field }) => (
            <Input
              placeholder="Description"
              disabled={readOnly}
              className="flex-1 min-w-32"
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

        <div className="border-l-2 border-input"></div>

        <Button
          size="icon"
          variant="ghost"
          data-testid="root-settings-button"
          onClick={() => onOpenSettings?.("root")}
        >
          <Settings className="text-blue-500" />
        </Button>

        {rootType === "object" && (
          <Button
            size="icon"
            variant="ghost"
            data-testid="root-add-button"
            disabled={readOnly}
            onClick={onAddField}
          >
            <PlusCircle className="text-green-500" />
          </Button>
        )}
      </div>
    );
  },
);
Root.displayName = "Root";

export { Root };
