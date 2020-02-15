# `libyear`

A Node.js implementation of [libyear](https://libyear.com/).

A simple measure of software dependency freshness.
It is a single number telling you how up-to-date your dependencies are.

## Metrics

- `drift` representing "dependency drift"; the time between the release of the currently used and latest (stable) available versions of a dependency.
- `pulse` representing an indication of a dependency's activity; the time since the release of the latest available version of a dependency (including pre-release).

All metrics are measured in "libyears" and are calculated against dependencies both collectively and individually.

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
`libyear` tracks additional metrics like "pulse".
"drift" is useful as a guideline to determine when dependencies should be updated.
"pulse" is useful for identifying dependencies that may no longer be maintained.

Each metric can be configured with a threshold.
If configured, a breach of the threshold will exit the process with a failure code.
This may be used in CI as a quality gate.

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

- support `berry` w/o "required" workaround
- detect drift threshold violation at dependency level
- detect pulse threshold violation at dependency level
- dogfood with ts-node when typescript@3.8 stable is released
- linting

## Acknowledgements

`libyear` is inspired by the package-mananger-specific variants of libyear.

- [libyear-npm](https://github.com/jaredbeck/libyear-npm) by [@jaredbeck](https://github.com/jaredbeck)
- [libyear-yarn](https://github.com/sbleon/libyear-yarn) by [@sbleon](https://github.com/sbleon)
