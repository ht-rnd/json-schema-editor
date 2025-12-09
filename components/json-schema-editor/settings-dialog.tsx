import * as React from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "./lib/utils";
import { Settings } from "./settings/settings";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

export interface SettingsDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the form is read-only */
  readOnly?: boolean;
  /** Whether the dialog is open */
  isOpen?: boolean;
  /** Path to the field being edited */
  fieldPath?: string | null;
  /** Callback when dialog closes */
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

          <Button onClick={onClose} variant="default">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  },
);
SettingsDialog.displayName = "SettingsDialog";

export { SettingsDialog };
