import { BrowserRouter, Route, Routes } from "react-router-dom";
import { JsonSchemaEditor } from "./lib/components/features/JsonSchemaEditor";

export const App: React.FC = () => {
  const json: any = {
    type: "object",
    additionalProperties: true,
    title: "root",
    properties: {
      field_6QoE9d: {
        type: "number",
        properties: {},
      },
    },
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <JsonSchemaEditor
              rootType="object"
              readOnly={false}
              theme="light"
              onChange={(jsonSchema) => {
                //console.log(jsonSchema);
              }}
              //defaultValue={json}
              styles={{
                form: { width: "full", height: "md" },
                output: {
                  position: "bottom",
                  showJson: true,
                  width: "full",
                  height: "md",
                },
                settings: { width: "md" },
                spacing: "md",
              }}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
