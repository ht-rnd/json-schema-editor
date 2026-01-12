import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { IntegerSettings } from "../../../lib/components/features/settings/IntegerSettings";

beforeAll(() => {
	global.ResizeObserver = class ResizeObserver {
		observe = vi.fn();
		unobserve = vi.fn();
		disconnect = vi.fn();
	};
	window.HTMLElement.prototype.scrollIntoView = vi.fn();
	window.HTMLElement.prototype.hasPointerCapture = vi.fn();
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
			<IntegerSettings basePath={basePath} readOnly={readOnly} theme="dark" />
		</FormProvider>
	);
};

describe("IntegerSettings", () => {
	it("renders all standard fields correctly", () => {
		render(<Settings defaultValues={{ schema: { enumEnabled: false } }} />);

		expect(screen.getByLabelText("Default Value")).toBeInTheDocument();
		expect(screen.getByLabelText("Minimum Value")).toBeInTheDocument();
		expect(screen.getByLabelText("Enable Enum")).toBeInTheDocument();
		expect(
			screen.queryByPlaceholderText("Enter your enums"),
		).not.toBeInTheDocument();
	});

	it("loads and displays default values correctly", async () => {
		const defaultValues = {
			schema: {
				default: 100,
				minimum: 10,
				enumEnabled: true,
				enumInput: [200, 300],
			},
		};
		render(<Settings defaultValues={defaultValues} />);

		expect(screen.getByLabelText("Default Value")).toHaveValue(100);
		expect(screen.getByLabelText("Minimum Value")).toHaveValue(10);
		expect(screen.getByLabelText("Enable Enum")).toBeChecked();
		expect(screen.getByPlaceholderText("Enter your enums")).toHaveValue(
			"200,300",
		);
	});

	it("shows and hides the enum input field when the checkbox is toggled", async () => {
		render(<Settings defaultValues={{ schema: { enumEnabled: false } }} />);

		const checkbox = screen.getByLabelText("Enable Enum");
		expect(
			screen.queryByPlaceholderText("Enter your enums"),
		).not.toBeInTheDocument();

		fireEvent.click(checkbox);
		expect(screen.getByPlaceholderText("Enter your enums")).toBeInTheDocument();

		fireEvent.click(checkbox);
		expect(
			screen.queryByPlaceholderText("Enter your enums"),
		).not.toBeInTheDocument();
	});

	it("disables all fields when readOnly prop is true", () => {
		render(
			<Settings
				readOnly={true}
				defaultValues={{ schema: { enumEnabled: true } }}
			/>,
		);

		expect(screen.getByLabelText("Default Value")).toBeDisabled();
		expect(screen.getByLabelText("Enable Enum")).toBeDisabled();
		expect(screen.getByPlaceholderText("Enter your enums")).toBeDisabled();
	});

	it("updates the form when enum values are changed", () => {
		render(<Settings defaultValues={{ schema: { enumEnabled: true } }} />);

		const input = screen.getByPlaceholderText("Enter your enums");

		fireEvent.change(input, { target: { value: "1,2,3" } });
		expect(screen.getByText("Current Tags: 1, 2, 3")).toBeInTheDocument();
	});

	it("updates the format when a new one is selected", () => {
		render(<Settings />);

		const formatSelect = screen.getByRole("combobox");

		fireEvent.click(formatSelect);
		const option = screen.getByRole("option", { name: "int-32" });

		fireEvent.click(option);
		expect(screen.getAllByText("int-32")).toHaveLength(2);
	});

	it("updates the minimum value", () => {
		render(<Settings defaultValues={{ schema: { minimum: 5 } }} />);

		const input = screen.getByLabelText("Minimum Value");
		expect(input).toHaveValue(5);

		fireEvent.change(input, { target: { value: "1" } });
		expect(input).toHaveValue(1);

		fireEvent.change(input, { target: { value: "" } });
		expect(input).toHaveValue(null);
	});

	it("updates the maximum value ", () => {
		render(<Settings defaultValues={{ schema: { maximum: 5 } }} />);

		const input = screen.getByLabelText("Maximum Value");
		expect(input).toHaveValue(5);

		fireEvent.change(input, { target: { value: "1" } });
		expect(input).toHaveValue(1);

		fireEvent.change(input, { target: { value: "" } });
		expect(input).toHaveValue(null);
	});

	it("updates exclusiveMin value", () => {
		render(<Settings defaultValues={{ schema: { exclusiveMin: 2 } }} />);

		const input = screen.getByLabelText("Exclusive Minimum");
		expect(input).toHaveValue(2);

		fireEvent.change(input, { target: { value: "1" } });
		expect(input).toHaveValue(1);

		fireEvent.change(input, { target: { value: "" } });
		expect(input).toHaveValue(null);
	});

	it("updates exclusiveMax value", () => {
		render(<Settings defaultValues={{ schema: { exclusiveMax: 10 } }} />);

		const input = screen.getByLabelText("Exclusive Maximum");
		expect(input).toHaveValue(10);

		fireEvent.change(input, { target: { value: "1" } });
		expect(input).toHaveValue(1);

		fireEvent.change(input, { target: { value: "" } });
		expect(input).toHaveValue(null);
	});

	it("updates multipleOf value", () => {
		render(<Settings defaultValues={{ schema: { multipleOf: 2 } }} />);

		const input = screen.getByLabelText("Multiple Of");
		expect(input).toHaveValue(2);

		fireEvent.change(input, { target: { value: "1" } });
		expect(input).toHaveValue(1);

		fireEvent.change(input, { target: { value: "" } });
		expect(input).toHaveValue(null);
	});

	it("updates defaultValue value", () => {
		render(<Settings defaultValues={{ schema: { defaultValue: 2 } }} />);
		const input = screen.getByLabelText("Default Value");

		fireEvent.change(input, { target: { value: "1" } });
		expect(input).toHaveValue(1);

		fireEvent.change(input, { target: { value: "" } });
		expect(input).toHaveValue(null);
	});
});
