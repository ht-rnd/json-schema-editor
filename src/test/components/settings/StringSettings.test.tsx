import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { StringSettings } from "../../../lib/components/features/settings/StringSettings";

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
			<StringSettings basePath={basePath} readOnly={readOnly} theme="dark" />
		</FormProvider>
	);
};

describe("StringSettings", () => {
	it("renders all standard fields correctly", () => {
		render(<Settings />);

		expect(screen.getByLabelText("Default Value")).toBeInTheDocument();
		expect(screen.getByLabelText("Minimum Length")).toBeInTheDocument();
		expect(screen.getByLabelText("Maximum Length")).toBeInTheDocument();
		expect(
			screen.getByLabelText("Pattern (Regular Expression)"),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Format")).toBeInTheDocument();
		expect(screen.getByLabelText("Enable Enum")).toBeInTheDocument();
	});

	it("loads and displays default values correctly", () => {
		const defaultValues = {
			schema: {
				default: "hello world",
				minLength: 5,
				maxLength: 20,
				pattern: "^[a-z ]+$",
				enumEnabled: true,
				enumInput: ["alpha", "beta"],
			},
		};
		render(<Settings defaultValues={defaultValues} />);

		expect(screen.getByLabelText("Default Value")).toHaveValue("hello world");
		expect(screen.getByLabelText("Minimum Length")).toHaveValue(5);
		expect(screen.getByLabelText("Maximum Length")).toHaveValue(20);
		expect(screen.getByLabelText("Pattern (Regular Expression)")).toHaveValue(
			"^[a-z ]+$",
		);
		expect(screen.getByLabelText("Enable Enum")).toBeChecked();
		expect(screen.getByPlaceholderText("Enter your enums")).toHaveValue(
			"alpha,beta",
		);
	});

	it("updates value when user types in an input", () => {
		render(<Settings />);

		const input = screen.getByLabelText("Default Value");
		fireEvent.change(input, { target: { value: "new value" } });
		expect(input).toHaveValue("new value");
	});

	it("shows and hides the enum input field when the checkbox is toggled", () => {
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

	it("updates the form when enum values are changed", () => {
		render(<Settings defaultValues={{ schema: { enumEnabled: true } }} />);

		const input = screen.getByPlaceholderText("Enter your enums");
		fireEvent.change(input, { target: { value: "cat,dog,fish" } });
		expect(
			screen.getByText("Current Tags: cat, dog, fish"),
		).toBeInTheDocument();
	});

	it("disables all fields when readOnly prop is true", () => {
		render(
			<Settings
				readOnly={true}
				defaultValues={{ schema: { enumEnabled: true } }}
			/>,
		);

		expect(screen.getByLabelText("Default Value")).toBeDisabled();
		expect(screen.getByLabelText("Minimum Length")).toBeDisabled();
		expect(screen.getByLabelText("Maximum Length")).toBeDisabled();
		expect(
			screen.getByLabelText("Pattern (Regular Expression)"),
		).toBeDisabled();
		expect(screen.getByLabelText("Format")).toBeDisabled();
		expect(screen.getByLabelText("Enable Enum")).toBeDisabled();
		expect(screen.getByPlaceholderText("Enter your enums")).toBeDisabled();
	});

	it("updates value to null when maxLength input is cleared", () => {
		const defaultValues = { schema: { maxLength: 10 } };
		render(<Settings defaultValues={defaultValues} />);

		const input = screen.getByLabelText("Maximum Length");
		expect(input).toHaveValue(10);

		fireEvent.change(input, { target: { value: "" } });
		expect(input).toHaveValue(null);
	});

	it("updates value to null when minLength input is cleared", () => {
		const defaultValues = { schema: { minLength: 10 } };
		render(<Settings defaultValues={defaultValues} />);

		const input = screen.getByLabelText("Minimum Length");
		expect(input).toHaveValue(10);

		fireEvent.change(input, { target: { value: "" } });
		expect(input).toHaveValue(null);
	});

	it("updates minLength value", () => {
		const defaultValues = { schema: { maxLength: 10 } };
		render(<Settings defaultValues={defaultValues} />);

		const input = screen.getByLabelText("Maximum Length");
		expect(input).toHaveValue(10);

		fireEvent.change(input, { target: { value: "5" } });
		expect(input).toHaveValue(5);
	});

	it("updates minLength value", () => {
		const defaultValues = { schema: { minLength: 10 } };
		render(<Settings defaultValues={defaultValues} />);

		const input = screen.getByLabelText("Minimum Length");
		expect(input).toHaveValue(10);

		fireEvent.change(input, { target: { value: "5" } });
		expect(input).toHaveValue(5);
	});

	it("updates value when user types in pattern input", () => {
		render(<Settings />);

		const input = screen.getByLabelText("Pattern (Regular Expression)");
		fireEvent.change(input, { target: { value: "^[0-9]$" } });
		expect(input).toHaveValue("^[0-9]$");
	});

	it("updates the format when a new one is selected", () => {
		render(<Settings />);

		const formatSelect = screen.getByRole("combobox");
		fireEvent.click(formatSelect);
		const option = screen.getByRole("option", { name: "email" });

		fireEvent.click(option);
		expect(screen.getAllByText("email")).toHaveLength(2);
	});
});
