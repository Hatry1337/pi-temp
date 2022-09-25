import "dotenv/config";
import sequelize from "./database.js";
import { DataEntry } from "./Models/DataEntry.js";
import SensorWrapper, { SensorData } from "./SensorWrapper.js";
import WebServer from "./WebServer.js";
import fs from "fs/promises";

import url from "url";
import path from "path";
import { Op } from "sequelize";
import { Utils } from "./Utils.js";

const staticDir = path.normalize(path.dirname(url.fileURLToPath(import.meta.url)) + "/../static");

(async () => {
    if(!process.env.PORT){
        throw new Error("No 'PORT' env var!");
    }

    if(!process.env.HOST){
        throw new Error("No 'HOST' env var!");
    }

    if(!process.env.DATABASE){
        throw new Error("No 'DATABASE' env var!");
    }

    if(!process.env.DRIVER){
        throw new Error("No 'DRIVER' env var!");
    }

    await sequelize.sync();

    let server = new WebServer(parseInt(process.env.PORT), process.env.HOST);
    let sensor = new SensorWrapper(process.env.DRIVER);

    await server.listen();
    console.log(`WebServer started! (http://${server.host}:${server.port}/)`);

    sensor.start();
    console.log(`Sensor wrapper started!`);

    sensor.on("collected", async (data) => {
        console.log("[collected]", data);
        await DataEntry.create({
            date: data.date,
            humidity: data.humidity,
            temperature: data.temperature
        });
    });

    server.addHandler("/", "GET", async (req, res) => {
        res.writeHead(200, {
            "Content-Type": "text/html"
        });
        res.end(await fs.readFile(staticDir + "/index.html"));
    });

    server.addHandler("/data", "GET", async (req, res) => {
        let q = Utils.parseQueryUrl(req.url || "");

        let from: number | null = parseInt(q.from);
        if(isNaN(from)) {
            from = null;
        }

        let to: number | null = parseInt(q.to);
        if(isNaN(to)) {
            to = null;
        }

        let data = await DataEntry.findAll({
            where: {
                date: {
                    [Op.between]: [new Date(from || 0), new Date(to || 999999999999999)]
                }
            }
        });

        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        
        res.end(JSON.stringify(
            data.map(v => ({ 
                date: v.getDataValue("date").getTime(), 
                humidity: v.getDataValue("humidity"), 
                temperature: v.getDataValue("temperature") 
            }))
        ));
    });

    const last1000: SensorData[] = [];

    sensor.on("data", (data) => {
        last1000.push(data);
        if(last1000.length > 1000){
            for(let i = 0; i < last1000.length - 1000; i++){
                last1000.shift();
            }
        }
    });

    server.addHandler("/data_detailed", "GET", async (req, res) => {
        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify(last1000));
    });
})();