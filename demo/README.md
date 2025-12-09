# JSON Schema Editor Demo

Interactive demo for the `@ht-rnd/json-schema-editor` library.

## Development

```bash
# From root directory
npm run demo

# Or from demo directory
cd demo
npm install
npm run dev
```

## Building for GitHub Pages

```bash
# From root directory
npm run demo:build

# Output will be in demo/dist/
```

## Features Demonstrated

- **Live Editor**: Edit JSON schemas with the visual editor
- **Theme Toggle**: Switch between light and dark modes
- **Example Schemas**: Load pre-built example schemas
- **Root Type Selection**: Switch between object and array root types
- **Real-time Output**: See the generated JSON schema as you edit
- **Copy to Clipboard**: Quick copy the generated schema

## Deployment

The demo is configured to deploy to GitHub Pages at `/json-schema-editor/`.

To deploy manually:

1. Build the demo: `npm run demo:build`
2. Deploy the `demo/dist/` folder to GitHub Pages

