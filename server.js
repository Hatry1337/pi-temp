import fs from "fs/promises";
import http from "http";

const port = 8090;
const host = "127.0.0.1";
const logPath = "/home/pi/temperature.log"

/**
 * 
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 */
const requestListener = async (req, res) => {
    switch(req.url){
        case "/": {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(await fs.readFile("./static/index.html"));
            break;
        }
        case "/data": {
            let data = await readSensorData();
            res.setHeader("Content-Type", "application/json");
            res.writeHead(200);
            res.end(JSON.stringify(data));
            break;
        }
        default: {
            res.setHeader("Content-Type", "application/json");
            res.writeHead(404);
            res.end(JSON.stringify({ error: "Not found" }));
            break;
        }
    }
    
};

async function readSensorData(){
    let data = await fs.readFile(logPath);
    let values = data.toString().split("\n").map(v => v.split(",")).map(v => ({ ts: new Date(`${v[0]},${v[1]}`), humid: v[2], temp: v[3] }));

    let newData = [];

    let i = 0;
    while(i < values.length-1){
        let v = values[i];
        let cd = v.ts.toDateString();
        let ch = v.ts.getHours();
        let cm = v.ts.getMinutes();

        let httl = 0;
        let tttl = 0;
        let scnt = 0;
        while(v && v.ts.toDateString() === cd && v.ts.getHours() === ch && v.ts.getMinutes() === cm){
            httl += parseFloat(v.humid);
            tttl += parseFloat(v.temp);
            scnt++;
            
            i++;
            v = values[i];
        }
        newData.push({
            ts: new Date(`${cd} ${ch}:${cm}`),
            temp: tttl / scnt,
            humid: httl / scnt
        });
    }
    return newData;
}


const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});