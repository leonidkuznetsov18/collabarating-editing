import * as express from "express";
import * as bodyParser from "body-parser";
import * as io from "socket.io";
import * as http from "http";
import { editor } from "./editor";
const app = express();

const PORT = process.env.HTTP_PORT || 8080;
const HOST = process.env.HTTP_HOST || "0.0.0.0";
// @ts-ignore
const httpServer = http.Server(app);
const socketI0 = io(httpServer);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

editor(socketI0);

httpServer.listen(PORT, HOST, () => {
  console.log(`App listening to http://${HOST}:${PORT}....`);
  console.log("Press Ctrl+C to quit.");
});
