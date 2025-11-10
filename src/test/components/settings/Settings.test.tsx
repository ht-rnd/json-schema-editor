import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, it, expect, vi } from "vitest";
import { Settings } from "../../../lib/components/features/settings/Settings";

vi.mock("../../../lib/components/features/settings/NumberSettings", () => ({
  NumberSettings: () => <div data-testid="number-settings" />,
}));
vi.mock("../../../lib/components/features/settings/IntegerSettings", () => ({
  IntegerSettings: () => <div data-testid="integer-settings" />,
}));
vi.mock("../../../lib/components/features/settings/StringSettings", () => ({
  StringSettings: () => <div data-testid="string-settings" />,
}));
vi.mock("../../../lib/components/features/settings/BooleanSettings", () => ({
  BooleanSettings: () => <div data-testid="boolean-settings" />,
}));
vi.mock("../../../lib/components/features/settings/ArraySettings", () => ({
  ArraySettings: () => <div data-testid="array-settings" />,
}));
vi.mock("../../../lib/components/features/settings/ObjectSettings", () => ({
  ObjectSettings: () => <div data-testid="object-settings" />,
}));

interface TestComponentProps {
  defaultValues: Record<string, any>;
  basePath: string;
  readOnly?: boolean;
}

const SettingsTest = ({ defaultValues, basePath, readOnly = false }: TestComponentProps) => {
  const methods = useForm({ defaultValues });
  return (
    <FormProvider {...methods}>
      <Settings theme="dark" basePath={basePath} readOnly={readOnly} />
    </FormProvider>
  );
};

describe("Settings", () => {
  it.each([
    ["number", "number-settings"],
    ["integer", "integer-settings"],
    ["string", "string-settings"],
    ["boolean", "boolean-settings"],
    ["array", "array-settings"],
    ["object", "object-settings"],
  ])("renders %s settings when type is %s", (type, testId) => {
    const defaultValues = { schema: { type } };
    render(<SettingsTest defaultValues={defaultValues} basePath="schema" />);

    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it("renders a fallback message for an unimplemented type", () => {
    const defaultValues = { schema: { type: "null" } };
    render(<SettingsTest defaultValues={defaultValues} basePath="schema" />);

    expect(
      screen.getByText("Settings for type null are not yet implemented.")
    ).toBeInTheDocument();
  });
});
