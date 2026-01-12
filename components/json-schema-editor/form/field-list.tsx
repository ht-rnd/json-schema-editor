import * as React from "react";
import type { FieldArrayWithId } from "react-hook-form";
import { cn } from "../lib/utils";
import { Field } from "./field";

export interface FieldListProps extends React.HTMLAttributes<HTMLDivElement> {
  readOnly?: boolean;
  fields: FieldArrayWithId<any, "properties", "fieldId">[];
  onRemove?: (index: number) => void;
  onOpenSettings?: (path: string) => void;
}

const FieldList = React.forwardRef<HTMLDivElement, FieldListProps>(
  ({ className, readOnly = false, fields, onRemove, onOpenSettings, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("pl-2 border-l-2 border-input", className)} {...props}>
        {fields.map((field, index) => (
          <Field
            key={field.fieldId}
            readOnly={readOnly}
            fieldPath={`properties.${index}`}
            onRemove={() => onRemove?.(index)}
            onOpenSettings={onOpenSettings}
            isRootLevel={true}
          />
        ))}
      </div>
    );
  },
);
FieldList.displayName = "FieldList";

export { FieldList };
