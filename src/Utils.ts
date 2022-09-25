import Url from "url";

export class Utils {
    /**
     * Pads specified `number` to `count` zeros
     */
     static padz(count: number, number: number){
        let neg = number < 0;
        if(neg) number = Math.abs(number);
        return (neg ? "-" : "") + String(number).padStart(count, '0');
    }

    /**
     * Returns current timestamp if no date provided formatted to `%Y-%m-%d %H:%M:%S.$f`
     */
    static ts(date = new Date()){
        return `${date.getFullYear()}-${this.padz(2, date.getMonth() + 1)}-${this.padz(2, date.getDate())} ${this.padz(2, date.getHours())}:${this.padz(2, date.getMinutes())}:${this.padz(2, date.getSeconds())}.${this.padz(3, date.getMilliseconds())}`;
    }

    static parseQuery(query: string){
        return query.replace("?", "")
        .split("&")
        .reduce((acc: { [key: string]: string }, val) => { 
            let a = val.split("="); 
            acc[a[0]] = a[1]; 
            return acc
        }, {}) || {};
    }

    static parseQueryUrl(url: string){
        return Utils.parseQuery(Url.parse(url).query || "");
    }
}