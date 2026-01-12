import { useFormContext } from "react-hook-form";
import type { SettingsProps } from "../../../interfaces/interfaces";
import { ArraySettings } from "../../features/settings/ArraySettings";
import { BooleanSettings } from "../../features/settings/BooleanSettings";
import { IntegerSettings } from "../../features/settings/IntegerSettings";
import { NumberSettings } from "../../features/settings/NumberSettings";
import { ObjectSettings } from "../../features/settings/ObjectSettings";
import { StringSettings } from "../../features/settings/StringSettings";
import { Separator } from "../../ui/separator";
import { RootSettings } from "./RootSettings";

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
		</div>
	);
};
