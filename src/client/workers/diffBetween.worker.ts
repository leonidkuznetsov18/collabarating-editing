import * as DiffMatchPatch from "diff-match-patch";
const Changeset = require("changesets").Changeset;

const dmp = new DiffMatchPatch();

export const diffBetween = (a, b) => {
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
};
