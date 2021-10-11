import https from 'https';
import fs from 'fs';

const HOST = `maps.googleapis.com`

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

export async function getPlaces(searchString, key, nextPage = undefined) {
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

export function getPlaceDetails(placeID, key) {
    const endpoint = `/maps/api/place/details/json`;
    const free_fields = ["address_component", "business_status"];
    const paid_fields = ["website", "formatted_phone_number"]
    // const paid_fields = []
    const fields = free_fields.concat(paid_fields).join("%2C");
    const path = `${endpoint}?place_id=${placeID}&fields=${fields}&key=${key}`;
    const options = {hostname: HOST, path: path, method: "GET"}

    return wrapRequest(options, (data, resolve) => resolve(JSON.parse(data).result)); 
};

// This will take a list of "address_components" from the google API response
// and turn it into a more traditional us-style address
export function getAddress(components) {
    let out = {};

    components.forEach(({long_name, short_name, types}) => {
        if (types.includes("street_number")) {
            out.street_number = long_name;
        } 
        else if(types.includes("route")) {
            out.street_name = short_name;
        }
        else if(types.includes("locality")) {
            out.city = long_name;
        }
        else if(types.includes("administrative_area_level_1")) {
            out.state = short_name;
        }
        else if(types.includes("administrative_area_level_2")) {
            out.county = long_name;
        }
        else if(types.includes("postal_code")) {
            out.zip_code = long_name;
        }
    })

    return {
        street: `${out.street_number} ${out.street_name}`,
        city: out.city,
        state: out.state,
        zip: out.zip,
        county: out.county
    }
}
