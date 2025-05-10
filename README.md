# UnityPackage Extractor

A command-line tool to extract .unitypackage files.

## Installation

[![Unity Package Extractor](https://img.shields.io/npm/v/unitypackage-extractor)](https://www.npmjs.com/package/unitypackage-extractor)

```bash
# Install globally to use as a command-line tool
npm install -g unitypackage-extractor
```

## Usage

### Extract

```bash
unitypackage-extractor *.unitypackage [optional/output/path]
```
> If output path unspecified, packages will be extracted to current directory `./Assets`

### View

```bash
unitypackage-extractor view *.unitypackage
```
> List the contents of the package without extracting it.

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
