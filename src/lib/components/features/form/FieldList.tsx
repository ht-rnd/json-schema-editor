import type { FieldListProps } from "../../../interfaces/interfaces";
import { Field } from "./Field";

export function FieldList({
	theme,
	readOnly,
	fields,
	onRemove,
	onOpenSettings,
}: FieldListProps) {
	return (
		<div className="pl-2 border-l-2 border-input">
			{fields.map((field, index) => (
				<Field
					key={field.fieldId}
					readOnly={readOnly}
					theme={theme}
					fieldPath={`properties.${index}`}
					onRemove={() => onRemove(index)}
					onOpenSettings={onOpenSettings}
					isRootLevel={true}
				/>
			))}
		</div>
	);
}
