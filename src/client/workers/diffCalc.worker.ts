import * as DiffMatchPatch from "diff-match-patch";
const Changeset = require("changesets").Changeset;

const dmp = new DiffMatchPatch();

export const diffCalc = (a, b) => {
  const diff = dmp.diff_main(a, b);
  // @ts-ignore
  const changeSetPack = Changeset.fromDiff(diff).pack();
  return changeSetPack;
};
