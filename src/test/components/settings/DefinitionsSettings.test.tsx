import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { describe, it, expect, vi } from "vitest";
import { DefinitionsSettings } from "../../../lib/components/features/settings/DefinitionsSettings";

vi.mock("../../../lib/components/features/form/Field", () => ({
  Field: ({ fieldPath, onKeyChange, onRemove }: any) => {
    const { getValues } = useFormContext();
    const currentKey = getValues(`${fieldPath}.key`);

    return (
      <div data-testid={`field-${fieldPath}`}>
        <span data-testid={`key-${fieldPath}`}>{currentKey}</span>
        <button
          data-testid={`rename-${fieldPath}`}
          onClick={() => onKeyChange(currentKey, "new")}
        >
          Rename
        </button>
        <button data-testid={`remove-${fieldPath}`} onClick={onRemove}>
          Remove
        </button>
      </div>
    );
  },
}));

vi.mock("nanoid", () => ({
  nanoid: () => "123456",
}));

const Settings = ({
  defaultValues = {},
  readOnly = false,
}: {
  defaultValues?: object;
  readOnly?: boolean;
}) => {
  const methods = useForm({ defaultValues, mode: "onChange" });
  return (
    <FormProvider {...methods}>
      <DefinitionsSettings theme="dark" readOnly={readOnly} basePath="schema" />
      <div data-testid="form-values">{JSON.stringify(methods.watch())}</div>
    </FormProvider>
  );
};

describe("DefinitionsSettings", () => {
  it("renders the header and count correctly", () => {
    const defaultValues = {
      definitions: [
        { id: "1", key: "def1", schema: { type: "string" } },
        { id: "2", key: "def2", schema: { type: "number" } },
      ],
    };
    render(<Settings defaultValues={defaultValues} />);

    expect(screen.getByText("Global Definitions")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("toggles the definitions list visibility", () => {
    render(<Settings />);

    const toggle = screen.getByText("Global Definitions");
    expect(screen.queryByText("Add Definition")).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(screen.getByText("Add Definition")).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(screen.queryByText("Add Definition")).not.toBeInTheDocument();
  });

  it("adds a new definition when 'Add Definition' is clicked", async () => {
    render(<Settings defaultValues={{ definitions: [] }} />);

    fireEvent.click(screen.getByText("Global Definitions"));
    const add = screen.getByText("Add Definition");
    fireEvent.click(add);

    expect(
      await screen.findByTestId("field-definitions.0")
    ).toBeInTheDocument();
    expect(screen.getByText("def_123456")).toBeInTheDocument();
  });

  it("removes a definition and clears references pointing to it", async () => {
    const defaultValues = {
      root: { $ref: "#/$defs/def" },
      definitions: [{ id: "1", key: "def", schema: { type: "string" } }],
    };
    render(<Settings defaultValues={defaultValues} />);

    fireEvent.click(screen.getByText("Global Definitions"));
    const before = screen.getByTestId("form-values");
    expect(before).toHaveTextContent("#/$defs/def");

    const remove = screen.getByTestId("remove-definitions.0");
    fireEvent.click(remove);
    expect(screen.queryByTestId("field-definitions.0")).not.toBeInTheDocument();

    const after = screen.getByTestId("form-values");
    expect(JSON.parse(after.textContent!).root.$ref).toBe("");
  });

  it("recursively updates references when a definition key changes", async () => {
    const defaultValues = {
      root: { $ref: "#/$defs/old" },
      properties: [
        {
          key: "prop1",
          schema: {
            $ref: "#/$defs/old",
            items: [{ schema: { $ref: "#/$defs/old" } }],
          },
        },
        {
          key: "prop2",
          schema: {
            type: "array",
            items: { $ref: "#/$defs/old" },
          },
          properties: [
            {
              $ref: "#/$defs/old",
            },
          ],
        },
      ],
      definitions: [
        {
          id: "1",
          key: "old",
          schema: { type: "object" },
        },
        {
          id: "2",
          key: "def",
          schema: {
            properties: [{ schema: { $ref: "#/$defs/old" } }],
          },
        },
      ],
    };
    render(<Settings defaultValues={defaultValues} />);

    fireEvent.click(screen.getByText("Global Definitions"));
    const rename = screen.getByTestId("rename-definitions.0");
    fireEvent.click(rename);
    const formValues = JSON.parse(
      screen.getByTestId("form-values").textContent!
    );
    const newRef = "#/$defs/new";
    expect(formValues.root.$ref).toBe(newRef);
    expect(formValues.properties[0].schema.$ref).toBe(newRef);
    expect(formValues.definitions[1].schema.properties[0].schema.$ref).toBe(
      newRef
    );
    expect(formValues.properties[1].schema.items.schema.$ref).toBe(newRef);
    expect(formValues.properties[1].properties[0].$ref).toBe(newRef);
  });
});
