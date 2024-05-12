let gridTypes = [[],[]];
window.onload = generateTypes

let timer = null;
let startTime = 0;

let correct = 0;
let pokemon_guessed = [];

async function guess(id) {
    if (!document.querySelector(`#space${id}`).innerHTML.includes('<img')) {
        const pokemon = prompt("Enter Pokemon:");
        const json = await getPokemon(pokemon.toLowerCase());
        if (json != undefined) {
            if (checkPokemon(json, id)) { //Checks if pokemon is right
                const pic = json.sprites.front_default; //Get Pokemon's icon
                document.querySelector(`#space${id}`).innerHTML = `<img src=${pic}>`;
                pokemon_guessed.push(pokemon);
                correct++;
            } else {
                window.alert("Pokemon does not match types");
            }
        }
        if (correct == 9) {
            //Stop Timer
            clearInterval(timer);
            const rawTime = Date.now() - startTime;
            const min = String(Math.floor(rawTime / (1000 * 60) % 60)).padStart(2, "0");
            const sec = String(Math.floor(rawTime / 1000 % 60)).padStart(2, "0");
            const ms = String(Math.floor(rawTime % 1000 / 10)).padStart(2, "0");
            const finalTime = `${min}:${sec}:${ms}`;
            //Input into DB
            document.querySelector("#raw").value = rawTime;
            document.querySelector("#final").value = finalTime;
            document.querySelector("#grid").value = gridTypes;
            document.querySelector("#pokemon").value = pokemon_guessed;
            document.querySelector("#db").submit();
        }
    }
}

async function getPokemon(pokemon) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
        const json = await response.json();
        return json;    
    } catch {
        window.alert("Invalid Pokemon")
    }  
}

/* Checks if inputted pokemon matches the types */
function checkPokemon(pokemon, id) {
    typesArr = [];
    pokemon.types.forEach(entry => typesArr.push(entry.type.name));
    console.log(typesArr);
    switch (id) {
        case 1:
            return checkHelper(0, 0);
        case 2:
            return checkHelper(1, 0);
        case 3:
            return checkHelper(2, 0);
        case 4:
            return checkHelper(0, 1);
        case 5:
            return checkHelper(1, 1);
        case 6:
            return checkHelper(2, 1);
        case 7:
            return checkHelper(0, 2);
        case 8:
            return checkHelper(1, 2);
        case 9:
            return checkHelper(2, 2);
    }
}

function checkHelper(top, left) {
    if (typesArr.includes(gridTypes[0][top]) && typesArr.includes(gridTypes[1][left])) {
        if (typesArr.length == 2 && gridTypes[0][top] == gridTypes[1][left]) {
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }
}

/*Generate the Board*/
function generateTypes() {
    /* Array of all pokemon types */
    const ALL_TYPES = ["bug", "dark", "dragon", "electric", "fairy", "fighting", 
                       "fire", "flying", "ghost", "grass", "ground", "ice",
                       "normal", "poison", "psychic", "rock", "steel", "water"];
    /* Dictionary of Pokemon type combinations that don't exist 'yet'*/
    const mismatches = {
        12: ["rock", "bug", "steel", "ice"], //Normal
        15: ["normal", "ghost"], //Rock
        0: ["normal", "dragon"], //Bug
        16: ["normal"], //Steel
        11: ["normal", "poison", "fire"], //Ice
        13: ["ice"], //Poison
        10: ["fairy"], //Ground
        4: ["ground", "fire"], //Fairy
        8: ["rock"], //Ghost
        2: ["bug"], //Dragon
        6: ["fairy", "ice"] //Fire
    };

    let i = 1;
    while (i < 7) {
        const j = Math.floor(Math.random() * 18);
        if (i < 4) { //Top
            if (gridTypes[0].includes(ALL_TYPES[j])) {
                continue;
            } else {
                gridTypes[0].push(ALL_TYPES[j]);
            }
        } else { //Left
            //Check if they're valid type combos
            if (mismatches[j] && gridTypes[0].some(type => mismatches[j].includes(type)) ||
                gridTypes[1].includes(ALL_TYPES[j])) {
                continue;
            } else {
                gridTypes[1].push(ALL_TYPES[j]);
            }
        }
        document.querySelector(`#label${i}`).innerHTML = `<img src="types/${ALL_TYPES[j]}.png"></img>`;
        i++;
    }
    startTimer();
}

function startTimer() {
    startTime = Date.now();
    timer = setInterval(updateTimer, 10);
}
function updateTimer() {
    const elapsed = Date.now() - startTime;
    const min = String(Math.floor(elapsed / (1000 * 60) % 60)).padStart(2, "0");
    const sec = String(Math.floor(elapsed / 1000 % 60)).padStart(2, "0");
    const ms = String(Math.floor(elapsed % 1000 / 10)).padStart(2, "0");

    document.querySelector("#timer").textContent = `${min}:${sec}:${ms}`;
}


/* 
0 = bug
1 = dark
2 = dragon
3 = electric
4 = fairy
5 = fighting
6 = fire
7 = flying
8 = ghost
9 = grass
10 = ground
11 = ice
12 = normal
13 = poison
14 = psychic
15 = rock
16 = steel
17 = water
*/