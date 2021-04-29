/**
 * Framework expressjs
 * https://expressjs.com/
 */
const express = require('express')
const app = express()
app.use(express.json())
const port = 3000

/**
 * Read a JSON file and parse it
 */
const fs = require('fs')
const ip_filtering_config_file = fs.readFileSync("ip_filtering_options.json")
const ip_filtering_config = JSON.parse(String(ip_filtering_config_file))


/**
 * Middleware: checks that the ip address matches one of the authorized ones
 * https://github.com/tychovbh/expressjs-ip-control#readme
 */
const access_control = require('express-ip-access-control')
app.use(access_control(ip_filtering_config))

/**
 *
 */
const db_handler = require('./db_querys')


/**
 * ROUTES
 */

/**
 * Get a random channel name according to an activity in a guild.
 */
app.get('/guild/:guild/activity/:activity/random', (req, res) => {
    let guild_id = parseInt(req.params["guild"]);
    let activity = req.params["activity"];
    db_handler.get_voice_channel_name(guild_id, activity)
        .then((voice_channel_name) => {
            res.json(voice_channel_name["channel_name"]);
        }).catch((err) => {
        console.log(err);
    });
});

/**
 * Get list of channel names according to an activity in a guild.
 */
app.get('/guild/:guild/activity/:activity', (req, res) => {
    let guild_id = parseInt(req.params["guild"]);
    let activity = req.params["activity"];
    db_handler.get_voice_channel_names(guild_id, activity)
        .then((voice_channel_names) => {
            res.json(voice_channel_names.map(vc => vc["channel_name"]));
        }).catch((err) => {
            console.log(err);
    });
});

/**
 * Get the list of activities for a guild.
 */
app.get('/guild/:guild/activities', (req, res) => {
    let guild_id = parseInt(req.params["guild"]);
    db_handler.get_activities(guild_id).
        then((activities) => {
            res.json(activities.map(a => a["activity_name"]));
        }).catch((err) => {
            console.log(err);
    });
});

/**
 * Register a new activity for the guild
 */
app.post('/guild/:guild/activity/:activity', (req, res) => {
    let response;
    let guild_id = parseInt(req.params["guild"]);
    let activity = req.params["activity"];
    db_handler.register_activity(guild_id, activity)
        .then(() => {
            response = {status: "Success"}
        })
        .catch((err) => {
            response = {status: "Failure"}
        })
        .finally(() => {
            res.json(JSON.stringify(response));
        });
});

/**
 * Register new channel voice name
 */
app.post('guild/:guild/activity/:activity/:voice_channel_name', (req, res) => {
    let guild_id = parseInt(req.params["guild"]);
    let activity = req.params["activity"];
    let voice_channel_name = req.params["voice_channel_name"]
    res.send("Registering new voice channel name " + voice_channel_name + " for " + activity + " in guild " + guild_id + ".")
});


/**
 * Register new channel voice names
 * block of names
 */



app.listen(port)