import { getPlaces, getPlaceDetails, getAddress } from "./gsscrapp.js";
import fs from 'fs';

// The task here is to generate a list of all Board Game Stores in the united
// states. We'll search by state.
//
// NOTE: I've actually commented out most of this file, since it makes actual
// API calls to google that will be charged. I ran this very carefully,
// step-by-step, and wrote the intermediate files out to disk. I did it this way
// in order to avoid making more API calls than I needed to

// We'll exclude these as early as possible to try to save some money on google
// API calls
const BLACKLIST = [
    "target",
    "walmart",
    "barnes and noble",
    "barnes & noble",
    "escape",
    "amazon",
    "schuler books",
    "powell's books",
    "k-mart",
    "joseph-beth booksellers",
    "the hudson news",
    "airport",
    "hastings",
    "half-price books",
    "deseret books",
    "books-a-million",
    "gamestop",
    "eb games",
    "nintendo",
    "pink gorilla",
    "funcoland",
    "play n trade",
    "gamecrazy",
    "rainbow computing",
    "rhino video games",
    "gamestop",
    "slackers cds and games"
]

const STATES = fs.readFileSync("./states.txt", "utf8").split('\n');

// We need the google API key
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

// const placesPromises = STATES.slice(3).map(state => getPlaces(`Board Game Stores in ${state}`, key));
// Promise.all(placesPromises).then(places => {

//     // This lets us remove duplicate place_ids as early as possible (well, I
//     // guess it's technically possible to do this earlier...)
//     let uids = new Set();
//     const cleanData = places.flat().filter(({ name, place_id }) => {
//         for (const check of BLACKLIST) {
//             if (name.toLowerCase().includes(check)) {
//                 return false;
//             }
//         }

//         if (uids.has(place_id)) {
//             return false;
//         }
//         else {
//             uids.add(place_id);
//             return true;
//         }
//     });

//     console.log(`got ${cleanData.length} scrubbed results`);
//     console.log(`writing data for ${STATES.slice(3)} to last_fourty_five.json`);
//     fs.writeFileSync("./last_fourty_five.json", JSON.stringify(cleanData, null, 4));
// })

// const cleanData = JSON.parse(fs.readFileSync('./all_states_raw.json', 'utf8'));

// const fullData = await Promise.all(cleanData.map(async (place) => {
//     const {address_components, ...newData} = await getPlaceDetails(place.place_id, key);
//     const address = getAddress(address_components);
//     return {...place, ...address, ...newData};
// }));

// fs.writeFileSync("./all_states_with_details.json", JSON.stringify(fullData, null, 4), 'utf8');
