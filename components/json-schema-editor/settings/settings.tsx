import * as React from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "../lib/utils";
import type { DivSettingsProps } from "../types/props";
import { Separator } from "../ui/separator";
import { ArraySettings } from "./array-settings";
import { BoolCombSettings } from "./bool-comb-settings";
import { BooleanSettings } from "./boolean-settings";
import { IntegerSettings } from "./integer-settings";
import { NumberSettings } from "./number-settings";
import { ObjectSettings } from "./object-settings";
import { RootSettings } from "./root-settings";
import { StringSettings } from "./string-settings";

const Settings = React.forwardRef<HTMLDivElement, DivSettingsProps>(
  ({ className, basePath, readOnly = false, theme, ...props }, ref) => {
    const { watch } = useFormContext();
    const type = watch(`${basePath}.type`);

    const typeSettings = () => {
      switch (type) {
        case "number":
          return <NumberSettings basePath={basePath} readOnly={readOnly} theme={theme} />;
        case "integer":
          return <IntegerSettings basePath={basePath} readOnly={readOnly} theme={theme} />;
        case "string":
          return <StringSettings basePath={basePath} readOnly={readOnly} theme={theme} />;
        case "boolean":
          return <BooleanSettings basePath={basePath} readOnly={readOnly} theme={theme} />;
        case "array":
          return <ArraySettings basePath={basePath} readOnly={readOnly} theme={theme} />;
        case "object":
          return <ObjectSettings basePath={basePath} readOnly={readOnly} theme={theme} />;
        default:
          return <>{`Settings for type ${type} are not yet implemented.`}</>;
      }
    };

    return (
      <div
        ref={ref}
        className={cn("bg-background text-foreground border-input", className)}
        {...props}
      >
        {basePath === "root" && (
          <>
            <RootSettings basePath={basePath} readOnly={readOnly} theme={theme} />
            <Separator className="my-4" />
          </>
        )}

        {typeSettings()}

        <BoolCombSettings basePath={basePath} readOnly={readOnly} theme={theme} />
      </div>
    );
  },
);
Settings.displayName = "Settings";

export { Settings };
