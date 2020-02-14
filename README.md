# libyear

Node.js implementation of [libyear](https://libyear.com/).

A simple measure of software dependency freshness.
It is a single number telling you how up-to-date your dependencies are.

## Why

<!-- TODO -->

## Usage

### `npm`

```bash
npx libyear
```

### `yarn@1` (`yarn classic`)

```bash
yarn install --save-dev libyear
```

`package.json`
```json
{
  "scripts": {
    "libyear": "libyear"
  }
}
```

```bash
yarn libyear
```

### `yarn@2` (`yarn berry`)

```bash
yarn dlx libyear
```

## CLI

### `--package-manager`

Accepts `berry`, `npm`, `yarn`. Default is inferred.

### `--threshold-drift-collective`

Accepts a number. Default `null`.

Throws an error if the total drift metric surpasses the threshold.

### `--threshold-drift-individual`

Accepts a number. Default `null`.

Throws an error if any individual drift metric surpasses the threshold.

### `--threshold-pulse-collective`

Accepts a number. Default `null`.

Throws an error if the total pulse metric surpasses the threshold.

### `--threshold-pulse-individual`

Accepts a number. Default `null`.

Throws an error if any individual pulse metric surpasses the threshold.

## To Do

- document "why"
- support `berry`
- detect drift threshold violation at dependency level
- detect pulse threshold violation at dependency level
- dogfood with ts-node when typescript@3.8 stable is released
- linting

## Acknowledgements

`libyear` is inspired by the package-mananger-specific variants of libyear.

- [libyear-npm](https://github.com/jaredbeck/libyear-npm) by [@jaredbeck](https://github.com/jaredbeck)
- [libyear-yarn](https://github.com/sbleon/libyear-yarn) by [@sbleon](https://github.com/sbleon)
