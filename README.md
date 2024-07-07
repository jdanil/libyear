# `libyear` &middot; ![](https://github.com/jdanil/libyear/workflows/ci/badge.svg) ![](https://github.com/jdanil/libyear/workflows/cron/badge.svg) ![](https://raw.githubusercontent.com/jdanil/libyear/gh-badges/drift.svg)

A Node.js implementation of [libyear](https://libyear.com/).

A simple measure of software dependency freshness.
It is a single number telling you how up-to-date your dependencies are.

## Metrics

- `drift` representing "dependency drift"; the time between the release of the currently used and latest (stable) available versions of a dependency. Measured in "libyears".
- `pulse` representing "pulse check", an indication of a dependency's activity; the time since the release of the latest available version of a dependency (including pre-release). Measured in "libyears".
- `releases` the number of stable releases between the currently used and latest (stable) available versions of a dependency.
- `major` the number of major releases between the currently used and latest (stable) available versions of a dependency.
- `minor` the number of minor releases between the currently used and latest (stable) available versions of a dependency.
- `patch` the number of patch releases between the currently used and latest (stable) available versions of a dependency.

All metrics are calculated against dependencies both collectively and individually.

## Why

### Why Does libyear Matter

[Dependency drift fitness function](https://www.thoughtworks.com/radar/techniques/dependency-drift-fitness-function) is a technique to introduce a specific [evolutionary architecture](https://www.thoughtworks.com/radar/techniques/evolutionary-architecture) fitness function to track dependencies over time, giving an indication of the possible work needed and whether a potential issue is getting better or worse.

Newer versions of dependencies may include **bug fixes** and **security vulnerability patches**.
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
"major", "minor", and "patch" provide more granular metrics for "releases".

Each metric can be configured with a threshold.
If configured, a breach of the threshold will exit the process with a failure code.
This may be used in CI as a quality gate, or as a [cron job](https://en.wikipedia.org/wiki/Cron) to trigger an alert when the debt gets too high.

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

### `yarn@>=2` (`yarn berry`)

```bash
yarn dlx libyear
```

## CLI

### `--all`

Include dependencies from the whole project.
Default `false`.

_Note: This option is only supported when using `berry` or `pnpm` package managers._

### `--config=<path>`

Path to a libyear configuration file.
Default is automatically resolved by [cosmiconfig](https://github.com/davidtheclark/cosmiconfig).
See [configuration](#configuration).

### `--help` (`-h`)

Show help.
Default `false`.

### `--json`

Outputs the report to the console as valid JSON.
Default `false`.

### `--package-manager`

Accepts `berry`, `npm`, `pnpm`, `yarn`.
Default is inferred.

### `--quiet` (`-q`)

Exclude up-to-date dependencies from results.
Default `false`.

### `--sort=<drift|pulse|releases|major|minor|patch>`

Column to sort individual results by.
Default `null`.

### `--threshold-drift-collective=<libyears>` (`-D=<libyears>`)

Accepts a number.
Default `null`.

Throws an error if the total drift metric surpasses the threshold.

### `--threshold-drift-individual=<libyears>` (`-d=<libyears>`)

Accepts a number.
Default `null`.

Throws an error if any individual drift metric surpasses the threshold.

### `--threshold-pulse-collective=<libyears>` (`-P=<libyears>`)

Accepts a number.
Default `null`.

Throws an error if the total pulse metric surpasses the threshold.

### `--threshold-pulse-individual=<libyears>` (`-p=<libyears>`)

Accepts a number.
Default `null`.

Throws an error if any individual pulse metric surpasses the threshold.

### `--threshold-releases-collective=<count>` (`-R=<count>`)

Accepts an integer.
Default `null`.

Throws an error if the total stable releases metric surpasses the threshold.

### `--threshold-releases-individual=<count>` (`-r=<count>`)

Accepts an integer.
Default `null`.

Throws an error if any individual stable releases metric surpasses the threshold.

### `--threshold-major-collective=<count>`

Accepts an integer.
Default `null`.

Throws an error if the total major metric surpasses the threshold.

### `--threshold-major-individual=<count>`

Accepts an integer.
Default `null`.

Throws an error if any individual major metric surpasses the threshold.

### `--threshold-minor-collective=<count>`

Accepts an integer.
Default `null`.

Throws an error if the total minor metric surpasses the threshold.

### `--threshold-minor-individual=<count>`

Accepts an integer.
Default `null`.

Throws an error if any individual minor metric surpasses the threshold.

### `--threshold-patch-collective=<count>`

Accepts an integer.
Default `null`.

Throws an error if the total patch metric surpasses the threshold.

### `--threshold-patch-individual=<count>`

Accepts an integer.
Default `null`.

Throws an error if any individual patch metric surpasses the threshold.

## Configuration

`libyear` can be configured via [cosmiconfig-supported](https://github.com/davidtheclark/cosmiconfig) formats.

- `package.json` (under `{ "configs": { "libyear": { ... } } }`)
- `.libyearrc`
- `.libyearrc.cjs`
- `.libyearrc.js`
- `.libyearrc.json`
- `.libyearrc.mjs`
- `.libyearrc.ts`
- `.libyearrc.yaml`
- `.libyearrc.yml`
- `libyear.config.cjs`
- `libyear.config.js`
- `libyear.config.mjs`
- `libyear.config.ts`

Custom configuration files can be provided via the [`--config`](#--configpath) CLI option.

Configuration is expected in the following structure.

```json5
{
  overrides: {
    "^@types/": {
      defer: "2020-01-01", // string (ISO formatted Date)
      drift: null, // number (default: null)
      pulse: null, // number (default: null)
      releases: null, // integer (default: null)
      major: null, // integer (default: null)
      minor: null, // integer (default: null)
      patch: null, // integer (default: null)
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
    major: {
      collective: null, // integer (default: null)
      individual: null, // integer (default: null)
    },
    minor: {
      collective: null, // integer (default: null)
      individual: null, // integer (default: null)
    },
    patch: {
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
- `releases` - Override stable releases threshold for matching dependencies.
- `major` - Override major releases threshold for matching dependencies.
- `minor` - Override minor releases threshold for matching dependencies.
- `patch` - Override patch releases threshold for matching dependencies.

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

## Integrations

### GitHub Action

libyear can be run via a [GitHub Action](https://github.com/marketplace/actions/node-js-dependency-freshness-via-libyear) ([source code](https://github.com/s0/libyear-node-action)) courtesy of [@s0](https://github.com/s0).

## FAQ

### Can I whitelist (or allowlist) dependencies from throwing errors?

Dependencies cannot be ignored from threshold checks by design.
If a package cannot be upgraded at a particular point in time, then it should be re-reviewed at a later date.
Packages can be temporarily excused from complying to thresholds by setting a date to "defer" enforcement until in the configuration file.

## Roadmap

### Next

- ci semantic release

### RFC

- batch queries / use npm REST API instead of cli (for release times)
- audit vulnerabilities
- include resolutions
- programmatic use
- include collective metrics in JSON report
- include violations in JSON report

## Contributing

```
corepack enable
yarn install
```

## Acknowledgements

`libyear` is inspired by the package-manager-specific variants of libyear.

- [libyear-npm](https://github.com/jaredbeck/libyear-npm) by [@jaredbeck](https://github.com/jaredbeck)
- [libyear-yarn](https://github.com/sbleon/libyear-yarn) by [@sbleon](https://github.com/sbleon)
