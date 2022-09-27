# pi-temp - DHT11/22 Sensor driver + Data collector and visualizer
This project uses tweaked [gapan](https://github.com/gapan/dht11)'s dht sensor protocol implementation to obtain data from sensor. To collect and visualize data project uses node.js, simple http server, apex charts and sqlite with sequelize ORM.

As a result you will get nice chart-visualized sensor data: ![Screenshot_20220927_225437](https://user-images.githubusercontent.com/53402621/192622927-623faea2-b0f7-46fb-94c0-056fa91a10df.png)

### How to make this work
First of all you need to install wiringpi library, to do so, run following command:
```bash
sudo apt-get install wiringpi
```

Then you need to clone this repo somewhere:
```bash
git clone https://github.com/Hatry1337/pi-temp
```

Go to project directory and create `.env` file

Put inside of file this template and edit if needed
```env
PORT=8090
HOST="0.0.0.0"
DATABASE="/home/pi/pi-temp/data.sqlite"
DRIVER="/home/pi/dht11"
```

`PORT` - port, where webserver will listen for requests

`HOST` - interface ip address, where webserver will listen for requests (0.0.0.0 for all interfaces)

`DATABASE`- path, where your sqlite database will be located

`DRIVER` - path to sensor driver executable (You need to compile it or get binary from releases section)

## ⚠ Pre-Compiled binaries uses by default GPIO4 pin of raspberry pi. If you wanna use other pin, you will need to compile driver by yourself.

Then use npm to install typescript compiler and project dependencies:
```bash
sudo npm i -g typescript && npm i
```

When dependencies are installed you can build typescript:
```bash
tsc
```

Now you are ready to run the server:
```bash
node ./dist/main.js
```



### How to compile driver:

Go to ./driver directory and edit driver source if needed

Then use gcc to compile source file:
```bash
gcc -o dht11 dht11.c -lwiringPi -lwiringPiDev
```

Take binary file `dht11` somewhere and put it's path to the `.env` file
