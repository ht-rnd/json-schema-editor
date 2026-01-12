import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { ObjectSettings } from "../../../lib/components/features/settings/ObjectSettings";

beforeAll(() => {
	global.ResizeObserver = class ResizeObserver {
		observe = vi.fn();
		unobserve = vi.fn();
		disconnect = vi.fn();
	};
});

vi.mock("../../../lib/components/ui/tags-input", () => ({
	TagsInput: ({ value, onValueChange, disabled = false, placeholder }: any) => (
		<div>
			<input
				placeholder={placeholder}
				disabled={disabled}
				onChange={(e) => onValueChange(e.target.value.split(","))}
				value={(value || []).join(",")}
			/>
			<span>{`Current Tags: ${(value || []).join(", ")}`}</span>
		</div>
	),
}));

const Settings = ({
	defaultValues = {},
	basePath = "schema",
	readOnly = false,
}) => {
	const methods = useForm({ defaultValues });
	return (
		<FormProvider {...methods}>
			<ObjectSettings basePath={basePath} readOnly={readOnly} theme="dark" />
		</FormProvider>
	);
};

describe("ObjectSettings", () => {
	it("renders all fields correctly", () => {
		render(<Settings />);

		expect(screen.getByLabelText("Minimum Properties")).toBeInTheDocument();
		expect(screen.getByLabelText("Maximum Properties")).toBeInTheDocument();
		expect(screen.getByText("Additional Properties")).toBeInTheDocument();
		expect(screen.getByText("Modifiable Properties")).toBeInTheDocument();
	});

	it("loads and displays default values correctly", () => {
		const defaultValues = {
			schema: {
				minProperties: 1,
				maxProperties: 5,
				additionalProperties: false,
			},
		};
		render(<Settings defaultValues={defaultValues} />);

		expect(screen.getByLabelText("Minimum Properties")).toHaveValue(1);
		expect(screen.getByLabelText("Maximum Properties")).toHaveValue(5);
		expect(screen.getByLabelText("Disallow (false)")).toBeChecked();
	});

	it("updates value when user types in an input", () => {
		render(<Settings />);

		const input = screen.getByLabelText("Minimum Properties");
		fireEvent.change(input, { target: { value: "2" } });
		expect(input).toHaveValue(2);
	});

	it("shows schema textarea when 'Specify Schema' is selected", () => {
		render(<Settings />);

		const specifySchema = screen.getAllByRole("radio")[2];
		fireEvent.click(specifySchema);

		expect(screen.getByTestId("schema-textarea")).toBeInTheDocument();
	});

	it("disables all fields when readOnly prop is true", () => {
		render(<Settings readOnly={true} />);

		expect(screen.getByLabelText("Minimum Properties")).toBeDisabled();
		expect(screen.getByLabelText("Maximum Properties")).toBeDisabled();
		expect(screen.getByLabelText("Allow (true)")).toBeDisabled();
		expect(screen.getByLabelText("Disallow (false)")).toBeDisabled();
		expect(screen.getByLabelText("Specify Schema")).toBeDisabled();
		expect(
			screen.getByPlaceholderText("Enter your modifiable properties"),
		).toBeDisabled();
	});

	it("switches additionalProperties mode when radio buttons are clicked", () => {
		render(
			<Settings defaultValues={{ schema: { additionalProperties: true } }} />,
		);

		expect(screen.getByLabelText("Allow (true)")).toBeChecked();
		expect(screen.queryByTestId("schema-textarea")).not.toBeInTheDocument();

		const disallowRadio = screen.getByLabelText("Disallow (false)");
		fireEvent.click(disallowRadio);
		expect(disallowRadio).toBeChecked();
		expect(screen.queryByTestId("schema-textarea")).not.toBeInTheDocument();

		const allowRadio = screen.getByLabelText("Allow (true)");
		fireEvent.click(allowRadio);
		expect(allowRadio).toBeChecked();
	});

	it("validates JSON input in the schema textarea", () => {
		render(<Settings />);

		const specifySchema = screen.getByLabelText("Specify Schema");
		fireEvent.click(specifySchema);

		const textarea = screen.getByTestId("schema-textarea");

		fireEvent.change(textarea, { target: { value: '{"type": "string"' } });
		expect(screen.getByText("Invalid schema structure.")).toBeInTheDocument();

		fireEvent.change(textarea, {
			target: { value: '{"type": "string", "minimum": "a"}' },
		});
		expect(screen.getByText("/minimum - must be number")).toBeInTheDocument();

		fireEvent.change(textarea, {
			target: { value: '{"type": "string"}' },
		});
		expect(
			screen.queryByText("Invalid schema structure."),
		).not.toBeInTheDocument();
		expect(screen.queryByText(/must be number/)).not.toBeInTheDocument();
	});
});
