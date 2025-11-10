import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, it, expect, beforeAll, vi } from "vitest";
import { ArraySettings } from "../../../lib/components/features/settings/ArraySettings";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };
});

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
      <ArraySettings theme="dark" basePath={basePath} readOnly={readOnly} />
    </FormProvider>
  );
};

describe("ArraySettings", () => {
  it("renders all fields with their labels", () => {
    render(<Settings />);

    expect(screen.getByLabelText("Minimum Items")).toBeInTheDocument();
    expect(screen.getByLabelText("Maximum Items")).toBeInTheDocument();
    expect(screen.getByLabelText("Minimum Contains")).toBeInTheDocument();
    expect(screen.getByLabelText("Maximum Contains")).toBeInTheDocument();
    expect(screen.getByLabelText("Unique Items")).toBeInTheDocument();
  });

  it("loads and displays default values correctly", () => {
    const defaultValues = {
      schema: {
        minItems: 1,
        maxItems: 10,
        uniqueItems: true,
      },
    };

    render(<Settings defaultValues={defaultValues} />);

    expect(screen.getByLabelText("Minimum Items")).toHaveValue(1);
    expect(screen.getByLabelText("Maximum Items")).toHaveValue(10);
    expect(screen.getByLabelText("Unique Items")).toBeChecked();
  });

  it("updates the value when user types in input", () => {
    render(<Settings />);

    const input = screen.getByLabelText("Minimum Items");
    fireEvent.change(input, { target: { value: "5" } });
    expect(input).toHaveValue(5);
  });

  it("updates the value to null when input is cleared", () => {
    const defaultValues = { schema: { minItems: 5 } };
    render(<Settings defaultValues={defaultValues} />);

    const input = screen.getByLabelText("Minimum Items");
    expect(input).toHaveValue(5);

    fireEvent.change(input, { target: { value: "" } });
    expect(input).toHaveValue(null);
  });

  it("toggles the checkbox value when user clicks it", () => {
    render(<Settings />);
    const checkbox = screen.getByLabelText("Unique Items");
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("updates the value to null when maxItems is cleared", () => {
    const defaultValues = { schema: { maxItems: 10 } };
    render(<Settings defaultValues={defaultValues} />);

    const input = screen.getByLabelText("Maximum Items");
    expect(input).toHaveValue(10);

    fireEvent.change(input, { target: { value: "" } });
    expect(input).toHaveValue(null);
  });

  it("updates the value when user types in minContains input", () => {
    render(<Settings />);

    const input = screen.getByLabelText("Minimum Contains");
    fireEvent.change(input, { target: { value: "2" } });
    expect(input).toHaveValue(2);
  });

  it("updates the value when user types in maxContains input", () => {
    render(<Settings />);

    const input = screen.getByLabelText("Maximum Contains");
    fireEvent.change(input, { target: { value: "5" } });
    expect(input).toHaveValue(5);
  });

  it("disables all fields when readOnly prop is true", () => {
    render(<Settings readOnly={true} />);

    expect(screen.getByLabelText("Minimum Items")).toBeDisabled();
    expect(screen.getByLabelText("Maximum Items")).toBeDisabled();
    expect(screen.getByLabelText("Minimum Contains")).toBeDisabled();
    expect(screen.getByLabelText("Maximum Contains")).toBeDisabled();
    expect(screen.getByLabelText("Unique Items")).toBeDisabled();
  });
});
