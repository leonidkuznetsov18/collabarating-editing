import SOCKET_TYPE from "../sockets_type";
import * as DiffPatchMatch from "diff-match-patch";

let currentString = "";
const dmp = new DiffPatchMatch();

export default io => {
  io.on(SOCKET_TYPE.CONNECTION, socket => {
    console.log("io server connection");

    socket.on(SOCKET_TYPE.JOIN_ROOM, roomId => {
      console.log("SOCKET_TYPE.JOIN_ROOM", roomId);
      socket.join(roomId);
    });

    socket.on(SOCKET_TYPE.CHANGE_DATA_CLIENT, data => {
      console.log("SOCKET_TYPE.CHANGE_DATA_CLIENT", data);
      currentString = dmp.patch_apply(data.dataText, currentString)[0];
      console.log("====currentString====", currentString);
      socket.broadcast.to(data.roomId).emit(SOCKET_TYPE.CHANGE_DATA_SERVER, {
        ...data,
        dataText: currentString
      });
    });
  });
};
