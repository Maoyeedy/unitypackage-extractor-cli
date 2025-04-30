# UnityPackage Extractor

A command-line tool to extract .unitypackage files.

## Installation

```bash
# Install globally to use as a command-line tool
npm install -g unitypackage-extractor

# Or install locally in your project
npm install unitypackage-extractor
```

## Usage

### Command Line

```bash
unitypackage-extractor path/to/package.unitypackage [optional/output/path]
```

If no output path is specified, the package contents will be extracted to the current directory.

### Programmatic Usage

```typescript
import { extractPackage } from 'unitypackage-extractor';

async function example() {
  try {
    // Extract to the current directory
    await extractPackage('/path/to/your/package.unitypackage');
    
    // Or specify an output path
    await extractPackage('/path/to/your/package.unitypackage', '/desired/output/path');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

example();
```

## Features

- Extracts .unitypackage files (Unity asset packages)
- Preserves the original directory structure
- Handles path security (prevents directory traversal)
- Works on Windows, macOS, and Linux

## License

MIT