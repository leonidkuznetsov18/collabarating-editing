const ctx: Worker = self as any;
import * as DiffMatchPatch from "diff-match-patch";
// const Changeset = require("changesets").Changeset;
// import { debounce } from "lodash";
const dmp = new DiffMatchPatch();
ctx.addEventListener("message", ({ data }) => {
  const diff = dmp.diff_main(data.prevText, data.currentText);
  console.log("in server worker", diff);
  ctx.postMessage(diff);
});
