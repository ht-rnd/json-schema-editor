import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { FieldRow } from "../../../lib/components/features/form/FieldRow";
import { TooltipProvider } from "../../../lib/components/ui/tooltip";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };
});

const FieldRowForm = ({
  defaultValues = {
    field: { key: "name", isRequired: false, schema: { type: "string" } },
  },
  readOnly = false,
  isRootLevel = true,
  onRemove = vi.fn(),
  onOpenSettings = vi.fn(),
  onTypeChange = vi.fn(),
}) => {
  const methods = useForm({ defaultValues });
  return (
    <FormProvider {...methods}>
      <TooltipProvider>
        <FieldRow
          theme="dark"
          readOnly={readOnly}
          control={methods.control}
          fieldPath="field"
          isRootLevel={isRootLevel}
          onRemove={onRemove}
          onOpenSettings={onOpenSettings}
          onTypeChange={onTypeChange}
        />
      </TooltipProvider>
    </FormProvider>
  );
};

describe("FieldRow", () => {
  it("renders all inputs and buttons correctly", () => {
    render(<FieldRowForm />);

    expect(screen.getByPlaceholderText("field_name")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Title")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Description")).toBeInTheDocument();
    expect(screen.getByTestId("required")).toBeInTheDocument();
    expect(screen.getByTestId("delete-button")).toBeInTheDocument();
  });

  it("displays default values from the form context", () => {
    const defaultValues = {
      field: {
        key: "user_age",
        isRequired: true,
        schema: { type: "integer", title: "User Age", description: "Age" },
      },
    };
    render(<FieldRowForm defaultValues={defaultValues} />);

    expect(screen.getByPlaceholderText("field_name")).toHaveValue("user_age");
    expect(screen.getByRole("combobox")).toHaveTextContent("integer");
    expect(screen.getByPlaceholderText("Title")).toHaveValue("User Age");
    expect(screen.getByPlaceholderText("Description")).toHaveValue("Age");
  });

  it("calls onTypeChange when the type is changed", () => {
    const onTypeChange = vi.fn();
    render(<FieldRowForm onTypeChange={onTypeChange} />);

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("boolean"));

    expect(onTypeChange).toHaveBeenCalledWith("boolean");
  });

  it("calls onOpenSettings when settings button is clicked", () => {
    const onOpenSettings = vi.fn();
    render(<FieldRowForm onOpenSettings={onOpenSettings} />);

    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(onOpenSettings).toHaveBeenCalledWith("field.schema");
  });

  it("disables all inputs and buttons when readOnly is true", () => {
    render(<FieldRowForm readOnly={true} />);

    expect(screen.getByPlaceholderText("field_name")).toBeDisabled();
    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(screen.getByPlaceholderText("Title")).toBeDisabled();
    expect(screen.getByPlaceholderText("Description")).toBeDisabled();
    expect(screen.getByTestId("required")).toBeDisabled();
    expect(screen.getByTestId("delete-button")).toBeDisabled();
  });

  it("calls onRemove when delete is confirmed in the dialog", () => {
    const onRemove = vi.fn();
    render(<FieldRowForm onRemove={onRemove} />);

    fireEvent.click(screen.getByTestId("delete-button"));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
