import * as React from "react";
import type { FieldArrayWithId } from "react-hook-form";
import { Field } from "./field";
import { cn } from "./lib/utils";

export interface FieldListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the form is read-only */
  readOnly?: boolean;
  /** Field array from react-hook-form */
  fields: FieldArrayWithId<any, "properties", "fieldId">[];
  /** Callback when a field is removed */
  onRemove?: (index: number) => void;
  /** Callback when settings button is clicked */
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
