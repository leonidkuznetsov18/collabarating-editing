import * as uuid from "uuid/v4";
import { debounce } from "lodash";
import * as DiffMatchPatch from "diff-match-patch";
// @ts-ignore
// import * as Changeset from "changesets";
const Changeset = require("changesets").Changeset;
import * as md5 from "blueimp-md5";
import events from "../socket/events";

const usersMap = new Map();
let serverText = "";
let lastSyncText = "";
const changeSetStack = [];
let appliedChangeSet;

const handleStack = debounce(({ io, socket }) => {
  // the idea here is to put all the changeSet from different client in one stack, FILO
  // when we apply one changeSet to serverText, we need to do Inclusion Transformation for other changeSet by "transformAgainst"
  while (changeSetStack.length > 0) {
    const item = changeSetStack[0];
    const changeSet = item.changeSet;
    try {
      serverText = changeSet.apply(serverText);
      appliedChangeSet = item.changeSet;
      changeSetStack.shift();
      changeSetStack.map(changeSetItem => {
        changeSetItem.changeSet = changeSetItem.changeSet.transformAgainst(
          appliedChangeSet
        );
      });
    } catch (err) {
      console.log(err);
    }
  }

  appliedChangeSet = null;
  console.log("serverText:", serverText);
  const dmp = new DiffMatchPatch();
  const diff = dmp.diff_main(lastSyncText, serverText);
  const changeSetPack = Changeset.fromDiff(diff).pack();
  io.emit(events.server.dispatchChangeSet, { changeSetPack });
  lastSyncText = serverText;
}, 1000);

export const editor = io => {
  io.on(events.system.connection, socket => {
    const userId = uuid();
    console.log("user connected:", userId);
    usersMap.set(userId, {});
    socket.emit(
      events.server.clientInitialization,
      { userId, serverText },
      response => {
        if (!response.md5 === md5(serverText)) {
          socket.emit(events.server.clientInitialization, {
            userId,
            serverText
          });
        }
      }
    );

    socket.on(
      events.client.uploadChangeSet,
      ({ changeSetPack, textMd5, from, lastSyncedTextMd5 }) => {
        if (lastSyncedTextMd5 !== md5(serverText)) {
          socket.emit(events.server.forceSync, serverText);
          return;
        }

        console.log(
          "changeSetPack ",
          from,
          Changeset.unpack(changeSetPack).inspect()
        );
        changeSetStack.push({
          textMd5,
          from,
          lastSyncedTextMd5,
          changeSet: Changeset.unpack(changeSetPack)
        });
        handleStack({ io, socket });
      }
    );

    socket.on(events.system.disconnect, () => {
      console.log("user disconnected:", userId);
    });
  });

  return { serverText, usersMap };
};

export default editor;
