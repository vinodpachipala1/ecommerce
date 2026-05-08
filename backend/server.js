import app from "./src/app.js"
import { Server } from "socket.io"
import http from "http"
import dotenv from "dotenv";

const server = http.createServer(app);
dotenv.config();

const io = new Server(server, {
    cors: {
        origin: process.env.frontend_url,
        credentials: true,
    },
})

export { io };

server.listen(3001, () => {
    console.log(`Listening to port 3001`);
})