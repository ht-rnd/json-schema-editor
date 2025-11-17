import { useFormContext } from "react-hook-form";
import { SettingsProps } from "../../../interfaces/interfaces";
import { NumberSettings } from "../../features/settings/NumberSettings";
import { StringSettings } from "../../features/settings/StringSettings";
import { BooleanSettings } from "../../features/settings/BooleanSettings";
import { ArraySettings } from "../../features/settings/ArraySettings";
import { IntegerSettings } from "../../features/settings/IntegerSettings";
import { ObjectSettings } from "../../features/settings/ObjectSettings";
import { RootSettings } from "./RootSettings";
import { Separator } from "../../ui/separator";
import { BoolCombSettings } from "./BoolCombSettings";

export const Settings = ({ theme, basePath, readOnly }: SettingsProps) => {
  const { watch } = useFormContext();
  const type = watch(`${basePath}.type`);

  const typeSettings = () => {
    switch (type) {
      case "number":
        return (
          <NumberSettings
            theme={theme}
            basePath={basePath}
            readOnly={readOnly}
          />
        );
      case "integer":
        return (
          <IntegerSettings
            theme={theme}
            basePath={basePath}
            readOnly={readOnly}
          />
        );
      case "string":
        return (
          <StringSettings
            theme={theme}
            basePath={basePath}
            readOnly={readOnly}
          />
        );
      case "boolean":
        return (
          <BooleanSettings
            theme={theme}
            basePath={basePath}
            readOnly={readOnly}
          />
        );
      case "array":
        return (
          <ArraySettings
            theme={theme}
            basePath={basePath}
            readOnly={readOnly}
          />
        );
      case "object":
        return (
          <ObjectSettings
            theme={theme}
            basePath={basePath}
            readOnly={readOnly}
          />
        );
      default:
        return <>{`Settings for type ${type} are not yet implemented.`}</>;
    }
  };

  return (
    <div>
      {basePath === "root" && (
        <>
          <RootSettings theme={theme} basePath={basePath} readOnly={readOnly} />
          <Separator className="my-4" />
        </>
      )}

      {typeSettings()}

      <BoolCombSettings theme={theme} basePath={basePath} readOnly={readOnly} />
    </div>
  );
};
