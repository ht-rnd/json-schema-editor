import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { FieldList } from "../../../lib/components/features/form/FieldList";
import { TooltipProvider } from "../../../lib/components/ui/tooltip";

beforeAll(() => {
	global.ResizeObserver = class ResizeObserver {
		observe = vi.fn();
		unobserve = vi.fn();
		disconnect = vi.fn();
	};
});

interface FieldListFormProps {
	defaultValues: {
		properties: Array<{
			fieldId: string;
			key: string;
			schema: {
				type: string;
			};
		}>;
	};
	readOnly?: boolean;
	onRemove?: () => void;
	onOpenSettings?: () => void;
}

const FieldListForm = ({
	defaultValues,
	readOnly = false,
	onRemove = vi.fn(),
	onOpenSettings = vi.fn(),
}: FieldListFormProps) => {
	const methods = useForm({ defaultValues });
	const fields = methods.watch("properties");

	return (
		<FormProvider {...methods}>
			<TooltipProvider>
				<FieldList
					theme="dark"
					readOnly={readOnly}
					fields={fields}
					onRemove={onRemove}
					onOpenSettings={onOpenSettings}
				/>
			</TooltipProvider>
		</FormProvider>
	);
};

const mockFields = {
	properties: [
		{ fieldId: "1", key: "name", schema: { type: "string" } },
		{ fieldId: "2", key: "age", schema: { type: "integer" } },
	],
};

describe("FieldList", () => {
	it("renders a Field for each item in the fields array", () => {
		render(<FieldListForm defaultValues={mockFields} />);

		expect(screen.getAllByTestId("field")).toHaveLength(2);
		expect(screen.getByDisplayValue("name")).toBeInTheDocument();
		expect(screen.getByDisplayValue("age")).toBeInTheDocument();
	});

	it("calls onRemove with the correct index when a field is removed", () => {
		const onRemove = vi.fn();
		render(<FieldListForm defaultValues={mockFields} onRemove={onRemove} />);

		const deleteButtons = screen.getAllByTestId("delete-button");
		fireEvent.click(deleteButtons[1]);

		const confirmButton = screen.getByRole("button", { name: "Delete" });
		fireEvent.click(confirmButton);

		expect(onRemove).toHaveBeenCalledWith(1);
		expect(onRemove).not.toHaveBeenCalledWith(0);
	});

	it("passes readOnly prop to child Field components", () => {
		render(<FieldListForm defaultValues={mockFields} readOnly={true} />);

		const inputs = screen.getAllByPlaceholderText("field_name");
		expect(inputs[0]).toBeDisabled();
		expect(inputs[1]).toBeDisabled();

		const deleteButtons = screen.getAllByTestId("delete-button");
		expect(deleteButtons[0]).toBeDisabled();
		expect(deleteButtons[1]).toBeDisabled();
	});
});
