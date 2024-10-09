function ArrToMap(arr: (string | number)[]): Map<string | number, number> {
    let maping = new Map<string | number, number>();
    for (let i = 0; i < arr.length; i++) {
        if (maping.get(arr[i]) === undefined) {
            maping.set(arr[i], 1);
        } else {
            maping.set(arr[i], (maping.get(arr[i]) || 0) + 1);
        }
    }
    return maping;
}

interface Person {
    key: string[];
    ArtistId: string[];
    songId: string[];
    mode: number[];
    Danceability: number;
    energy: number;
    loudness: number;
    Speechiness: number;
    Acousticness: number;
    Instrumentalness: number;
    Valence: number;
    tempo: number;
    Liveness: number;
    genre: string[];
}

function compress(person_a: Person[]): Person {
    let tempkey0 = person_a[0].key;                 // key
    person_a[0].key = [];
    person_a[0].key.push(tempkey0[0]);

    let tempArtistId0 = person_a[0].ArtistId;       // artist id
    person_a[0].ArtistId = [];
    person_a[0].ArtistId.push(tempArtistId0[0]);

    let tempsongId0 = person_a[0].songId;           // song id
    person_a[0].songId = [];
    person_a[0].songId.push(tempsongId0[0]);

    let mode = person_a[0].mode[0];                 // mode
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

        person_a[0].key.push(person_a[i].key[0]);                      // adding all keys in 1 array

        person_a[0].genre = person_a[0].genre.concat(person_a[i].genre); // adding all genres in 1 array

        person_a[0].ArtistId.push(person_a[i].ArtistId[0]);            // adding all artist id in 1 array

        person_a[0].songId.push(person_a[i].songId[0]);                // adding all songid in 1 array

        if (person_a[i].mode[0] === 0) person_a[0].mode[0]++;
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

function intersection(a: Map<string | number, number>, b: Map<string | number, number>): number {
    let intersection = 0;
    for (let [key, value] of a) {
        if (b.has(key)) {
            intersection += Math.min(b.get(key) || 0, value);
        }
    }
    return intersection;
}

function union(intersection: number, a: Map<string | number, number>, b: Map<string | number, number>): number {
    let a1 = 0, b1 = 0;
    for (let [key, value] of a) {
        a1 += value;
    }
    for (let [key, value] of b) {
        b1 += value;
    }
    return (a1 + b1 - intersection);
}

function normalizeRange(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
}

function cosineSimilarity(value1: number, value2: number): number {
    if (value1 === 0 && value2 === 0) {
        return 1;
    }
    
    if ((value1 === 0 && value2 !== 0) || (value1 !== 0 && value2 === 0)) {
        const euclideanDistance = Math.abs(value1 - value2);
        return 1 - euclideanDistance;                          
    }
    
    return value1 * value2 / (Math.sqrt(value1 ** 2) * Math.sqrt(value2 ** 2));
}

function FinalScore(scores: Map<string, number>): number {
    let factor70 = 0;
    let factor30 = 0;

    let i = 1;
    scores.forEach((value, key) => {
        if (i <= 3) {
            factor30 += value;
        } else {
            factor70 += value;
        }
        i++;
    });

    factor70 /= 9;
    factor30 /= 3;

    factor70 *= 70;
    factor30 *= 30;

    return (factor30 + factor70);
}

function jaccardianSimilarity(Afactor: Map<string | number, number>, Bfactor: Map<string | number, number>): number {
    let intersect = intersection(Afactor, Bfactor);
    let unio = union(intersect, Afactor, Bfactor);
    return (intersect / unio);
}

function matchAB(personA: Person[], personB: Person[]): number {
    personA = [compress(personA)];
    personB = [compress(personB)];

    let scores = new Map<string, number>();

    scores.set('artistid', jaccardianSimilarity(personA[0].ArtistId, personB[0].ArtistId));
    scores.set('songId', jaccardianSimilarity(personA[0].songId, personB[0].songId));
    scores.set('genre', jaccardianSimilarity(personA[0].genre, personB[0].genre));
    scores.set('key', jaccardianSimilarity(personA[0].key, personB[0].key));

    let intersect = Math.min(personA[0].mode[0], personB[0].mode[0]) + Math.min(personA[0].mode[1], personB[0].mode[1]);
    let unio = personA[0].mode[0] + personB[0].mode[0] + personA[0].mode[1] + personB[0].mode[1] - intersect;
    scores.set('mode', intersect / unio);

    personA[0].tempo = normalizeRange(personA[0].tempo, 50, 200);
    personB[0].tempo = normalizeRange(personB[0].tempo, 50, 200);
    personA[0].loudness = normalizeRange(personA[0].loudness, -60, 0);
    personB[0].loudness = normalizeRange(personB[0].loudness, -60, 0);

    scores.set('Danceability', cosineSimilarity(personA[0].Danceability, personB[0].Danceability));
    scores.set('energy', cosineSimilarity(personA[0].energy, personB[0].energy));
    scores.set('loudness', cosineSimilarity(personA[0].loudness, personB[0].loudness));
    scores.set('Speechiness', cosineSimilarity(personA[0].Speechiness, personB[0].Speechiness));
    scores.set('Acousticness', cosineSimilarity(personA[0].Acousticness, personB[0].Acousticness));
    scores.set('Instrumentalness', cosineSimilarity(personA[0].Instrumentalness, personB[0].Instrumentalness));
    scores.set('Valence', cosineSimilarity(personA[0].Valence, personB[0].Valence));
    scores.set('tempo', cosineSimilarity(personA[0].tempo, personB[0].tempo));
    scores.set('Liveness', cosineSimilarity(personA[0].Liveness, personB[0].Liveness));

    return FinalScore(scores);
}
