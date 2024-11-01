type MapType = Map<string | number, number>;

class Song {
    key: string;
    artistId: string;
    songId: string;
    mode: number;
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

    constructor(
        key: string, artistId: string, songId: string, mode: number,
        Danceability: number, energy: number, loudness: number, Speechiness: number,
        Acousticness: number, Instrumentalness: number, Valence: number,
        tempo: number, Liveness: number, genre: string[]
    ) {
        this.key = key;
        this.artistId = artistId;
        this.songId = songId;
        this.mode = mode;
        this.Danceability = Danceability;
        this.energy = energy;
        this.loudness = loudness;
        this.Speechiness = Speechiness;
        this.Acousticness = Acousticness;
        this.Instrumentalness = Instrumentalness;
        this.Valence = Valence;
        this.tempo = tempo;
        this.Liveness = Liveness;
        this.genre = genre;
    }
}

function ArrToMap(arr: (string | number)[]): MapType {
    const mapping = new Map<string | number, number>();
    arr.forEach(item => {
        mapping.set(item, (mapping.get(item) || 0) + 1);
    });
    return mapping;
}

// Use "any" for compressed object to avoid excessive rewriting
function compress(person_a: Song[]): any {
    const firstSong = person_a[0];
    const compressed: any = { ...firstSong };

    compressed.key = [firstSong.key];
    compressed.artistId = [firstSong.artistId];
    compressed.songId = [firstSong.songId];
    compressed.mode = [0, 0];
    if (firstSong.mode === 0) compressed.mode[0]++;
    else compressed.mode[1]++;

    for (let i = 1; i < person_a.length; i++) {
        compressed.Danceability += person_a[i].Danceability;
        compressed.energy += person_a[i].energy;
        compressed.loudness += person_a[i].loudness;
        compressed.Speechiness += person_a[i].Speechiness;
        compressed.Acousticness += person_a[i].Acousticness;
        compressed.Instrumentalness += person_a[i].Instrumentalness;
        compressed.Valence += person_a[i].Valence;
        compressed.tempo += person_a[i].tempo;
        compressed.Liveness += person_a[i].Liveness;

        compressed.key.push(person_a[i].key);
        compressed.genre = compressed.genre.concat(person_a[i].genre);
        compressed.artistId.push(person_a[i].artistId);
        compressed.songId.push(person_a[i].songId);

        if (person_a[i].mode === 0) compressed.mode[0]++;
        else compressed.mode[1]++;
    }

    // Averaging values
    compressed.Danceability /= person_a.length;
    compressed.energy /= person_a.length;
    compressed.loudness /= person_a.length;
    compressed.Speechiness /= person_a.length;
    compressed.Acousticness /= person_a.length;
    compressed.Instrumentalness /= person_a.length;
    compressed.Valence /= person_a.length;
    compressed.tempo /= person_a.length;
    compressed.Liveness /= person_a.length;

    // Convert arrays to maps using type assertions
    compressed.key = ArrToMap(compressed.key as (string | number)[]);
    compressed.genre = ArrToMap(compressed.genre as (string | number)[]);
    compressed.artistId = ArrToMap(compressed.artistId as (string | number)[]);
    compressed.songId = ArrToMap(compressed.songId as (string | number)[]);

    return compressed;
}

function intersection(a: MapType, b: MapType): number {
    let intersect = 0;
    for (const [key, value] of a) {
        if (b.has(key)) {
            intersect += Math.min(b.get(key)!, value);
        }
    }
    return intersect;
}

function union(intersect: number, a: MapType, b: MapType): number {
    let sumA = 0;
    let sumB = 0;

    for (const [, value] of a) sumA += value;
    for (const [, value] of b) sumB += value;

    return sumA + sumB - intersect;
}

function normalizeRange(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
}

function cosineSimilarity(value1: number, value2: number): number {
    if (value1 === 0 && value2 === 0) return 1;
    if ((value1 === 0 && value2 !== 0) || (value1 !== 0 && value2 === 0)) {
        const euclideanDistance = Math.abs(value1 - value2);
        return 1 - euclideanDistance;
    }
    return (value1 * value2) / (Math.sqrt(value1 ** 2) * Math.sqrt(value2 ** 2));
}

function FinalScore(scores: Map<string, number>): number {
    let factor70 = 0;
    let factor30 = 0;
    let i = 1;

    scores.forEach((value) => {
        if (i <= 3) factor30 += value;
        else factor70 += value;
        i++;
    });

    factor70 /= 9;
    factor30 /= 3;

    return (factor70 * 70) + (factor30 * 30);
}

function jaccardianSimilarity(Afactor: MapType, Bfactor: MapType): number {
    const intersect = intersection(Afactor, Bfactor);
    const unio = union(intersect, Afactor, Bfactor);
    return intersect / unio;
}

function matchAB(personA: Song[], personB: Song[]): number {
    const compressedA = compress(personA);
    const compressedB = compress(personB);

    const scores = new Map<string, number>();

    // Type assertion for compatibility with jaccardianSimilarity
    scores.set('artistId', jaccardianSimilarity(compressedA.artistId as MapType, compressedB.artistId as MapType));
    scores.set('songId', jaccardianSimilarity(compressedA.songId as MapType, compressedB.songId as MapType));
    scores.set('key', jaccardianSimilarity(compressedA.key as MapType, compressedB.key as MapType));
    scores.set('genre', jaccardianSimilarity(compressedA.genre as MapType, compressedB.genre as MapType));

    const intersect = Math.min(compressedA.mode[0], compressedB.mode[0]) + Math.min(compressedA.mode[1], compressedB.mode[1]);
    const unio = compressedA.mode[0] + compressedB.mode[0] + compressedA.mode[1] + compressedB.mode[1] - intersect;
    scores.set('mode', intersect / unio);

    compressedA.tempo = normalizeRange(compressedA.tempo, 50, 200);
    compressedB.tempo = normalizeRange(compressedB.tempo, 50, 200);
    compressedA.loudness = normalizeRange(compressedA.loudness, -60, 0);
    compressedB.loudness = normalizeRange(compressedB.loudness, -60, 0);

    scores.set('Danceability', cosineSimilarity(compressedA.Danceability, compressedB.Danceability));
    scores.set('energy', cosineSimilarity(compressedA.energy, compressedB.energy));
    scores.set('loudness', cosineSimilarity(compressedA.loudness, compressedB.loudness));
    scores.set('Speechiness', cosineSimilarity(compressedA.Speechiness, compressedB.Speechiness));
    scores.set('Acousticness', cosineSimilarity(compressedA.Acousticness, compressedB.Acousticness));
    scores.set('Instrumentalness', cosineSimilarity(compressedA.Instrumentalness, compressedB.Instrumentalness));
    scores.set('Valence', cosineSimilarity(compressedA.Valence, compressedB.Valence));
    scores.set('tempo', cosineSimilarity(compressedA.tempo, compressedB.tempo));
    scores.set('Liveness', cosineSimilarity(compressedA.Liveness, compressedB.Liveness));


    let originalNumber: number = FinalScore(scores);

    // Round to two decimal places
    let roundedNumber: number = parseFloat(originalNumber.toFixed(2));

    return roundedNumber;
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
let originalNumber: number = matchAB(personA, personB);

// Round to two decimal places
let roundedNumber: number = parseFloat(originalNumber.toFixed(2));

console.log(roundedNumber); 

