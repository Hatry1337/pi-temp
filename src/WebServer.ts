import http from "http";
import { Utils } from "./Utils.js";
import chalk from "chalk";
import url from "url";

export type WebServerRequestHandler = (req: http.IncomingMessage, res: http.ServerResponse) => Promise<void>;
export type WebServerRequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export default class WebServer {
    private handlers: Map<`<${WebServerRequestMethod}>${string}`, WebServerRequestHandler>;
    public server: http.Server;

    constructor(public readonly port: number, public readonly host: string) {
        this.server = http.createServer(this.httpRequestHandler.bind(this));
        this.handlers = new Map();
    }

    private async httpRequestHandler(req: http.IncomingMessage, res: http.ServerResponse) {
        let handler = this.handlers.get(`<${req.method as WebServerRequestMethod}>${url.parse(req.url || "").pathname}`);

        if(handler){
            try {
                await handler(req, res);
            } catch (error) {
                console.error(error);
                res.writeHead(500, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify({ error: "Internal Server Error" }));
            }
        } else {
            res.writeHead(404, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify({ error: "Not found" }));
        }

        let codeColor = chalk.white;
        switch(Math.floor(res.statusCode / 100)){
            case 2:
                codeColor = chalk.green;
                break;

            case 3:
                codeColor = chalk.blue;
                break;

            case 4:
                codeColor = chalk.yellow;
                break;

            case 5:
                codeColor = chalk.red;
                break;
        }
        console.log(`[${chalk.green(Utils.ts())}] [${chalk.magenta(req.method)}] [${codeColor(res.statusCode)}] ${chalk.blue(req.socket.remoteAddress)} -> ${chalk.blueBright(req.url)}`);
    }

    public listen() {
        return new Promise<void>((resolve) => {
            this.server.listen(this.port, this.host, () => resolve());
        });
    }

    public addHandler(url: string, method: WebServerRequestMethod, handler: WebServerRequestHandler) {
        this.handlers.set(`<${method}>${url}`, handler);
    }
}