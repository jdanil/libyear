---
"@stedi/libyear": major
---

feat: To fix a bug where the pulse is negative we've changed how we determine the latest version. Instead of picking whatever version number is highest, we now refer to what NPM says is the lates version of a package. BREAKING
