import * as React from "react";
import { debounce } from "lodash";
import * as DiffMatchPatch from "diff-match-patch";
// @ts-ignore
const Changeset = require("changesets").Changeset;
import * as md5 from "blueimp-md5";
import * as DiffWorker from "../../../workers/Diff.worker";
import socket_client from "../../../socket/socket_client";
import "./Editor.scss";
import events from "../../../socket/events";

class Editor extends React.PureComponent {
  constructor(props) {
    super(props);
    // const me = this;
    this.state = {
      text: "",
      lastSyncedText: ""
      // changeSetPack: ""
    };
    // @ts-ignore
    this.textareaRef = React.createRef();
    // @ts-ignore
    this.dmp = new DiffMatchPatch();
    // @ts-ignore
    // this.diffWorker = new DiffWorker();
    // // @ts-ignore
    // this.diffWorker.addEventListener("message", ({ data }) => {
    //   console.log("in client worker", data);
    //   // this.setState({
    //   //   changeSetPack: data
    //   // });
    // });
    // @ts-ignore
    // this.diffWorker.postMessage("Hello from client worker");
    // @ts-ignore
    this.calculateDiffDebounce = debounce(this.calculateDiff, 1000);
  }

  componentDidMount() {
    socket_client.on(events.server.dispatchChangeSet, ({ changeSetPack }) => {
      // apply diff between lastSyncedText and serverText
      const changeSet = Changeset.unpack(changeSetPack);
      // console.log(changeSet.inspect());
      // @ts-ignore
      const serverText = changeSet.apply(this.state.lastSyncedText);

      // calculate diff between localText and serverText
      // @ts-ignore
      const diffBetweenLocalAndServer = this.dmp.diff_main(
        // @ts-ignore
        this.state.text,
        serverText
      );
      const changeSetBetweenSeverAndLocal = Changeset.fromDiff(
        diffBetweenLocalAndServer
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
    });

    socket_client.on(
      events.server.clientInitialization,
      ({ userId, serverText }, callbackToServer) => {
        // @ts-ignore
        this.userId = userId;
        this.setState({ text: serverText, lastSyncedText: serverText });
        // @ts-ignore
        callbackToServer({ textMd5: md5(this.state.text) });
      }
    );

    socket_client.on(events.server.forceSync, text => {
      this.setState({ text, lastSyncedText: text });
    });
  }

  private calCaretPositionShift = (changeSet, caretPosition) => {
    let caretPositionShift = 0;
    let range = 0;
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

    return caretPositionShift;
  };

  calculateDiff() {
    // @ts-ignore

    // this.diffWorker.postMessage({
    //   // @ts-ignore
    //   prevText: this.state.lastSyncedText,
    //   // @ts-ignore
    //   currentText: this.state.text
    // });

    // @ts-ignore
    const diff = this.dmp.diff_main(this.state.lastSyncedText, this.state.text);
    const changeSetPack = Changeset.fromDiff(diff).pack();

    console.log("diff", diff);
    console.log("changeSetPack", changeSetPack);

    socket_client.emit(events.client.uploadChangeSet, {
      // @ts-ignore
      changeSetPack,
      // changeSetPack: this.state.changeSetPack,
      // @ts-ignore
      from: this.userId,
      // @ts-ignore
      textMd5: md5(this.state.text),
      // @ts-ignore
      lastSyncedTextMd5: md5(this.state.lastSyncedText)
    });
  }

  onChange = e => {
    this.setState({ text: e.target.value });
    // @ts-ignore
    this.calculateDiffDebounce();
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
