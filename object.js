// It is the structure of the object we need to pass in function matchAB

{
    key: number,              // Represents the musical key of the song
    genre: string[],          // Array of genres associated with the song
    artistId: number,         // Unique identifier for the artist
    songId: number,           // Unique identifier for the song
    mode: number,             // Mode of the song (0 = minor, 1 = major)
    danceability: number,     // Danceability score of the song (a number between 0.0 and 1.0)
    energy: number,           // Energy score of the song (a number between 0.0 and 1.0)
    loudness: number,         // Loudness of the song (in dB, typically between -60 and 0)
    speechiness: number,      // Speechiness score of the song (a number between 0.0 and 1.0)
    acousticness: number,     // Acousticness score of the song (a number between 0.0 and 1.0)
    instrumentalness: number, // Instrumentalness score of the song (a number between 0.0 and 1.0)
    valence: number,          // Valence score of the song (a number between 0.0 and 1.0, represents the musical "positiveness")
    tempo: number,            // Tempo of the song in beats per minute (BPM)
    liveness: number          // Liveness score of the song (a number between 0.0 and 1.0, represents how "live" the song feels)
  }
  

  
  //example
  
  let personA = [
    {
      key: 8,
      genre: ["rock", "indie"],
      artistId: 54321,
      songId: 98765,
      mode: 0,
      danceability: 0.55,
      energy: 0.70,
      loudness: -8,
      speechiness: 0.10,
      acousticness: 0.20,
      instrumentalness: 0.05,
      valence: 0.40,
      tempo: 130,
      liveness: 0.50
    },
    // 9 more objects with the same structure
  ];
  
  matchAB(personA, personB);  // Call to the matching algorithm
  
