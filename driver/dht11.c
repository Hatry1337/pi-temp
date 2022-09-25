#include <wiringPi.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <unistd.h>
#include <time.h>

#define MAX_TIME 85
#define MAX_TRIES 100
#define DHT11PIN 7

int dht11_val[5] = {0, 0, 0, 0, 0};

int dht11_read_val(int *h, int *t, int *tf) {
    uint8_t lststate = HIGH;
    uint8_t counter = 0;
    uint8_t j = 0, i;

    for (i = 0; i < 5; i++) {
        dht11_val[i] = 0;
    }

    pinMode(DHT11PIN, OUTPUT);
    digitalWrite(DHT11PIN, LOW);
    delay(18);
    digitalWrite(DHT11PIN, HIGH);
    delayMicroseconds(40);
    pinMode(DHT11PIN, INPUT);

    for (i = 0; i < MAX_TIME; i++) {
        counter = 0;
        while (digitalRead(DHT11PIN) == lststate) {
            counter++;
            delayMicroseconds(1);
            if (counter == 255)
                break;
        }
        lststate = digitalRead(DHT11PIN);
        if (counter == 255)
            break;
        // top 3 transitions are ignored
        if ((i >= 4) && (i % 2 == 0)) {
            dht11_val[j / 8] <<= 1;
            if (counter > 16)
                dht11_val[j / 8] |= 1;
            j++;
        }
    }

    // verify cheksum and print the verified data
    if ((j >= 40) && (dht11_val[4] == ((dht11_val[0] + dht11_val[1] + dht11_val[2] + dht11_val[3]) & 0xFF))) {
        // Only return the integer part of humidity and temperature. The sensor
        // is not accurate enough for decimals anyway
        *h = dht11_val[0];
        *t = dht11_val[2];
        *tf = dht11_val[3];
        return 0;
    } else {
        // invalid data
        return 1;
    }
}

int main(int argc, char *argv[]) {
    int h;  // humidity
    int t;  // temperature in degrees Celsius
    int tf; // float part of temperature

    // flags
    int print_time = 0;
    int infinitely = 0; // print sensor data only once by default

    int opt;
    while ((opt = getopt(argc, argv, "dhi")) != -1) {
        switch (opt) {
            case 'd':
                print_time = 1;
                break;
            case 'i':
                infinitely = 1;
                break;
            default:
                printf("Usage: %s [-dhi]\n\n", argv[0]);
                printf("OPTIONS:\n");
                printf("    -d,    Print date and time before values\n");
                printf("    -i,    Read and print data infinitely\n");
                printf("    -h,    This help message\n");
                exit(1);
        }
    }

    // error out if wiringPi can't be used
    if (wiringPiSetup() == -1) {
        printf("Error interfacing with WiringPi\n");
        exit(1);
    }

    // throw away the first 3 measurements
    for (int i = 0; i < 3; i++) {
        dht11_read_val(&h, &t, &tf);
        delay(500);
    }

    while (1) {
        // read the sensor until we get a pair of valid measurements
        // but bail out if we tried too many times
        time_t current_time = time(NULL);
        struct tm tm = *localtime(&current_time);

        int retval = 1;
        int tries = 0;
        while (retval != 0 && tries < MAX_TRIES) {
            retval = dht11_read_val(&h, &t, &tf);
            if (retval == 0) {
                if (print_time == 1) {
                    printf("%4d-%02d-%02d ", tm.tm_year + 1900, tm.tm_mon + 1, tm.tm_mday);
                    printf("%02d:%02d:%02d,", tm.tm_hour, tm.tm_min, tm.tm_sec);
                }
                printf("%d,", h);
                printf("%d.%d\n", t, tf);
                fflush(stdout);
            } else {
                delay(100);
            }
            tries += 1;
        }
        if (tries > MAX_TRIES) {
            return 1;
        }

        if(!infinitely){
            break;
        }
    }
}
