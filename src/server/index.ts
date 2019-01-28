import * as express from "express";
import * as bodyParser from "body-parser";
import * as io from "socket.io";
import * as http from "http";
// import Sockets from "./sockets";
import { editor } from "./editor";
const app = express();
// @ts-ignore
const httpServer = http.Server(app);
const socketI0 = io(httpServer);
editor(socketI0);

const PORT = process.env.HTTP_PORT || 8080;
const HOST = process.env.HTTP_HOST || "0.0.0.0";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Sockets(socketI0);
// editor.init();
// @ts-ignore

httpServer.listen(PORT, HOST, () => {
  console.log(`App listening to http://${HOST}:${PORT}....`);
  console.log("Press Ctrl+C to quit.");
});
