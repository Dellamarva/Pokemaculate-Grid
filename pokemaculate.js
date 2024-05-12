const express = require("express"); /* Accessing express module */
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser"); /* To handle post parameters */
const app = express(); /* app is a request handler function */
const portNumber = 4000;
require("dotenv").config({ path: path.resolve(__dirname, '.env') }) 
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_CONNECTION_STRING;
const grid_db = {db: process.env.MONGO_DB_NAME, collection: process.env.GRID_COLLECTION};
const leaderboard = {db: process.env.MONGO_DB_NAME, collection: process.env.LEADERBOARD_COLLECTION};

/* view/templating engine and aquire CSS and script*/
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'script')));

/* Post calls */
app.use(bodyParser.urlencoded({extended:false}));

//start.ejs
app.get("/", (req, res) => {
    res.render("start");
});

let db_name = "";
//confirm.ejs
app.post("/", (req, res) => {
    let {name} = req.body;
    db_name = name;
    let files = {name: name};
    res.render("confirm", files);
});

//grid.ejs
app.get("/grid", (req, res) => {
    res.render("grid");
});

//results.ejs
app.post("/grid", async (req, res) => {
    await insertData(req, res);
})

/* Incorrect # args*/
if (process.argv.length != 2) {
    process.stdout.write("Usage pokemaculate.js");
    process.exit(1);
}

app.listen(portNumber)
console.log(`Server started: http://localhost:${portNumber}`);
const prompt = "Type stop to shutdown the server: ";
process.stdout.write(prompt);

process.stdin.setEncoding("utf8"); /* encoding */

process.stdin.on('readable', () => { 
	const dataInput = process.stdin.read();
	if (dataInput !== null) {
		const command = dataInput.trim();
		if (command === "stop") {
			console.log("Shutting down the server");
            process.exit(0); 
        } else {
			console.log(`Invalid command: ${command}`);
		}
    }
    process.stdout.write(prompt);
    process.stdin.resume();
});

/* Functions */
async function insertData(req, res) {
    let {raw, final, grid, pokemon} = req.body;
    data = {
        name: db_name,
        rawTime: raw,
        finalTime: final,
        grid: grid,
        pokemon: pokemon,
        date: getDate()
    };
    const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
    try {
        //Connect and Insert Data
        await client.connect();
        await client.db(leaderboard.db).collection(leaderboard.collection).insertOne(data);
        //Get times for the day
        table = await getTimes(client);
        data.table = table;
        res.render("results", data);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

function getDate() {
    const temp = new Date();
    const day = temp.getDate();
    const month = temp.getMonth() + 1;
    const year = temp.getFullYear();
    return month + "/" + day + "/" + year;
}

async function getTimes(client) {
    let filter = {date: getDate()}
    const result = await client.db(leaderboard.db)
                        .collection(leaderboard.collection)
                        .find(filter)
                        .sort({"rawTime": -1})
                        .toArray();
    let table = "";
    result.forEach(player => {
        table += `<tr><td>${player.name}</td><td>${player.finalTime}</td><tr>`;
    });
    return table;
}