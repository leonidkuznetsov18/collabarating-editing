import { setConfig } from "react-hot-loader";

setConfig({
  logLevel: "debug",
  ignoreSFC: true, // RHL will be __completely__ disabled for SFC
  pureRender: true // RHL will not change render method
});
