export function Features() {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {[
        {
          title: "Headless Architecture",
          desc: "Use the hook directly for complete UI control, or use the pre-built components.",
        },
        {
          title: "shadcn-style Components",
          desc: "Copy-paste components with className support, cn() utility, and full customization.",
        },
        {
          title: "Type Safe",
          desc: "Full TypeScript support with exported types for JSONSchema, FormSchema, and more.",
        },
        {
          title: "Real-time Validation",
          desc: "AJV-powered validation against JSON Schema draft 2020-12 meta-schema.",
        },
        {
          title: "React Hook Form",
          desc: "Built on react-hook-form for efficient form state management.",
        },
        {
          title: "Zero Lock-in",
          desc: "No vendor lock-in. Copy the components, modify them, make them yours.",
        },
      ].map((feature) => (
        <div
          key={feature.title}
          className="max-w-[400px] p-6 rounded-lg border border-border bg-background"
        >
          <h4 className="font-semibold mb-2">{feature.title}</h4>
          <p className="text-sm text-muted-foreground">{feature.desc}</p>
        </div>
      ))}
    </div>
  );
}
