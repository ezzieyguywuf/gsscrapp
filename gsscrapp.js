import https from 'https';

function processArgs() {
    const args = process.argv;

    if (args.length <= 2) {
        console.log(`Please pass your google API as parameter to the program.`);
        console.log(`e.g. "node gsscrapp.js THIS_IS_MY_GOOGLE_API_KEY"`);
        process.exit(1);
    }
    else {
        return args[2];
    }
}

const key = processArgs();
const host = `maps.googleapis.com`
const endpoint = `/maps/api/place/findplacefromtext/json`;
// const endpoint = `/maps/api/place/textsearch/json`;
// const fields = ["formatted_address", "name", "place_id"].join("%2C");
const fields = "place_id";
const searchString = "Board Game Stores in Raleigh, North Carolina".split(" ").join("%20");
const path = `${endpoint}?fields=${fields}&input=${searchString}&inputtype=textquery&key=${key}`
// const path = `${endpoint}?query=${searchString}&key=${key}`

async function getData(options) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            let body = "";

            res.on("data", chunk => body += chunk.toString());
            res.on("error", reject);
            res.on("end", () => {
                if (res.statusCode >= 200 && res.statusCode <= 299) {
                    resolve(body);
                }
                else {
                    reject(`request failed. status: ${res.statusCode}, body: ${body}`);
                }
            }) // res.on("end"...)
        }); // const req
        req.on('error', error => reject);
        req.end();
    }) // new promise
};

const options = {
    hostname: host,
    path: path,
    method: "GET"
}

console.log(`request: ${path}`)
const data = await getData(options);
console.log(data)
