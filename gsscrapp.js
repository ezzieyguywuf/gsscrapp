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
const fields = ["formatted_address", "name"].join("%2C");
const searchString = "Board Game Stores".split(" ").join("%20");
const path = `${endpoint}?fields=${fields}&input=${searchString}&inputtype=textquery&key=${key}`

console.log(`request: ${path}`)

const options = {
    hostname: host,
    path: path,
    method: "GET"
}

const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on('data', d => {
        process.stdout.write(d);
    })
})

req.on('error', error => {
    console.error(error);
})

req.end();
