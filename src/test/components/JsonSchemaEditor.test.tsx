import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { JsonSchemaEditor } from "../../lib/components/features/JsonSchemaEditor";
import { JsonSchemaEditorProps } from "../../lib/interfaces/interfaces";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };
});

describe("JsonSchemaEditor", () => {
  const renderComponent = (props: Partial<JsonSchemaEditorProps> = {}) => {
    const defaultProps = {
      rootType: "object" as const,
      readOnly: false,
      theme: "dark" as const,
      onChange: () => {},
    };
    return render(<JsonSchemaEditor {...defaultProps} {...props} />);
  };

  it("renders the editor with a default schema", () => {
    const existingSchema: any = {
      type: "object",
      title: "Existing User Schema",
      properties: {
        name: { type: "string" },
        age: { type: "number", minimum: 0 },
      },
      required: ["name"],
    };

    renderComponent({ defaultValue: existingSchema });

    expect(screen.getByText("object")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Existing User Schema")
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("name")).toBeInTheDocument();
    expect(screen.getByDisplayValue("age")).toBeInTheDocument();
  });

  it("calls onChange when the schema changes", () => {
    const onChange = vi.fn();
    renderComponent({ onChange });
    onChange.mockClear();

    const titleInput = screen.getAllByPlaceholderText("Title")[0];
    fireEvent.change(titleInput, { target: { value: "New Title" } });

    expect(onChange).toHaveBeenCalled();
  });

  it("displays AJV errors when the schema is invalid", async () => {
    const invalidSchema: any = {
      type: "object",
      title: "Invalid Schema",
      properties: {
        age: { type: "number", minimum: "invalid" },
      },
    };

    renderComponent({ defaultValue: invalidSchema });

    expect(await screen.findByText("JSON Schema Errors")).toBeInTheDocument();
    expect(screen.getByText(/must be number/)).toBeInTheDocument();
    expect(screen.getByText("root/properties/age/minimum")).toBeInTheDocument();
  });

  it("displays AJV errors for the root schema", async () => {
    const invalidSchema: any = {
      type: "invalid-type",
    };

    renderComponent({ defaultValue: invalidSchema });

    expect(await screen.findByText("JSON Schema Errors")).toBeInTheDocument();
    expect(
      screen.getByText(/must be equal to one of the allowed values/)
    ).toBeInTheDocument();
  });

  it("initializes with a default schema when no defaultValue is provided", () => {
    renderComponent();

    expect(screen.getAllByTestId("field")).toHaveLength(1);
  });

  it("adds a new field when the add button is clicked", () => {
    renderComponent();

    const addButton = screen.getByTestId("root-add-button");
    fireEvent.click(addButton);

    expect(screen.getAllByTestId("field")).toHaveLength(2);
  });

  it("removes a field when the remove button is clicked", () => {
    renderComponent();

    const removeButton = screen.getAllByTestId("delete-button")[0];
    fireEvent.click(removeButton);

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("opens the settings dialog when the settings button is clicked", () => {
    renderComponent();

    const settingsButton = screen.getByTestId("root-settings-button");
    fireEvent.click(settingsButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders correctly with rootType='array'", () => {
    renderComponent({ rootType: "array" });

    expect(screen.getByText("array")).toBeInTheDocument();
  });
});
