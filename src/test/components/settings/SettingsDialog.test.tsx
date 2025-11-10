import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { SettingsDialog } from "../../../lib/components/features/settings/SettingsDialog";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };
});

vi.mock("../../../lib/components/editor/Settings", () => ({
  Settings: () => <div data-testid="settings-component" />,
}));

type SettingsDialogTestProps = {
  isOpen: boolean;
  onClose: () => void;
  fieldPath?: string;
  readOnly?: boolean;
};

const SettingsDialogTest = ({
  isOpen,
  onClose,
  fieldPath = "schema",
  readOnly = false,
}: SettingsDialogTestProps) => {
  const methods = useForm({
    defaultValues: {
      schema: { type: "string", title: "User Name" },
    },
  });

  return (
    <FormProvider {...methods}>
      <SettingsDialog
        theme="dark"
        readOnly={readOnly}
        isOpen={isOpen}
        onClose={onClose}
        fieldPath={fieldPath}
        className={""}
      />
    </FormProvider>
  );
};

describe("SettingsDialog", () => {
  it("does not render when isOpen is false", () => {
    render(<SettingsDialogTest isOpen={false} onClose={() => {}} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the dialog with the correct title when isOpen is true", () => {
    render(<SettingsDialogTest isOpen={true} onClose={() => {}} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText("string Schema Settings", { selector: "h2" })
    ).toBeInTheDocument();
  });

  it("calls the onClose function when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<SettingsDialogTest isOpen={true} onClose={onClose} />);

    const closeButton = screen.getAllByRole("button", { name: "Close" })[0];
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render settings if fieldPath is not provided", () => {
    render(
      <SettingsDialogTest
        isOpen={true}
        onClose={() => {}}
        fieldPath={undefined}
      />
    );

    expect(screen.queryByTestId("settings-component")).not.toBeInTheDocument();
  });

  it("calls onClose when the dialog's onOpenChange is triggered with false", () => {
    const onClose = vi.fn();
    render(<SettingsDialogTest isOpen={true} onClose={onClose} />);

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
