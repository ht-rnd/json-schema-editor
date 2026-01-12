import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { RootSettings } from "../../../lib/components/features/settings/RootSettings";

const Settings = ({
	defaultValues = {},
	basePath = "root",
	readOnly = false,
}) => {
	const methods = useForm({ defaultValues });
	return (
		<FormProvider {...methods}>
			<RootSettings theme="dark" basePath={basePath} readOnly={readOnly} />
		</FormProvider>
	);
};

describe("RootSettings", () => {
	it("renders all fields correctly", () => {
		render(<Settings />);

		expect(screen.getByLabelText("$schema")).toBeInTheDocument();
		expect(screen.getByLabelText("$id")).toBeInTheDocument();
	});

	it("loads and displays default values", () => {
		const defaultValues = {
			root: {
				$schema: "http://example.com/schema",
				$id: "http://example.com/user.json",
			},
		};
		render(<Settings defaultValues={defaultValues} />);

		expect(screen.getByLabelText("$schema")).toHaveValue(
			"http://example.com/schema",
		);
		expect(screen.getByLabelText("$id")).toHaveValue(
			"http://example.com/user.json",
		);
	});

	it("updates value when user types in an input", () => {
		render(<Settings />);

		const id = screen.getByLabelText("$id");
		fireEvent.change(id, {
			target: { value: "http://example.com/product.json" },
		});
		expect(id).toHaveValue("http://example.com/product.json");
	});

	it("disables fields when readOnly is true", () => {
		render(<Settings readOnly={true} />);

		expect(screen.getByLabelText("$schema")).toBeDisabled();
		expect(screen.getByLabelText("$id")).toBeDisabled();
	});
});
