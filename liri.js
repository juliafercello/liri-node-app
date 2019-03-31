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
var movieSearch = false;

//function to build search URL
function buildSearchURL() {
    if (movieSearch) {
        var queryUrl = "http://www.omdbapi.com/?t=" + search + "&y=&plot=short&apikey=trilogy";
    }
    else {
        var queryUrl = "https://rest.bandsintown.com/artists/" + search + "/events?app_id=codingbootcamp";
    }
    getResults(queryUrl);
}

//Function using Axios to GET movies and concerts
function getResults(queryUrl) {
    axios.get(queryUrl)
        .then(function (response) {
            if (movieSearch) {
                displayMovieInfo(response)
            }
            else {
                displayConcertInfo(response);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

//Display Movie Info
function displayMovieInfo(response) {
    console.log("Title: " + JSON.stringify(response.data.Title, null, 2));
    console.log("Released: " + JSON.stringify(response.data.Year, null, 2));
    console.log("IMDB Rating: " + JSON.stringify(response.data.imdbRating, null, 2));
    //Find rotten tomatoes better
    console.log("Rotten Tomatoes: " + JSON.stringify(response.data.Ratings[1].Value, null, 2));
    console.log("Country: " + JSON.stringify(response.data.Country, null, 2));
    console.log("Language: " + JSON.stringify(response.data.Language, null, 2));
    console.log("Plot: " + JSON.stringify(response.data.Plot, null, 2));
    console.log("Actors: " + JSON.stringify(response.data.Actors, null, 2));
}

//Display Concert Info
function displayConcertInfo(response) {
    if (response.data.length > 0) {
        console.log(search + " is playing here: ");
        console.log("*****************************************************")
        for (var i = 0; i < response.data.length; i++) {
            console.log("Date: " + moment(response.data[i].datetime).format("MM/DD/YYYY") +
                "\nVenue: " + response.data[i].venue.name + " \nLocation: " + response.data[i].venue.city + " " +
                response.data[i].venue.region + " " + response.data[i].venue.country)
            console.log("*****************************************************")
        }
    }
    else {
        console.log("Sad News - no concerts were found for " + search);
    }
}

//Search spotify for song and display results 
function getSong() {
    spotify.search({ type: 'track', query: search, limit: 1 }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        console.log("Artists: " + data.tracks.items[0].artists[0].name); //DO THIS BETTER
        console.log("Song Name: " + data.tracks.items[0].name);
        console.log("Preview Link: " + data.tracks.items[0].preview_url);
        console.log("Album: " + data.tracks.items[0].album.name);
    });
}

//Evaluate user input and search for applicable movie, band, or song.
if (command === "movie-this") {
    if (!search) {
        search = "Mr. Nobody"
    }
    movieSearch = true;
    buildSearchURL();
}
else if (command === "concert-this") {
    if (!search) {
        search = "NKOTB"
    }
    buildSearchURL();
}
else if (command === "spotify-this-song") {
    if (!search) {
        search = "The Sign";
    }
    getSong();
}
else if (command === "do-what-it-says") {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log("Unable to do what it says")
        }
        var random = data.split(",");
        search = random.slice(1).join(" ");
        search = search.replace(/"/g,"");

        if (random[0] === "movie-this") {
            movieSearch = true;
            buildSearchURL();
        }
        else if (random[0] === "concert-this") {
            buildSearchURL();
        }
        else {
            getSong();
        }
    });
}

// Bonus
// In addition to logging the data to your terminal/bash window, output the data to a .txt file called log.txt.
// Make sure you append each command you run to the log.txt file.
// Do not overwrite your file each time you run a command.