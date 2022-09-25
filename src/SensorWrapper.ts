import EventEmitter from "events";
import ChildProcess, { ChildProcessWithoutNullStreams } from "child_process";
import ReadLine from "readline";

export interface SensorData {
    date: Date;
    humidity: number;
    temperature: number;
}

declare interface SensorWrapper {
    on(event: 'rawData', listener: (rawData: string) => void): this;
    on(event: 'data', listener: (data: SensorData) => void): this;
    on(event: 'collected', listener: (data: SensorData) => void): this;
    on(event: 'start', listener: () => void): this;
    on(event: 'stop', listener: () => void): this;
}

class SensorWrapper extends EventEmitter{
    private process?: ChildProcessWithoutNullStreams;
    private stdout?: ReadLine.Interface;
    private collecting?: SensorData;
    private collectedCount: number = 0;

    constructor(private executablePath: string){
        super();
    }

    public start() {
        this.process = ChildProcess.spawn(this.executablePath, [ "-id" ]);
        this.stdout = ReadLine.createInterface(this.process.stdout);
        this.stdout.on("line", (data: string) => {
            this.emit("rawData", data);
            let v = data.trim().split(",");
            let sdata: SensorData = {
                date: new Date(v[0]),
                humidity: parseFloat(v[1]),
                temperature: parseFloat(v[2])
            }
            this.emit("data", sdata);

            if(this.collecting){
                if(this.collecting.date.getMinutes() === sdata.date.getMinutes()){
                    this.collecting.humidity += sdata.humidity;
                    this.collecting.temperature += sdata.temperature;
                    this.collectedCount++;
                }else{
                    let cdata: SensorData = {
                        date: new Date(this.collecting.date.setSeconds(0, 0)),
                        humidity: this.collecting.humidity / this.collectedCount,
                        temperature: this.collecting.temperature / this.collectedCount
                    }
                    this.emit("collected", cdata);

                    this.collecting = undefined;
                    this.collectedCount = 0;
                }
            } else {
                this.collecting = {
                    date: new Date(sdata.date.setSeconds(0, 0)),
                    humidity: sdata.humidity,
                    temperature: sdata.temperature
                }
                this.collectedCount++;
            }
        });

        this.process.on("exit", () => this.stop());
        this.stdout.on("close", () => this.stop());

        this.emit("start");
    }

    public stop() {
        if(this.stdout){
            this.stdout.close();
            this.stdout = undefined;
        }
        if(this.process){
            this.process.kill();
            this.process = undefined;
        }
        this.emit("stop");
    }
}

export default SensorWrapper;