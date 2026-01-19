import * as React from "react";
import { cn } from "../lib/utils";
import type { FieldListProps } from "../types/props";
import { Field } from "./field";

const FieldList = React.forwardRef<HTMLDivElement, FieldListProps>(
  ({ className, readOnly = false, fields, onRemove, onOpenSettings, theme, ...props }, ref) => {
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
            theme={theme}
          />
        ))}
      </div>
    );
  },
);
FieldList.displayName = "FieldList";

export { FieldList };
