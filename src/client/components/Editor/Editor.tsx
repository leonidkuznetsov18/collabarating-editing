import * as React from "react";
import { debounce } from "lodash";
// @ts-ignore
import * as DiffWorker from "../../workers/Diff.worker";
// @ts-ignore
const Changeset = require("changesets").Changeset;
import * as md5 from "blueimp-md5";
import socket_client from "../../../socket/socket_client";
import "./Editor.scss";
import events from "../../../socket/events";

interface Props { }

interface State {
  text: string;
  lastSyncedText: string;
}
class Editor extends React.PureComponent<Props, State> {
  textareaRef: React.RefObject<{}>;
  userId: string;
  constructor(props) {
    super(props);
    // const me = this;
    this.state = {
      text: "",
      lastSyncedText: ""
    };
    this.textareaRef = React.createRef();
    this.userId = "";
  }

  componentDidMount() {
    if (socket_client) {
      socket_client.on(
        events.server.dispatchChangeSet,
        async ({ changeSetPack }) => {
          // apply diff between lastSyncedText and serverText
          const changeSet = Changeset.unpack(changeSetPack);
          console.log(changeSet.inspect());
          // @ts-ignore
          const serverText = changeSet.apply(this.state.lastSyncedText);

          const diffWorker = DiffWorker();
          // // @ts-ignore
          const changeSetBetweenSeverAndLocal = await diffWorker.diffBetween(
            // @ts-ignore
            this.state.text,
            // @ts-ignore
            serverText
          );

          console.log(
            "type changeSetBetweenSeverAndLocal",
            typeof changeSetBetweenSeverAndLocal
          );

          console.log(
            "changeSetBetweenSeverAndLocal",
            changeSetBetweenSeverAndLocal
          );
          // @ts-ignore
          const caretPosition = this.textareaRef.current.selectionStart;

          this.setState(
            {
              text: serverText,
              lastSyncedText: serverText
            },
            () => {
              const modifiedLength = this.calCaretPositionShift(
                changeSetBetweenSeverAndLocal,
                caretPosition
              );
              // @ts-ignore
              this.textareaRef.current.focus;
              // @ts-ignore
              this.textareaRef.current.setSelectionRange(
                modifiedLength + caretPosition,
                modifiedLength + caretPosition
              );
            }
          );
        }
      );

      socket_client.on(
        events.server.clientInitialization,
        ({ userId, serverText }, callbackToServer) => {
          this.userId = userId;
          this.setState({ text: serverText, lastSyncedText: serverText });

          callbackToServer({ textMd5: md5(this.state.text) });
        }
      );

      socket_client.on(events.server.forceSync, text => {
        this.setState({ text, lastSyncedText: text });
      });
    }
  }

  private calCaretPositionShift = (changeSet, caretPosition) => {
    let caretPositionShift = 0;
    let range = 0;
    console.log("type changeSet", typeof changeSet);
    console.log("changeSet", changeSet);

    for (let i = 0; i < changeSet.length; i++) {
      if (changeSet[i].symbol === "=") {
        range += changeSet[i].length;
      } else if (changeSet[i].symbol === "+") {
        caretPositionShift += changeSet[i].length;
      } else if (changeSet[i].symbol === "-") {
        caretPositionShift -= changeSet[i].length;
      }

      if (range >= caretPosition) {
        return caretPositionShift;
      }
    }

    console.log("caretPositionShift", caretPositionShift);

    return caretPositionShift;
  };

  calculateDiff = debounce(async () => {
    const workerDiffCalc = DiffWorker();
    console.log("workerDiffCalc", workerDiffCalc);
    // @ts-ignore
    const changeSetPack = await workerDiffCalc.diffCalc(
      // @ts-ignore
      this.state.lastSyncedText,
      // @ts-ignore
      this.state.text
    );

    console.log("changeSetPack", changeSetPack);

    socket_client.emit(events.client.uploadChangeSet, {
      // @ts-ignore
      changeSetPack,

      // @ts-ignore
      from: this.userId,
      // @ts-ignore
      textMd5: md5(this.state.text),
      // @ts-ignore
      lastSyncedTextMd5: md5(this.state.lastSyncedText)
    });
  }, 1000);

  onChange = e => {
    this.setState({ text: e.target.value });
    // @ts-ignore
    this.calculateDiff();
  };

  render() {
    return (
      <textarea
        className="Editor"
        name="code-pad"
        // @ts-ignore
        ref={this.textareaRef}
        id="code-text-area"
        rows={10}
        // @ts-ignore
        value={this.state.text}
        onChange={this.onChange}
      />
    );
  }
}

export default Editor;
