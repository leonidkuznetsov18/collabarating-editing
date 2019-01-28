import * as React from "react";
import { hot } from "react-hot-loader/root";
import Editor from "../../components/Editor";
import "./Home.scss";

interface Props { }

interface State { }

class Home extends React.Component<Props, State> {
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
