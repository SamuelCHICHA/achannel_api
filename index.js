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
app.get('/guild/:guild/activity/:activity/random-channel-name', (req, res) => {
    let guild_id = parseInt(req.params["guild"]);
    let activity = req.params["activity"];
    db_handler.get_voice_channel_name(guild_id, activity)
        .then(response => res.json(response))
        .catch(response => res.json(response));
});

/**
 * Get list of channel names according to an activity in a guild.
 */
app.get('/guild/:guild/activity/:activity/channel-names', (req, res) => {
    let guild_id = parseInt(req.params["guild"]);
    let activity = req.params["activity"];
    db_handler.get_voice_channel_names(guild_id, activity)
        .then(response => res.json(response))
        .catch(response => res.json(response));
});

/**
 * Get the list of activities for a guild.
 */
app.get('/guild/:guild/activities', (req, res) => {
    let guild_id = parseInt(req.params["guild"]);
    db_handler.get_activities(guild_id)
        .then(response => res.json(response))
        .catch(response => res.json(response));
});

/**
 * Register new activities for the guild
 */
app.post('/guild/:guild/register-activity', (req, res) => {
    let guild_id = parseInt(req.params["guild"]);
    let activities = req.body["activities"];
    db_handler.register_activities(guild_id, activities)
        .then(response => {
            console.log(response)
            res.json(response)
        })
        .catch(response => {
            console.log(response)
            res.json(response)
        });
});

/**
 * Register new channel voice names
 */
app.post("/guild/:guild/activity/:activity/register-channel-name", (req, res) => {
    let guild_id = parseInt(req.params["guild"]);
    let activity = req.params["activity"];
    let voice_channel_names = req.body["channel_names"];
    db_handler.register_channel_names(guild_id, activity, voice_channel_names)
        .then(response => res.json(response))
        .catch(response => res.json(response));
});

/**
 * Register new guild
 */
app.post("/register-guild", (req, res) => {
   let guild_id = parseInt(req.body["guild_id"]);
    db_handler.register_guild(guild_id)
        .then(response => res.json(response))
        .catch(response => res.json(response));
});

/**
 * Delete a guild
 */
app.post("/delete-guild", (req, res) => {
    let guild_id = parseInt(req.body["guild_id"]);
    db_handler.delete_guild(guild_id)
        .then(response => res.json(response))
        .catch(response => res.json(response));
});

/**
 * Remove an activity from a guild
 */
app.post("/guild/:guild/delete-activities", (req, res) => {
    let guild_id = parseInt(req.params["guild"]);
    let activity = req.body["activities"];
    db_handler.delete_activities(guild_id, activity)
        .then(response => res.json(response))
        .catch(response => res.json(response));
});

app.listen(port)