const ctx: Worker = self as any;
import * as DiffMatchPatch from "diff-match-patch";
const Changeset = require("changesets").Changeset;
// import { debounce } from "lodash";
const dmp = new DiffMatchPatch();
ctx.addEventListener("message", ({ data }) => {
  console.log("in server worker data", data);
  // const diff = dmp.diff_main(data.prevText, data.currentText);
  const diff = dmp.diff_main(data.prevText, data.currentText);
  // const changeSetPack = Changeset.fromDiff(diff).pack();
  // console.log("in server worker changeSetPack", changeSetPack);
  console.log("in server worker diff", diff);
  ctx.postMessage(diff);
});
