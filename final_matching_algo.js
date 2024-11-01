function ArrToMap(arr) {
    let maping = new Map();
    for (let i = 0; i < arr.length; i++) {
        if (maping.get(arr[i]) === undefined) {
            maping.set(arr[i], 1);
        } else {
            maping.set(arr[i], maping.get(arr[i]) + 1);
        }
    }
    return maping;
}

function compress(person_a) {

    let tempkey0 = person_a[0].key;                 // key
    person_a[0].key = [];
    person_a[0].key.push(tempkey0);

    let tempartistId0 = person_a[0].artistId;       // artist id
    person_a[0].artistId = [];
    person_a[0].artistId.push(tempartistId0);

    let tempsongId0 = person_a[0].songId;           // song id
    person_a[0].songId = [];
    person_a[0].songId.push(tempsongId0);

    let mode = person_a[0].mode;                    // mode
    person_a[0].mode = [0, 0];
    if (mode === 0) person_a[0].mode[0]++;
    else person_a[0].mode[1]++;

    for (let i = 1; i < 10; i++) {
        person_a[0].danceability += person_a[i].danceability;
        person_a[0].energy += person_a[i].energy;
        person_a[0].loudness += person_a[i].loudness;
        person_a[0].speechiness += person_a[i].speechiness;
        person_a[0].acousticness += person_a[i].acousticness;
        person_a[0].instrumentalness += person_a[i].instrumentalness;
        person_a[0].valence += person_a[i].valence;
        person_a[0].tempo += person_a[i].tempo;
        person_a[0].liveness += person_a[i].liveness;

        person_a[0].key.push(person_a[i].key);                              // adding all keys in 1 array

        person_a[0].genre = person_a[0].genre.concat(person_a[i].genre);    // adding all genres in 1 array

        person_a[0].artistId.push(person_a[i].artistId);                    // adding all artist id in 1 array

        person_a[0].songId.push(person_a[i].songId);                        // adding all songid in 1 array

        if (person_a[i].mode === 0) person_a[0].mode[0]++;
        else person_a[0].mode[1]++;
    }

    // Averaging values
    person_a[0].danceability /= 10;
    person_a[0].energy /= 10;
    person_a[0].loudness /= 10;
    person_a[0].speechiness /= 10;
    person_a[0].acousticness /= 10;
    person_a[0].instrumentalness /= 10;
    person_a[0].valence /= 10;
    person_a[0].tempo /= 10;
    person_a[0].liveness /= 10;

    // Convert arrays to maps
    // console.log("key")
    person_a[0].key = ArrToMap(person_a[0].key);
    // console.log("genre")
    person_a[0].genre = ArrToMap(person_a[0].genre);
    // console.log("artistId")
    person_a[0].artistId = ArrToMap(person_a[0].artistId);
    // console.log("songId")
    person_a[0].songId = ArrToMap(person_a[0].songId);

    return person_a[0];         // Return the compressed object
}

function intersection(a, b) {                        // finding the intersection between two maps 
  
    let intersection = 0;
    for (let [key, value] of a) {
        if (b.has(key)) {
            intersection += Math.min(b.get(key), value);
        }
    }
    return intersection;
}

function union(intersection, a, b) {                // finding union between two maps
    let a1 = 0, b1 = 0;

    for (let [key, value] of a) {
        a1 += value;
    }
    for (let [key, value] of b) {
        b1 += value;
    }
    return (a1 + b1 - intersection);
}

// Normalize Tempo (range: 50 BPM to 200 BPM)
// Normalize Loudness (range: -60 dB to 0 dB)
function normalizeRange(value, min, max) {
    return (value - min) / (max - min);           
}

// Function to calculate cosine similarity between two scalar values (range: 0.0 to 1.0)
function cosineSimilarity(value1, value2) {
    if (value1 === 0 && value2 === 0) {
        return 1;
    }
    // If one value is zero and the other is non-zero, use Euclidean logic
    
    if ((value1 === 0 && value2 !== 0) || (value1 !== 0 && value2 === 0)) {
        const euclideanDistance = Math.abs(value1 - value2);
        return 1 - euclideanDistance;                          // Similarity score based on distance
    }
    
    return value1 * value2 / (Math.sqrt(value1 ** 2) * Math.sqrt(value2 ** 2));
}

function FinalScore(scores) {
    let factor70 = 0;           // audio features score
    let factor30 = 0;           // rest of the factors score 

    let i = 1;
    scores.forEach((value, key) => {
        if (i <= 3) {
            factor30 += value;
        } else {
            factor70 += value;
        }
        i++;
    });

    factor70 /= 9;                 // there are 9 audio features
    factor30 /= 3;                  // taking the average of rest of the factors

    factor70 *= 70;                 // giving 70 percent weightage to the audio features 
    factor30 *= 30;                 // giving 30 percent weightage to the rest of the factors 

    return (factor30 + factor70);    // the final matching score in %
}

function jaccardianSimilarity(Afactor , Bfactor){
    let intersect = intersection(Afactor, Bfactor);    //using jacardian similarity
    let unio = union(intersect, Afactor, Bfactor);  
    return ( intersect / unio); 
}

function matchAB(personA, personB) {
    personA = compress(personA);
    personB = compress(personB);

    let scores = new Map();                   //  map for storing the final similarity score of every factor

    // calculating similarity for categotial data through jacardian algorithm

    scores.set('artistId', jaccardianSimilarity(personA.artistId, personB.artistId)); 

    scores.set('songId', jaccardianSimilarity(personA.songId, personB.songId));

    scores.set('key', jaccardianSimilarity(personA.key, personB.key));

    scores.set('genre', jaccardianSimilarity(personA.genre, personB.genre));

   


    intersect = Math.min(personA.mode[0], personB.mode[0]) + Math.min(personA.mode[1], personB.mode[1]);
    unio = personA.mode[0] + personB.mode[0] + personA.mode[1] + personB.mode[1] - intersect;
    scores.set('mode', intersect / unio);

    personA.tempo = normalizeRange(personA.tempo, 50, 200);
    personB.tempo = normalizeRange(personB.tempo, 50, 200);
    personA.loudness = normalizeRange(personA.loudness, -60, 0);
    personB.loudness = normalizeRange(personB.loudness, -60, 0);

    scores.set('danceability', cosineSimilarity(personA.danceability, personB.danceability));
    scores.set('energy', cosineSimilarity(personA.energy, personB.energy));
    scores.set('loudness', cosineSimilarity(personA.loudness, personB.loudness));
    scores.set('speechiness', cosineSimilarity(personA.speechiness, personB.speechiness));
    scores.set('acousticness', cosineSimilarity(personA.acousticness, personB.acousticness));
    scores.set('instrumentalness', cosineSimilarity(personA.instrumentalness, personB.instrumentalness));
    scores.set('valence', cosineSimilarity(personA.valence, personB.valence));
    scores.set('tempo', cosineSimilarity(personA.tempo, personB.tempo));
    scores.set('liveness', cosineSimilarity(personA.liveness, personB.liveness));

    return FinalScore(scores);     // the final matching result in percentage
}

class Song {
    constructor(
        key, artistId, songId, mode,
        danceability, energy, loudness, speechiness,
        acousticness, instrumentalness, valence,
        tempo, liveness, genre
    ) {
        this.key = key;
        this.artistId = artistId;
        this.songId = songId;
        this.mode = mode;
        this.danceability = danceability;
        this.energy = energy;
        this.loudness = loudness;
        this.speechiness = speechiness;
        this.acousticness = acousticness;
        this.instrumentalness = instrumentalness;
        this.valence = valence;
        this.tempo = tempo;
        this.liveness = liveness;
        this.genre = genre;
    }
}


// Create sample Song instances for personA
const songA1 = new Song('c', '2', '10', 0, 0.7, 0.6, -10, 0.04, 0.2, 0.0, 0.5, 120, 0.3, ['pop', 'rock']);
const songA2 = new Song('c', '1', '11', 1, 0.75, 0.7, -12, 0.05, 0.25, 0.0, 0.6, 115, 0.4, ['pop', 'jazz']);
const songA3 = new Song('c', '1', '12', 0, 0.5, 0.8, -8, 0.03, 0.15, 0.1, 0.5, 110, 0.2, ['jazz', 'rock']);
const songA4 = new Song('c', '2', '12', 1, 0.8, 0.85, -11, 0.06, 0.1, 0.0, 0.7, 130, 0.5, ['classical', 'pop']);
const songA5 = new Song('f', '1', '14', 0, 0.72, 0.65, -9, 0.07, 0.05, 0.0, 0.4, 140, 0.45, ['rock', 'pop']);
const songA6 = new Song('c', '5', '15', 1, 0.55, 0.6, -7, 0.1, 0.2, 0.05, 0.6, 95, 0.6, ['pop', 'electronic']);
const songA7 = new Song('c', '5', '16', 0, 0.68, 0.75, -6, 0.08, 0.18, 0.0, 0.5, 105, 0.7, ['hip-hop', 'pop']);
const songA8 = new Song('d', '1', '17', 1, 0.6, 0.7, -5, 0.12, 0.14, 0.0, 0.45, 112, 0.55, ['jazz', 'electronic']);
const songA9 = new Song('f', '8', '18', 0, 0.73, 0.9, -15, 0.04, 0.08, 0.0, 0.5, 118, 0.6, ['rock', 'country']);
const songA10 = new Song('c', '1', '19', 1, 0.62, 0.55, -13, 0.09, 0.2, 0.0, 0.48, 123, 0.4, ['electronic', 'pop']);

// Create sample Song instances for personB
const songB1 = new Song('D', '2', '12', 1, 0.65, 0.5, -15, 0.03, 0.3, 0.0, 0.4, 130, 0.35, ['rock', 'blues']);
const songB2 = new Song('E', '3', '13', 0, 0.68, 0.6, -14, 0.02, 0.27, 0.0, 0.45, 125, 0.3, ['rock', 'classical']);
const songB3 = new Song('f', '3', '20', 1, 0.67, 0.82, -9, 0.05, 0.13, 0.0, 0.52, 127, 0.35, ['pop', 'hip-hop']);
const songB4 = new Song('G', '4', '21', 0, 0.71, 0.6, -12, 0.02, 0.1, 0.0, 0.6, 134, 0.45, ['jazz', 'rock']);
const songB5 = new Song('f', '5', '22', 1, 0.8, 0.75, -10, 0.07, 0.12, 0.1, 0.55, 128, 0.3, ['electronic', 'pop']);
const songB6 = new Song('I', '6', '23', 0, 0.75, 0.65, -11, 0.03, 0.2, 0.0, 0.5, 120, 0.6, ['hip-hop', 'jazz']);
const songB7 = new Song('J', '7', '24', 1, 0.7, 0.85, -14, 0.1, 0.1, 0.0, 0.4, 115, 0.5, ['rock', 'pop']);
const songB8 = new Song('L', '8', '25', 0, 0.63, 0.7, -10, 0.08, 0.16, 0.05, 0.6, 122, 0.4, ['pop', 'jazz']);
const songB9 = new Song('L', '9', '26', 1, 0.77, 0.9, -8, 0.06, 0.09, 0.0, 0.45, 137, 0.3, ['country', 'rock']);
const songB10 = new Song('M', '10', '27', 0, 0.66, 0.58, -7, 0.04, 0.18, 0.0, 0.5, 130, 0.6, ['jazz', 'electronic']);

// Initializing personA with songA1 to songA10
const personA = [songA1, songA2, songA3, songA4, songA5, songA6, songA7, songA8, songA9, songA10];

// Initializing personB with songB1 to songB10
const personB = [songB1, songB2, songB3, songB4, songB5, songB6, songB7, songB8, songB9, songB10];


// Assuming matchAB is defined elsewhere in your code
let originalNumber = matchAB(personA, personB);

// Round to two decimal places
let roundedNumber = parseFloat(originalNumber.toFixed(2));

console.log(roundedNumber); 
