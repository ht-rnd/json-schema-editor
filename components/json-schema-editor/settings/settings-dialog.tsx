import * as React from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "../lib/utils";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Settings } from "./settings";

export interface SettingsDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  readOnly?: boolean;
  isOpen?: boolean;
  fieldPath?: string | null;
  onClose?: () => void;
}

const SettingsDialog = React.forwardRef<HTMLDivElement, SettingsDialogProps>(
  ({ className, readOnly = false, isOpen = false, fieldPath, onClose, ...props }, ref) => {
    const { getValues } = useFormContext();
    const field = fieldPath ? getValues(fieldPath) : null;

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
        <DialogContent ref={ref} className={cn(className)} {...props}>
          <DialogHeader>
            <DialogTitle className="capitalize">{field?.type} Schema Settings</DialogTitle>
            <DialogDescription>Configure the settings for this schema field.</DialogDescription>
          </DialogHeader>

          {fieldPath && <Settings basePath={fieldPath} readOnly={readOnly} />}

          <Button type="button" onClick={onClose} variant="default">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  },
);
SettingsDialog.displayName = "SettingsDialog";

export { SettingsDialog };
