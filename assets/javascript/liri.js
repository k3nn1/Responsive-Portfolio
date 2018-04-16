require("dotenv").config();
var keys = require("./keys.js");
var fs = require("fs");
var Twitter = require("twitter");
var spotify = require("spotify");
var request = require("request");
var prompt = require("prompt");
var colors = require("colors/safe");

//----------For user inputs----------------------------
var userInput = "";
var userSelection = "";

// //----------user options-------------------
var myTweets = "myTweets";
var spotifySong = "spotifySong";
var movieThis = "movieThis";
var doWhatItSays = "do-what-it-says";

//---------setting up the prompts-----------------------
prompt.message = colors.grey.bold("Type in one of the commands: myTweets, spotifySong, movieThis, do-what-it-says");
prompt.delimiter = colors.green("\n");

prompt.start();
prompt.get({
    properties: {
        userInput: {
            description: colors.blue("Type a command")
        }
    }
}, function(err, result) {
        userInput = result.userInput;
        if (userInput === myTweets) {
            // console.log("User Input: "+userInput)
            myTwitter();
        } else if (userInput === spotifySong) {
            prompt.get({properties: {userSelection: {description: colors.blue("Search for a song?")}}
            }, function (err, result) {
                if (result.userSelection === "") {
                    userSelection = "Poker Face";
                } else {
                    userSelection = result.userInput;
                }
                mySpotify();
            });
        } else if (userInput === movieThis) {
            prompt.get({properties: {userSelection: {description: colors.blue("Search a movie title?")}}
            }, function(err, result) {
                if (result.userSelection === "") {
                    userSelection = "Terminator";
                }
                else {
                userSelection = result.userSelection;
                }
                myMovies(userSelection);
            });
        } else if (userInput === doWhatItSays) {
            doWhadeedee();
        };
    }
);
// ---------Twitter Function-------------------
function myTwitter() {
    var client = new Twitter(keys.twitter);
    // console.log("Client: " + client)

    var params = {user_name: "scroopops", count: 20};
    // console.log("Params: " + params)
    
    client.get("statuses/user_timeline", params, function(error, tweets, response) {
        if(!error) {
            for (var i = 0; i < tweets.length; i++) {
                    var tweetInfo = 
                        colors.green("created: ") + tweets[i].created_at + "\n" +
                        colors.green("Tweets: ") + tweets[i].text + "\n" +
                        colors.green("---------------------------------------\n");
                    
                    console.log(tweetInfo);
            };
        } else {
            console.log("Error: " + error); 
            // console.log("TWITTER: " + Twitter);
            return;
        }
    });
};

// -------------Spotify Function-----------------------
function mySpotify(userSelection) {
    spotify.search({type: "track", query: userSelection}, function(err, data) {
        if (err) {
            console.log("ERROR: " + err);
            return;
        }
        var song = data.tracks.items;
        for (var i = 0; i < song.length; i++) {
            var songInfo = 
                colors.blue("Artist: ") + song[i].artists[0].name + "\n" +
                colors.blue("Song Name: ") + song[i].name + "\n" +
                colors.blue("A preview link of the song from Spotify: ") + song[i].preview_url + "\n" +
                colors.blue("The album that the song is from: ") + song[i].album.name + "\n" +
                colors.blue("-----------------------------------------------------\n");

            console.log(songInfo);
        }
    });
};

// ----------------OMBD function ------------------
function myMovies(title) {
    
    var url = "http://www.omdbapi.com/?t=" + title + "&y=&plot=short&apikey=trilogy&r=json";
    request(url, function(error, response, body) {
        if (!error && response.statusCode ===200) {
            var movieJSON = JSON.parse(body);
            
            var movieInfo = 
                colors.yellow("Title: ") + movieJSON.Title + "\n" +
                colors.yellow("Year: ") + movieJSON.Year + "\n" +
                colors.yellow("IMBD Rating: ") + movieJSON.imbdRating + "\n" +
                colors.yellow("Rotten Tomatoes Rating: ") + movieJSON.tomatoRating + "\n" +
                colors.yellow("Country: ") + movieJSON.Country + "\n" +
                colors.yellow("Language: ") + movieJSON.Language + "\n" +
                colors.yellow("Plot: ") + movieJSON.Plot + "\n" +
                colors.yellow("Actors: ") + movieJSON.Actors + "\n" +
                colors.yellow("-----------------------------------------------------\n");
            
            console.log(movieInfo);
        };
    });    
};

// ----------------do what it says -------------------------
//----------- reading from .txtfile ------------------------
function doWhadeedee() {
    fs.readFile("random.txt", "utf8", function (err, data) {
        var text = data.split(",");
        console.log(text);
        mySpotify(text[1]);
    })
}

