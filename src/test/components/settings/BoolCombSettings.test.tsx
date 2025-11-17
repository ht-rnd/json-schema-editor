import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, it, expect, beforeAll, vi } from "vitest";
import { BoolCombSettings } from "../../../lib/components/features/settings/BoolCombSettings";

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
      <BoolCombSettings theme="dark" basePath={basePath} readOnly={readOnly} />
    </FormProvider>
  );
};

describe("BoolCombSettings", () => {
  it("renders header and toggles open/close", () => {
    render(<Settings />);

    expect(screen.getByText("Boolean Combinations")).toBeInTheDocument();

    expect(
      screen.queryByPlaceholderText('e.g., [{ "minLength": 2 }]')
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Boolean Combinations"));
    expect(
      screen.getAllByPlaceholderText('e.g., [{ "minLength": 2 }]')
    ).toHaveLength(3);
    expect(
      screen.getByPlaceholderText('e.g., { "type": "string" }')
    ).toBeInTheDocument();
  });

  it("loads and displays default values correctly", () => {
    const defaultValues = {
      schema: {
        allOf: [{ type: "string" }],
        anyOf: [{ minLength: 2 }],
        oneOf: undefined,
        not: { type: "number" },
      },
    };

    render(<Settings defaultValues={defaultValues} />);
    fireEvent.click(screen.getByText("Boolean Combinations"));

    const allOfTextarea = screen.getAllByPlaceholderText(
      'e.g., [{ "minLength": 2 }]'
    )[0];
    expect(allOfTextarea).toHaveValue(
      JSON.stringify(defaultValues.schema.allOf, null, 2)
    );

    const notTextarea = screen.getByPlaceholderText(
      'e.g., { "type": "string" }'
    );
    expect(notTextarea).toHaveValue(
      JSON.stringify(defaultValues.schema.not, null, 2)
    );
  });

  it("shows JSON parse error for invalid JSON and schema validation errors", () => {
    render(<Settings />);
    fireEvent.click(screen.getByText("Boolean Combinations"));

    const allOfTextarea = screen.getAllByPlaceholderText(
      'e.g., [{ "minLength": 2 }]'
    )[0];

    fireEvent.change(allOfTextarea, { target: { value: '{"type": "string"' } });
    expect(screen.getByText("Invalid JSON format.")).toBeInTheDocument();

    const notTextarea = screen.getByPlaceholderText(
      'e.g., { "type": "string" }'
    );

    fireEvent.change(notTextarea, {
      target: { value: '{"type":"string","minimum":"a"}' },
    });
    expect(
      screen.getByText(/must be number|Invalid schema structure\./i)
    ).toBeInTheDocument();
  });

  it("handles null/empty/undefined inputs by clearing the value", () => {
    render(<Settings />);
    fireEvent.click(screen.getByText("Boolean Combinations"));

    const allOfTextarea = screen.getAllByPlaceholderText(
      'e.g., [{ "minLength": 2 }]'
    )[0];

    fireEvent.change(allOfTextarea, { target: { value: "null" } });
    expect(screen.queryByText("Invalid JSON format.")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/must be number|Invalid schema structure\./i)
    ).not.toBeInTheDocument();

    fireEvent.change(allOfTextarea, { target: { value: "" } });
    expect(screen.queryByText("Invalid JSON format.")).not.toBeInTheDocument();
  });

  it("shows validation messages for invalid array and clears them", () => {
    render(<Settings />);
    fireEvent.click(screen.getByText("Boolean Combinations"));

    const allOfTextarea = screen.getAllByPlaceholderText(
      'e.g., [{ "minLength": 2 }]'
    )[0];

    fireEvent.change(allOfTextarea, {
      target: { value: '[{"type":"string","minimum":"a"}]' },
    });
    expect(
      screen.getByText(/must be number|Invalid schema structure\./i)
    ).toBeInTheDocument();

    fireEvent.change(allOfTextarea, {
      target: { value: '[{"type":"string"}]' },
    });
    expect(
      screen.queryByText(/must be number|Invalid schema structure\./i)
    ).not.toBeInTheDocument();
  });

  it("disables fields when readOnly is true", () => {
    render(<Settings readOnly={true} />);
    fireEvent.click(screen.getByText("Boolean Combinations"));

    const allOfTextarea = screen.getAllByPlaceholderText(
      'e.g., [{ "minLength": 2 }]'
    )[0];
    const notTextarea = screen.getByPlaceholderText(
      'e.g., { "type": "string" }'
    );

    expect(allOfTextarea).toBeDisabled();
    expect(notTextarea).toBeDisabled();
  });
});
