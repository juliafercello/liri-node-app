//include packages
var Spotify = require('node-spotify-api');
var moment = require("moment");
var axios = require("axios"); 
var fs = require("fs");

//Import Keys for Spotify using dotenv
require("dotenv").config();
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);

//Global Vars for the command and search parameter
var command = process.argv[2]; 
var search = process.argv.slice(3).join(" ");

//"Movie This"
if (command === "movie-this") {
    if (!search){
        search = "Mr. Nobody"
    }
   var queryUrl = "http://www.omdbapi.com/?t=" + search + "&y=&plot=short&apikey=trilogy"; 
   axios.get(queryUrl)
   .then(function (response) {
    console.log("Title: " + JSON.stringify(response.data.Title, null, 2));
    console.log("Released: " + JSON.stringify(response.data.Year, null, 2));
    console.log("IMDB Rating: " + JSON.stringify(response.data.imdbRating, null, 2));

    //Find rotten tomatoes better
    console.log("Rotten Tomatoes: " + JSON.stringify(response.data.Ratings[1].Value, null, 2));
    console.log("Country: " + JSON.stringify(response.data.Country, null, 2));
    console.log("Language: " + JSON.stringify(response.data.Language, null, 2));
    console.log("Plot: " + JSON.stringify(response.data.Plot, null, 2));
    console.log("Actors: " + JSON.stringify(response.data.Actors, null, 2));
   })
   .catch(function (error) {
     console.log(error);
   });
}

// concert-this
// "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp"
// Name of the venue
// Venue location
// Date of the Event (use moment to format this as "MM/DD/YYYY")

// spotify-this-song
// Artist(s)
// The song's name
// A preview link of the song from Spotify
// The album that the song is from
// If no song is provided then your program will default to "The Sign" by Ace of Base.

// do-what-it-says
// Using the fs Node package, LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands.
// It should run spotify-this-song for "I Want it That Way," as follows the text in random.txt.
// Edit the text in random.txt to test out the feature for movie-this and concert-this.

// Bonus
// In addition to logging the data to your terminal/bash window, output the data to a .txt file called log.txt.
// Make sure you append each command you run to the log.txt file.
// Do not overwrite your file each time you run a command.