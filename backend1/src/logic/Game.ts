import {WebSocket} from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, INIT_TIMED_GAME, MOVE } from "./message.js";

export class Game {

    public player1: WebSocket;
    public player2: WebSocket;
    private board: Chess;
    private isTimedGame: boolean;
    private startTime: number;

    constructor(player1: WebSocket, player2: WebSocket, isTimedGame: boolean) {
        this.player1 = player1;
        this.player2 = player2;
        this.isTimedGame = isTimedGame;
        this.board = new Chess();
        this.startTime = Date.now();
        if(Math.random() % 2 === 0){
            this.player1.send(JSON.stringify({
            type: INIT_GAME || INIT_TIMED_GAME,
            payload: {
                color: "white"
            }
            }));
            this.player2.send(JSON.stringify({
                type: INIT_GAME || INIT_TIMED_GAME,
                payload: {
                    color: "black"
                }
            }));
        } else {
            this.player1.send(JSON.stringify({
            type: INIT_GAME || INIT_TIMED_GAME,
            payload: {
                color: "black"
            }
            }));
            this.player2.send(JSON.stringify({
                type: INIT_GAME || INIT_TIMED_GAME,
                payload: {
                    color: "white"
                }
            }));
        }
    }

    makeMove(socket: WebSocket, move: {
        from: string;
        to: string;
    }){
        if(this.board.moves.length % 2 === 0 && socket !== this.player1){
            return;
        }
        if(this.board.moves.length % 2 === 1 && socket !== this.player2){
            return;
        }
        try {
            this.board.move(move);
        } catch (error) {
            return;
        }

        if(this.isTimedGame && Date.now()-this.startTime >= 10*60*1000){
             this.player2.emit(JSON.stringify({
                type: GAME_OVER,
                payload: 'time_up'
            }));
             this.player1.emit(JSON.stringify({
                type: MOVE,
                payload: 'time_up'
            })); 
        }

        if(this.board.isGameOver()){
            this.player1.emit(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winners: this.board.turn() === "w" ? "black" : "white"
                }
            }));
            return;
        }

        if(this.board.isGameOver()){
            this.player2.emit(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winners: this.board.turn() === "w" ? "black" : "white"
                }
            }));
            return;
        }

        if(this.board.isDraw()){
             this.player2.emit(JSON.stringify({
                type: GAME_OVER,
                payload: 'draw'
            }));
             this.player1.emit(JSON.stringify({
                type: MOVE,
                payload: 'draw'
            })); 
        }

        if(this.board.moves.length % 2 === 0) {
            this.player2.emit(JSON.stringify({
                type: MOVE,
                payload: move
            })) 
        } else {
            this.player1.emit(JSON.stringify({
                type: MOVE,
                payload: move
            }))
        }
    }
}