import https from 'https';
import fs from 'fs';

const HOST = `maps.googleapis.com`

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

function wrapRequest(options, fn) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            let body = "";

            res.on("data", chunk => body += chunk.toString());
            res.on("error", reject);
            res.on("end", () => {

                if (res.statusCode > 299) {
                    const msg = `request failed. status: ${res.statusCode}, body: ${body}`;
                    console.log(`ERROR!!! ${msg}`)
                    reject(msg);
                }
                else {
                    fn(body, resolve);
                }
            });
        }); // const req
        req.on('error', reject);
        req.end();
    }) // new promise
}

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

async function getPlaces(searchString, key, nextPage = undefined) {
    const endpoint = `/maps/api/place/textsearch/json`;
    const query = searchString.split(" ").join("%20");
    const path = `${endpoint}?query=${query}&key=${key}` +
        (nextPage === undefined ? '' : `&pagetoken=${nextPage}`);
    const options = {hostname: HOST, path: path, method: "GET"}

    console.log(`path = ${path}`)
    return wrapRequest(options, async (data, resolve) => {
        const {next_page_token, results} = JSON.parse(data);
        const parsedResults = parseResults(results);

        if (next_page_token !== undefined) {
            // the google api docs say that there's a 'slight delay'
            // before the next_page_token is valid (they don't say
            // how long the delay is...)
            console.log("sleeping...");
            await new Promise((resolve) => setTimeout(resolve, 3000));
            console.log("    recursing...");
            const moreResults = await getPlaces(searchString, key, next_page_token);
            resolve(parsedResults.concat(parseResults(moreResults)));
        }

        resolve(parsedResults);
    }); 
};

const key = processArgs();

const data = await getPlaces("Board Game Stores in Raleigh, North Carolina", key);
console.log(`here's the data I got`)
// console.log(data)
console.log(`writing to nc_data.json`);

fs.writeFileSync("./nc_data.json", JSON.stringify(data, null, 4), 'utf8');

// const data = JSON.parse(fs.readFileSync('./nc_data.json', 'utf8'));

console.log(`got ${data.length} results`)
