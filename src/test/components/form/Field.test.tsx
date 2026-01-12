import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Field } from "../../../lib/components/features/form/Field";
import { TooltipProvider } from "../../../lib/components/ui/tooltip";

beforeAll(() => {
	global.ResizeObserver = class ResizeObserver {
		observe = vi.fn();
		unobserve = vi.fn();
		disconnect = vi.fn();
	};
});

interface FieldFormProps {
	defaultValues: {
		[key: string]: {
			key: string;
			schema: {
				type: string;
				properties?: Array<{ id: string; key: string; schema: any }>;
				items?: { schema: { type: string; title?: string } };
				title?: string;
			};
		};
	};
	readOnly?: boolean;
	fieldPath?: string;
}

const FieldForm = ({
	defaultValues,
	readOnly = false,
	fieldPath = "field",
}: FieldFormProps) => {
	const methods = useForm({ defaultValues });
	return (
		<FormProvider {...methods}>
			<TooltipProvider>
				<Field
					theme="dark"
					readOnly={readOnly}
					fieldPath={fieldPath}
					onRemove={vi.fn()}
					onOpenSettings={vi.fn()}
					isRootLevel={true}
				/>
			</TooltipProvider>
		</FormProvider>
	);
};

describe("Field", () => {
	it("renders Field for a string type", () => {
		const defaultValues = {
			field: { key: "name", schema: { type: "string" } },
		};
		render(<FieldForm defaultValues={defaultValues} />);

		expect(screen.getAllByTestId("field")).toHaveLength(1);
		expect(screen.getByPlaceholderText("field_name")).toBeInTheDocument();
	});

	it("recursively renders fields for an object type", () => {
		const defaultValues = {
			field: {
				key: "user",
				schema: {
					type: "object",
					properties: [{ id: "1", key: "name", schema: { type: "string" } }],
				},
			},
		};
		render(<FieldForm defaultValues={defaultValues} />);

		expect(screen.getAllByTestId("field")).toHaveLength(2);
		expect(screen.getByDisplayValue("user")).toBeInTheDocument();
		expect(screen.getByDisplayValue("name")).toBeInTheDocument();
	});

	it("adds a new field when 'Add Field' button is clicked for an object", () => {
		const defaultValues = {
			field: {
				key: "user",
				schema: { type: "object", properties: [] },
			},
		};
		render(<FieldForm defaultValues={defaultValues} />);

		expect(screen.getAllByTestId("field")).toHaveLength(1);

		const addButton = screen.getByRole("button", { name: "Add Field" });
		fireEvent.click(addButton);

		expect(screen.getAllByTestId("field")).toHaveLength(2);
	});

	it("removes a field when 'Delete' button is clicked", () => {
		const defaultValues = {
			field: {
				key: "user",
				schema: { type: "object", properties: [] },
			},
		};
		render(<FieldForm defaultValues={defaultValues} />);

		expect(screen.getAllByTestId("field")).toHaveLength(1);
		const addButton = screen.getByRole("button", { name: "Add Field" });
		fireEvent.click(addButton);
		expect(screen.getAllByTestId("field")).toHaveLength(2);

		const addedFieldInput = screen.getByDisplayValue(/^field_[A-Za-z0-9-]{6}$/);
		expect(addedFieldInput).toBeInTheDocument();

		const deleteButton = screen.getAllByTestId("delete-button")[1];
		fireEvent.click(deleteButton);
		fireEvent.click(screen.getByText("Delete"));

		expect(screen.getAllByTestId("field")).toHaveLength(1);
		expect(addedFieldInput).not.toBeInTheDocument();
	});

	it("renders a nested field for an array's items", () => {
		const defaultValues = {
			field: {
				key: "tags",
				schema: {
					type: "array",
					items: { schema: { type: "string", title: "Tag" } },
				},
			},
		};
		render(<FieldForm defaultValues={defaultValues} />);

		expect(screen.getAllByTestId("field")).toHaveLength(2);
		expect(screen.getByDisplayValue("Tag")).toBeInTheDocument();
	});

	it("disables 'Add Field' button when readOnly is true", () => {
		const defaultValues = {
			field: { key: "user", schema: { type: "object", properties: [] } },
		};
		render(<FieldForm defaultValues={defaultValues} readOnly={true} />);

		const addButton = screen.getByRole("button", { name: "Add Field" });
		expect(addButton).toBeDisabled();
	});

	it("changes the field schema when a new type is selected", () => {
		const defaultValues = {
			field: { key: "name", schema: { type: "string" } },
		};
		render(<FieldForm defaultValues={defaultValues} />);

		const typeSelect = screen.getByRole("combobox");
		fireEvent.click(typeSelect);
		fireEvent.click(screen.getByText("object"));

		expect(screen.getByText("Add Field")).toBeInTheDocument();
	});

	it("handles changing the type to an array", () => {
		const defaultValues = {
			field: { key: "name", schema: { type: "string" } },
		};
		render(<FieldForm defaultValues={defaultValues} />);

		const typeSelect = screen.getByRole("combobox");
		fireEvent.click(typeSelect);
		fireEvent.click(screen.getByText("array"));

		expect(screen.getAllByTestId("field")).toHaveLength(2);
	});

	it("handles changing the type to a number", () => {
		const defaultValues = {
			field: { key: "name", schema: { type: "string" } },
		};
		render(<FieldForm defaultValues={defaultValues} />);

		const typeSelect = screen.getByRole("combobox");
		fireEvent.click(typeSelect);
		fireEvent.click(screen.getByText("number"));

		expect(screen.getAllByTestId("field")).toHaveLength(1);
	});

	it("does not render a remove button for an array's item field", () => {
		const defaultValues = {
			field: {
				key: "tags",
				schema: {
					type: "array",
					items: { schema: { type: "string" } },
				},
			},
		};
		render(<FieldForm defaultValues={defaultValues} />);

		expect(screen.getAllByTestId("delete-button")).toHaveLength(1);
		const field = screen.getByTestId("field-array");
		expect(field.querySelector('[data-testid="delete-button"]')).toBeNull();
	});
});
