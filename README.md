# `libyear` &middot; ![](https://github.com/jdanil/libyear/workflows/ci/badge.svg)

A Node.js implementation of [libyear](https://libyear.com/).

A simple measure of software dependency freshness.
It is a single number telling you how up-to-date your dependencies are.

## Metrics

- `drift` representing "dependency drift"; the time between the release of the currently used and latest (stable) available versions of a dependency. Measured in "libyears".
- `pulse` representing "pulse check", an indication of a dependency's activity; the time since the release of the latest available version of a dependency (including pre-release). Measured in "libyears".
- `releases` the number of stable releases between the currently used and latest (stable) available versions of a dependency.

All metrics are calculated against dependencies both collectively and individually.

## Why

### Why Does libyear Matter

[Dependency drift fitness function](https://www.thoughtworks.com/radar/techniques/dependency-drift-fitness-function) is a technique to introduce a specific [evolutionary architecture](https://www.thoughtworks.com/radar/techniques/evolutionary-architecture) fitness function to track dependencies over time, giving an indication of the possible work needed and whether a potential issue is getting better or worse.

Newer versions of dependencies may include **bug fixes** and **security vulnerability fixes**.
These fixes are often released in "patch" versions which are backwards-compatible.

Newer versions of dependencies may include **performance improvements** and **new features/capabilities**.
These enhancements are often released in "minor" versions which are backwards-compatible.

The fixes and features released by dependency authors often filter down to the consumer packages.

A practice of regular dependency maintenance begets smaller changes and **easier upgrades**.
Continual evolution of the code **avoids rewrites**.
When using the most recent versions of a dependency there is better **alignment with documentation**.

It is difficult to find volunteers to maintain legacy code.
Modern stacks **attract developers**.

### Why `libyear`

`libyear` offers a package-manager-agnostic tool to measure dependency freshness for Node.js environments.

On top of the most commonly referenced "dependency drift" fitness function,
`libyear` tracks additional metrics like "pulse" and "releases".
"drift" is useful as a guideline to determine when dependencies should be updated.
"pulse" is useful for identifying dependencies that may no longer be maintained.
"releases" is an alternate measure of "drift" based on discrete versions rather than time.

Each metric can be configured with a threshold.
If configured, a breach of the threshold will exit the process with a failure code.
This may be used in CI as a quality gate.

If dependencies are already up-to-date, `libyear` tracks upcoming versions of dependencies, providing timely notice to prepare for stable releases.

## Usage

### `npm`

```bash
npx libyear
```

### `pnpm`

```bash
pnpx libyear
```

### `yarn@1` (`yarn classic`)

```bash
yarn add --dev libyear
yarn libyear
```

### `yarn@2` (`yarn berry`)

```bash
yarn dlx libyear
```

## CLI

### `--package-manager`

Accepts `berry`, `npm`, `pnpm`, `yarn`. Default is inferred.

### `--threshold-drift-collective=<libyears>` (`-D=<libyears>`)

Accepts a number. Default `null`.

Throws an error if the total drift metric surpasses the threshold.

### `--threshold-drift-individual=<libyears>` (`-d=<libyears>`)

Accepts a number. Default `null`.

Throws an error if any individual drift metric surpasses the threshold.

### `--threshold-pulse-collective=<libyears>` (`-P=<libyears>`)

Accepts a number. Default `null`.

Throws an error if the total pulse metric surpasses the threshold.

### `--threshold-pulse-individual=<libyears>` (`-p=<libyears>`)

Accepts a number. Default `null`.

Throws an error if any individual pulse metric surpasses the threshold.

### `--threshold-releases-collective=<count>` (`-R=<count>`)

Accepts an integer. Default `null`.

Throws an error if the total releases metric surpasses the threshold.

### `--threshold-releases-individual=<count>` (`-r=<count>`)

Accepts an integer. Default `null`.

Throws an error if any individual releases metric surpasses the threshold.

## Configuration

`libyear` can be configured via cosmiconfig-supported formats.

- `package.json` (under `{ "configs": { "libyear": { ... } } }`)
- `libyearrc`
- `libyearrc.js`
- `libyearrc.json`
- `libyearrc.yaml`
- `libyearrc.yml`
- `libyear.config.js`

Configuration is expected in the following structure.

```json5
{
  overrides: {
    "^@types/": {
      defer: "2020-01-01", // string (ISO formatted Date)
      drift: null, // number (default: null)
      pulse: null, // number (default: null)
      releases: null, // integer (default: null)
    },
  },
  threshold: {
    drift: {
      collective: null, // number (default: null)
      individual: null, // number (default: null)
    },
    pulse: {
      collective: null, // number (default: null)
      individual: null, // number (default: null)
    },
    releases: {
      collective: null, // integer (default: null)
      individual: null, // integer (default: null)
    },
  },
}
```

### Overrides

Configuration files support an `overrides` property.
Each property in the object maps a regular expression to a collection of options.

- `defer` - Defer enforcing any thresholds until the date specified for matching dependencies.
- `drift` - Override drift threshold for matching dependencies.
- `pulse` - Override pulse threshold for matching dependencies.
- `releases` - Override releases threshold for matching dependencies.

To match a specific dependency, make sure to include the starts with (`^`) and ends with (`$`) anchors.

```json
{
  "overrides": {
    "^libyear$": {}
  }
}
```

There may be cases where matching many dependencies is desired.
For instance, type definitions are often updated less regularly than source code.
To cater for this case, we can set a more lenient pulse threshold.

```json
{
  "overrides": {
    "^@types/": {
      "pulse": null
    }
  }
}
```

## To Do

### Now

- `--all` flag
- `--silent` flag
- major, minor, patch thresholds
- fix "available" logic
- ci semantic release
- unit tests

### Next

- features
  - JSON output
- rfc
  - batch queries
  - audit vulnerabilities

### Later

- extend linting when eslint@7 is released and supports plugins loaded from config file directory
- `./tsconfig.json` to use `"module": "esnext"` when supported by [ts-node](https://github.com/TypeStrong/ts-node/issues/935)
- `./bin/libyear.ts` to use top-level await after switching to ES Modules

## Acknowledgements

`libyear` is inspired by the package-mananger-specific variants of libyear.

- [libyear-npm](https://github.com/jaredbeck/libyear-npm) by [@jaredbeck](https://github.com/jaredbeck)
- [libyear-yarn](https://github.com/sbleon/libyear-yarn) by [@sbleon](https://github.com/sbleon)
