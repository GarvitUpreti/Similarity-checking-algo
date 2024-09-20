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

    let tempArtistId0 = person_a[0].ArtistId;       // artist id
    person_a[0].ArtistId = [];
    person_a[0].ArtistId.push(tempArtistId0);

    let tempsongId0 = person_a[0].songId;           // song id
    person_a[0].songId = [];
    person_a[0].songId.push(tempsongId0);

    let mode = person_a[0].mode;                    // mode
    person_a[0].mode = [0, 0];
    if (mode === 0) person_a[0].mode[0]++;
    else person_a[0].mode[1]++;

    for (let i = 1; i < 10; i++) {
        person_a[0].Danceability += person_a[i].Danceability;
        person_a[0].energy += person_a[i].energy;
        person_a[0].loudness += person_a[i].loudness;
        person_a[0].Speechiness += person_a[i].Speechiness;
        person_a[0].Acousticness += person_a[i].Acousticness;
        person_a[0].Instrumentalness += person_a[i].Instrumentalness;
        person_a[0].Valence += person_a[i].Valence;
        person_a[0].tempo += person_a[i].tempo;
        person_a[0].Liveness += person_a[i].Liveness;

        person_a[0].key.push(person_a[i].key);                              // adding all keys in 1 array

        person_a[0].genre = person_a[0].genre.concat(person_a[i].genre);    // adding all genres in 1 array

        person_a[0].ArtistId.push(person_a[i].ArtistId);                    // adding all artist id in 1 array

        person_a[0].songId.push(person_a[i].songId);                        // adding all songid in 1 array

        if (person_a[i].mode === 0) person_a[0].mode[0]++;
        else person_a[0].mode[1]++;
    }

    // Averaging values
    person_a[0].Danceability /= 10;
    person_a[0].energy /= 10;
    person_a[0].loudness /= 10;
    person_a[0].Speechiness /= 10;
    person_a[0].Acousticness /= 10;
    person_a[0].Instrumentalness /= 10;
    person_a[0].Valence /= 10;
    person_a[0].tempo /= 10;
    person_a[0].Liveness /= 10;

    // Convert arrays to maps
    person_a[0].key = ArrToMap(person_a[0].key);
    person_a[0].genre = ArrToMap(person_a[0].genre);
    person_a[0].ArtistId = ArrToMap(person_a[0].ArtistId);
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

    scores.set('artistid', jaccardianSimilarity(personA.ArtistId, personB.ArtistId)); 

    scores.set('songId', jaccardianSimilarity(personA.songId, personB.songId));

    scores.set('songId', jaccardianSimilarity(personA.genere, personB.genere));

    scores.set('songId', jaccardianSimilarity(personA.key, personB.key));


    intersect = Math.min(personA.mode[0], personB.mode[0]) + Math.min(personA.mode[1], personB.mode[1]);
    unio = personA.mode[0] + personB.mode[0] + personA.mode[1] + personB.mode[1] - intersect;
    scores.set('mode', intersect / unio);

    personA.tempo = normalizeRange(personA.tempo, 50, 200);
    personB.tempo = normalizeRange(personB.tempo, 50, 200);
    personA.loudness = normalizeRange(personA.loudness, -60, 0);
    personB.loudness = normalizeRange(personB.loudness, -60, 0);

    scores.set('Danceability', cosineSimilarity(personA.Danceability, personB.Danceability));
    scores.set('energy', cosineSimilarity(personA.energy, personB.energy));
    scores.set('loudness', cosineSimilarity(personA.loudness, personB.loudness));
    scores.set('Speechiness', cosineSimilarity(personA.Speechiness, personB.Speechiness));
    scores.set('Acousticness', cosineSimilarity(personA.Acousticness, personB.Acousticness));
    scores.set('Instrumentalness', cosineSimilarity(personA.Instrumentalness, personB.Instrumentalness));
    scores.set('Valence', cosineSimilarity(personA.Valence, personB.Valence));
    scores.set('tempo', cosineSimilarity(personA.tempo, personB.tempo));
    scores.set('Liveness', cosineSimilarity(personA.Liveness, personB.Liveness));

    return FinalScore(scores);     // the final matching result in percentage
}
