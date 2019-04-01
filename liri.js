//Include packages
var Spotify = require('node-spotify-api');
var moment = require("moment");
var axios = require("axios");
var fs = require("fs");

//Import api key and secret for Spotify using dotenv
require("dotenv").config();
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);

//Global Variables for the command and search parameter
var command = process.argv[2];
var search = process.argv.slice(3).join(" ");
var movieSearch = false;

//Function to build search URL for axios
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
            logData(error);
        });
}

//Display Movie Info
function displayMovieInfo(response) {
    var movieInfo = {
        title: response.data.Title,
        released: response.data.Year,
        imdbRating: response.data.imdbRating,
        rottenTomatoes: "",
        country: response.data.Country,
        language: response.data.Language,
        plot: response.data.Plot,
        actors: response.data.Actors
    }

    //find rotton tomatoes in response ("Source": "Rotten Tomatoes")
    for (var i = 0; i < response.data.Ratings.length; i++) {
        if (response.data.Ratings[i].Source == "Rotten Tomatoes") {
            movieInfo.rottenTomatoes = response.data.Ratings[i].Value
        }
    }
    console.log(JSON.stringify(movieInfo, null, 2));
    logData(movieInfo);
}

//Display Concert Info
function displayConcertInfo(response) {
    if (response.data.length > 0) {
        var searchMessage = search + " is playing here: "
        console.log(searchMessage);
        var concertInfo = [searchMessage];

        for (var i = 0; i < response.data.length; i++) {

            var concert = "Date: " + moment(response.data[i].datetime).format("MM/DD/YYYY") +
                " Venue: " + response.data[i].venue.name + " - " + response.data[i].venue.city + " " +
                response.data[i].venue.region + " " + response.data[i].venue.country;

            console.log(concert);

            concertInfo.push(concert);
        }
        logData(concertInfo)

    }
    else {
        var noResults = "Sad News - no concerts were found for " + search
        console.log(noResults);
        logData(noResults);
    }
}

//Search spotify for song and display results 
function getSong() {
    spotify.search({ type: 'track', query: search, limit: 1 }, function (err, data) {
        if (err) {
            logData(err)
            return console.log('Error occurred: ' + err);
        }

        var songInfo = {
            artists: [],
            songName: data.tracks.items[0].name,
            previewLink: data.tracks.items[0].preview_url,
            album: data.tracks.items[0].album.name
        }

        //populate the artists for the song
        for (var i = 0; i < data.tracks.items[0].artists.length; i++) {
            songInfo.artists.push(data.tracks.items[0].artists[i].name)
        }

        console.log(JSON.stringify(songInfo, null, 2));
        logData(songInfo);
    });
}

//Log User Input and Result
function logData(results) {
    fs.appendFile("log.txt", " \n" + command + " " + search + " " + JSON.stringify(results, null, 2), function (error) {
        if (error) {
            console.log(error);
        }
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
        search = "Ace of Base The Sign";
    }
    getSong();
}
else if (command === "do-what-it-says") {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            logData(error)
            return console.log("Unable to do what it says")
        }
        var random = data.split(",");
        search = random.slice(1).join(" ");
        search = search.replace(/"/g, "");

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
else {
    var unknownCommand = "Sorry, I don't understand.  Maybe Siri can help you."
    console.log(unknownCommand);
    logData(unknownCommand);
}