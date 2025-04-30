# UnityPackage Extractor

A command-line tool to extract .unitypackage files.

## Installation

```bash
# Install globally to use as a command-line tool
npm install -g unitypackage-extractor
```

## Usage

### Command Line

```bash
unitypackage-extractor *.unitypackage [optional/output/path]
```

If no output path is specified, the package contents will be extracted to the current directory.

## Features

- Extracts .unitypackage files
- Preserves the original directory structure
- Handles path security (prevents directory traversal)
- Works cross platform

## Development

### Build
```bash
npm run build
```

### Run
```bash
# Using compiled js
node dist/cli.js *.unitypackage
```

```bash
# Or using ts-node CLI
ts-node src/cli.ts *.unitypackage
```

## Credits

Inspired by [Cobertos/unitypackage_extractor](https://github.com/Cobertos/unitypackage_extractor) which relys on Python and installed via pip.

I built this TypeScript version for lightweight and simplified CLI usage.
