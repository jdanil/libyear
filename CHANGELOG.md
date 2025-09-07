# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 0.9.3 (2025-09-07)

### Bug Fixes

- catch error if fetching package info fails

# 0.9.2 (2025-07-13)

### Bug Fixes

- handle undefined versions

# 0.9.1 (2025-07-12)

### Bug Fixes

- handle unknown versions in calculations

# 0.9.0 (2025-07-05)

### Bug Fixes

- remove unnecessary semver option
- expose libyear in package.json exports
- avoid "stopping-the-world" with concurrency limits
- ignore deprecated versions

### Features

- upgrade `cosmiconfig` to support `.config` directory and `.mjs` and `.ts` configuration files
- add dev option
- add help option
- add pre-releases option
- add quiet option
- sort results by column
- remove index column
- add hyperlink to dependencies
- add totals to table
- add aliases for major, minor, patch options
- add deprecations to output

### BREAKING CHANGES

- drop support for node 18, 19, <20.18, 21, <22.8, 23
- rename "threshold" to "limit"
- rename "available" to "latest"

# 0.8.0 (2022-05-31)

### Bug Fixes

- filter out unpublished versions

### BREAKING CHANGES

- drop support for node 12
- esm migration

# 0.7.0 (2021-09-06)

### Bug Fixes

- handle invalid current versions

### BREAKING CHANGES

- drop support for node 10 & 15

# 0.6.2 (2020-12-07)

### Bug Fixes

- improve pulse calculation accuracy

# 0.6.1 (2020-10-10)

### Bug Fixes

- handle invalid available versions

# 0.6.0 (2020-10-10)

### Bug Fixes

- handle missing dependency info time
- available to no longer recommend older stable versions

### Features

- support yarn v2 plug'n'play
- support major, minor, patch metrics
- support JSON output
- support package and project level checks
- support config option

# 0.5.0 (2020-05-02)

### Bug Fixes

- merge pnpm list

### Features

- support cosmiconfig
- support overrides
- support pnpm

# 0.4.2 (2020-04-22)

### Bug Fixes

- support node >=10

# 0.4.0 (2020-02-22)

### Features

- detect threshold violations at dependency-level
- support releases metric
- style logs with chalk

# 0.3.0 (2020-02-18)

### Features

- support node@10

# 0.2.0 (2020-02-17)

### Features

- support short cli options for threshold
