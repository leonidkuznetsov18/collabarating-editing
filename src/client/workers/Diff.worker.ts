import * as DiffMatchPatch from "diff-match-patch";
const Changeset = require("changesets").Changeset;

const dmp = new DiffMatchPatch();

export function add(a, b) {
  return a + b;
}

export function diffCalc(a, b) {
  console.log("a", typeof a, "b", typeof b);
  const diff = dmp.diff_main(a, b);
  // @ts-ignore
  const changeSetPack = Changeset.fromDiff(diff).pack();
  return changeSetPack;
}

export function diffBetween(a, b) {
  // @ts-ignore
  const diffBetweenLocalAndServer = dmp.diff_main(
    // @ts-ignore
    a,
    b
  );
  const changeSetBetweenSeverAndLocal = Changeset.fromDiff(
    diffBetweenLocalAndServer
  );

  console.log("in worker", diffBetweenLocalAndServer);
  return changeSetBetweenSeverAndLocal;
}
