import { io } from "socket.io-client";
import { BASE_URL } from "./path";
export const socket = io(BASE_URL , {
  withCredentials: true,
});