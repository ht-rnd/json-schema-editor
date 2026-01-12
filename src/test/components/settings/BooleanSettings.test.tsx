import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { BooleanSettings } from "../../../lib/components/features/settings/BooleanSettings";

const Settings = ({
	defaultValues = {},
	basePath = "schema",
	readOnly = false,
}: {
	defaultValues?: object;
	basePath?: string;
	readOnly?: boolean;
}) => {
	const methods = useForm({ defaultValues });
	return (
		<FormProvider {...methods}>
			<BooleanSettings basePath={basePath} readOnly={readOnly} theme="dark" />
		</FormProvider>
	);
};

describe("BooleanSettings", () => {
	it("renders the default value select field", () => {
		render(<Settings />);

		expect(screen.getByLabelText("Default Value")).toBeInTheDocument();
		expect(screen.getByRole("combobox")).toBeInTheDocument();
	});

	it("shows 'False' as the placeholder when no value is provided", () => {
		render(<Settings />);

		expect(screen.getByRole("combobox")).toHaveTextContent("False");
	});

	it("loads and displays default value correctly", () => {
		const defaultValues = {
			schema: {
				default: "true",
			},
		};

		render(<Settings defaultValues={defaultValues} />);

		expect(screen.getByRole("combobox")).toHaveTextContent("True");
	});

	it("updates the value when user selects a new value", () => {
		render(<Settings />);

		const select = screen.getByRole("combobox");
		expect(select).toHaveTextContent("False");

		fireEvent.click(select);
		const option = screen.getByTestId("true");
		fireEvent.click(option);
		expect(select).toHaveTextContent("True");
	});

	it("disables the select field when readOnly prop is true", () => {
		render(<Settings readOnly={true} />);

		expect(screen.getByRole("combobox")).toBeDisabled();
	});
});
