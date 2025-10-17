import { useFormContext } from "react-hook-form";
import { SettingsDialogProps } from "../../../interfaces/interfaces";
import { Settings } from "./Settings";
import { cn } from "../../../utils/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";

export const SettingsDialog = ({
  theme,
  readOnly,
  className,
  isOpen,
  fieldPath,
  onClose,
}: SettingsDialogProps) => {
  const { getValues } = useFormContext();
  const field = fieldPath ? getValues(fieldPath) : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "bg-background text-foreground border-input",
          theme,
          className
        )}
      >
        <DialogHeader>
          <DialogTitle className="capitalize">
            {field?.type} Schema Settings
          </DialogTitle>
        </DialogHeader>

        {fieldPath && (
          <Settings basePath={fieldPath} theme={theme} readOnly={readOnly} />
        )}

        <Button onClick={onClose} variant="default">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};
