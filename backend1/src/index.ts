import {WebSocketServer} from 'ws';
import { GameManager } from './logic/GameManager.js';


const wss = new WebSocketServer({port: 8008});

const gameManager = new GameManager();


wss.on('connection', function connection(ws){
    gameManager.addUser(ws);
    ws.on('close', () => gameManager.removeUser(ws))
});