export interface Styles {
  form: { width: "sm" | "md" | "lg" | "full"; height: "sm" | "md" | "lg" | "full" };
  output: {
    position: "top" | "bottom" | "left" | "right";
    showJson: boolean;
    width: "sm" | "md" | "lg" | "full";
    height: "sm" | "md" | "lg" | "full";
  };
  settings: { width: "sm" | "md" | "lg" | "full" };
  spacing: "sm" | "md" | "lg";
}

export const defaultStyles: Styles = {
  form: { width: "full", height: "md" },
  output: { position: "bottom", showJson: true, width: "full", height: "md" },
  settings: { width: "md" },
  spacing: "md",
};

export const heightMap = {
  sm: "max-h-[300px]",
  md: "max-h-[500px]",
  lg: "max-h-[800px]",
  full: "max-h-full",
};

export const outputHeightMap = {
  sm: 300,
  md: 500,
  lg: 800,
  full: undefined,
};

export const widthMap = {
  sm: "w-full max-w-[600px]",
  md: "w-full max-w-[800px]",
  lg: "w-full max-w-[1200px]",
  full: "w-full",
};

export const settingsWidthMap = {
  sm: "sm:max-w-[500px]",
  md: "sm:max-w-[700px]",
  lg: "sm:max-w-[1000px]",
  full: "w-full sm:max-w-full",
};

export const layoutMap = {
  top: "flex-col-reverse",
  bottom: "flex-col",
  left: "flex-row-reverse",
  right: "flex-row",
};

export const spacingMap = { sm: "gap-2", md: "gap-4", lg: "gap-6" };
