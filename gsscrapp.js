import https from 'https';
import fs from 'fs';

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

function parseResults(results) {
    return results.map( res => {
        return {
            name: res.name,
            place_id: res.place_id,
            rating: res.rating,
            user_ratings_total: res.user_ratings_total,
            business_status: res.business_status
        };
    });
}
async function getPlaces(searchString) {
    // const endpoint = `/maps/api/place/findplacefromtext/json`;
    const endpoint = `/maps/api/place/textsearch/json`;
    // const fields = ["formatted_address", "name", "place_id"].join("%2C");
    // const fields = "place_id";
    const searchString = searchString.split(" ").join("%20");
    // const path = `${endpoint}?fields=${fields}&input=${searchString}&inputtype=textquery&key=${key}`
    const path = `${endpoint}?query=${searchString}&key=${key}`
    const options = {hostname: host, path: path, method: "GET"}

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            console.log(`options = ${JSON.stringify(options, null, 4)}`)
            let body = "";

            res.on("data", chunk => body += chunk.toString());
            res.on("error", reject);
            res.on("end", async () => {
                if (res.statusCode >= 200 && res.statusCode <= 299) {
                    const {next_page_token, results} = JSON.parse(body);
                    const parsedResults = parseResults(results);

                    if (next_page_token !== undefined) {
                        // the google api docs say that there's a 'slight delay'
                        // before the next_page_token is valid (they don't say
                        // how long the delay is...)
                        console.log("sleeping...");
                        await new Promise((resolve) => setTimeout(resolve, 3000));
                        console.log("    recursing...");
                        const moreResults = await getPlaces({
                            ...options,
                            path: `${path}&pagetoken=${next_page_token}`
                        });
                        console.log(`moreResults = ${moreResults}`)
                        resolve(parsedResults.concat(parseResults(moreResults)));
                    }

                    resolve(parsedResults);
                }
                else {
                    const msg = `request failed. status: ${res.statusCode}, body: ${body}`;
                    console.log(`ERROR!!! ${msg}`)
                    reject(msg);
                }
            }) // res.on("end"...)
        }); // const req
        req.on('error', error => {
            console.log(`THERE WAS AN ERROR`);
            return reject("there was some other kind of error");
        });
        req.end();
    }) // new promise
};

// console.log(`request: ${path}`)
// const data = await getPlaces("Board Game Stores in Raleigh, North Carolina");
// console.log(`here's the data I got`)
// console.log(data)
// console.log(`writing to nc_data.json`);

// fs.writeFileSync("./nc_data.json", JSON.stringify(data, null, 4), 'utf8');

const data = JSON.parse(fs.readFileSync('./nc_data.json', 'utf8'));

console.log(`got ${data.length} results`)
