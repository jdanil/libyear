// TODO [-fromentries]: remove custom type definitions when removing fromentries.

// Type definitions for fromentries 1.2.0
// Project: https://github.com/feross/fromentries
// Definitions by: Joshua David <https://github.com/jdanil>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module "fromentries" {
  function fromEntries<T = any>(
    entries: Iterable<readonly [PropertyKey, T]>,
  ): { [k in PropertyKey]: T };
  namespace fromEntries {}
  export = fromEntries;
}
