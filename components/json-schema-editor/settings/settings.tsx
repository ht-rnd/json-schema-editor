import * as React from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "../lib/utils";
import { Separator } from "../ui/separator";
import { ArraySettings } from "./array-settings";
import { BooleanSettings } from "./boolean-settings";
import { IntegerSettings } from "./integer-settings";
import { NumberSettings } from "./number-settings";
import { ObjectSettings } from "./object-settings";
import { RootSettings } from "./root-settings";
import { StringSettings } from "./string-settings";

export interface SettingsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Base path in the form for this schema */
  basePath: string;
  /** Whether the form is read-only */
  readOnly?: boolean;
}

const Settings = React.forwardRef<HTMLDivElement, SettingsProps>(
  ({ className, basePath, readOnly = false, ...props }, ref) => {
    const { watch } = useFormContext();
    const type = watch(`${basePath}.type`);

    const typeSettings = () => {
      switch (type) {
        case "number":
          return <NumberSettings basePath={basePath} readOnly={readOnly} />;
        case "integer":
          return <IntegerSettings basePath={basePath} readOnly={readOnly} />;
        case "string":
          return <StringSettings basePath={basePath} readOnly={readOnly} />;
        case "boolean":
          return <BooleanSettings basePath={basePath} readOnly={readOnly} />;
        case "array":
          return <ArraySettings basePath={basePath} readOnly={readOnly} />;
        case "object":
          return <ObjectSettings basePath={basePath} readOnly={readOnly} />;
        default:
          return <>{`Settings for type ${type} are not yet implemented.`}</>;
      }
    };

    return (
      <div ref={ref} className={cn(className)} {...props}>
        {basePath === "root" && (
          <>
            <RootSettings basePath={basePath} readOnly={readOnly} />
            <Separator className="my-4" />
          </>
        )}

        {typeSettings()}
      </div>
    );
  },
);
Settings.displayName = "Settings";

export { Settings };
