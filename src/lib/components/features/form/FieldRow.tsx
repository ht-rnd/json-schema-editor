import { Hammer, Settings, Trash2, TriangleAlert } from "lucide-react";
import { Controller, useWatch } from "react-hook-form";
import { types } from "../../../consts/consts";
import type { FieldRowProps } from "../../../interfaces/interfaces";
import { cn } from "../../../utils/utils";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../../ui/alert-dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";

export const FieldRow = ({
	theme,
	readOnly,
	control,
	fieldPath,
	isSimpleType,
	isRootLevel,
	onRemove,
	onOpenSettings,
	onTypeChange,
}: FieldRowProps) => {
	const fieldName = useWatch({
		control,
		name: `${fieldPath}.key`,
	});

	return (
		<div className="p-2 flex gap-2" data-testid="field">
			{isSimpleType && (
				<Controller
					control={control}
					name={`${fieldPath}.key`}
					render={({ field }) => (
						<Input
							placeholder="field_name"
							disabled={readOnly}
							className="w-40"
							{...field}
						/>
					)}
				/>
			)}

			<Controller
				control={control}
				name={`${fieldPath}.schema.type`}
				render={({ field }) => (
					<Select
						disabled={readOnly}
						onValueChange={(value) => {
							field.onChange(value);
							onTypeChange(value);
						}}
						value={field.value}
					>
						<SelectTrigger className="w-40">
							<SelectValue />
						</SelectTrigger>
						<SelectContent
							className={`${theme} max-h-52 bg-background text-foreground border-input`}
						>
							{types.map((type) => (
								<SelectItem key={type} value={type}>
									{type}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}
			/>

			<Controller
				control={control}
				name={`${fieldPath}.schema.title`}
				render={({ field }) => (
					<Input
						placeholder="Title"
						disabled={readOnly}
						className="flex-1"
						{...field}
					/>
				)}
			/>

			<Controller
				control={control}
				name={`${fieldPath}.schema.description`}
				render={({ field }) => (
					<Input
						placeholder="Description"
						disabled={readOnly}
						className="flex-1"
						{...field}
					/>
				)}
			/>

			{isSimpleType && (
				<div className="flex gap-2">
					<Controller
						control={control}
						name={`${fieldPath}.isRequired`}
						render={({ field }) => (
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										type="button"
										data-testid="required"
										disabled={readOnly}
										size="icon"
										variant={field.value ? "default" : "outline"}
										onClick={() => {
											field.onChange(!field.value);
										}}
									>
										<TriangleAlert />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Required</p>
								</TooltipContent>
							</Tooltip>
						)}
					/>
					{/*{fieldType === "object" && (
            <Controller
              control={control}
              name={`${fieldPath}.schema.isModifiable`}
              render={({ field }) => (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      disabled={readOnly}
                      size="icon"
                      variant={field.value ? "default" : "outline"}
                      onClick={() => {
                        field.onChange(!field.value);
                      }}
                    >
                      <Hammer />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>X-Modifiable</p>
                  </TooltipContent>
                </Tooltip>
              )}
            />
          )}*/}
					<div className="border-l-2 border-input"></div>
				</div>
			)}

			<Button
				type="button"
				size="icon"
				variant="ghost"
				onClick={() => onOpenSettings(`${fieldPath}.schema`)}
			>
				<Settings className="text-blue-500" />
			</Button>

			{isRootLevel && (
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							type="button"
							size="icon"
							variant="ghost"
							data-testid="delete-button"
							disabled={readOnly}
						>
							<Trash2 className="text-red-500" />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent className={cn("border-input", theme)}>
						<AlertDialogHeader>
							<AlertDialogTitle className="text-foreground">
								Are you absolutely sure?
							</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete field{" "}
								{fieldName}.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel className="text-foreground">
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction onClick={onRemove}>Delete</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}
		</div>
	);
};
