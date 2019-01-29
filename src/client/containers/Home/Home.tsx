import * as React from "react";
import { hot } from "react-hot-loader/root";
import Editor from "../../components/Editor";
import "./Home.scss";

interface Props { }

interface State { }

class Home extends React.PureComponent<Props, State> {
  constructor(props) {
    // @ts-ignore
    super(props);
    // @ts-ignore
    this.state = {};

    // @ts-ignore
  }

  render() {
    // @ts-ignore
    return (
      <div className="Home">
        <h1>Collaborate Text Editor</h1>
        {
          // @ts-ignore
          <Editor
            id={"textarea1"}
            projectId={"uniqProject"}
            room={"uniqRoom"}
          />
        }
      </div>
    );
  }
}

export default hot(Home);
