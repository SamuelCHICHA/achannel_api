/**
 * Handles the communication with the database
 * https://mariadb.com/kb/en/getting-started-with-the-nodejs-connector/
 */
const mariadb = require('mariadb')
require('dotenv').config()
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

/**
 * Let's define code for the response
 * 0 => Everything's good
 * 1 => Database error
 * 2 => No match (case of selection)
 * 3 => Unknown
 * 4 =>
 */

async function get_activities (guild_id){
    let response = {};
    guild_id = parseInt(guild_id)
    if(isNaN(guild_id))
        throw new TypeError(`The guild id given couldn't be converted into an integer. guild_id: ${guild_id}.`);
    await pool.query("SELECT name FROM Activities WHERE guild_id=?", [guild_id])
        .then(dbr => {
            response.content = dbr.slice()
            if(response.content.length === 0) {
                response.status = 3;
            } else {
                response.status = 0;
                response.content = response.content.map(a => a["name"]);
            }
        })
        .catch(err => {
            throw err
        });
    return response;
}

async function get_voice_channel_names(guild_id, activity){
    let response = {};
    guild_id = parseInt(guild_id);
    if(isNaN(guild_id))
        throw new TypeError(`The guild id given couldn't be converted into an integer. guild_id: ${guild_id}.`);
    if(!(typeof activity === "string"))
        throw new TypeError("The activity is not a string.");
    await pool.query("SELECT Channels.name FROM ((Activities INNER JOIN Guilds on Activities.guild_id = Guilds.id and Guilds.id = ?) INNER JOIN Channels on Channels.activity_id = Activities.id and Activities.name = ?)", [guild_id, activity])
        .then(dbr => {
            response.content = dbr.slice();
            if (response.content.length === 0){
                response.status = 3;
            } else {
                response.content = response.content.map(cn => cn["name"]);
                response.status = 0;
            }
        })
        .catch(err => {
            throw err;
        });
    return response;
}

async function get_voice_channel_name(guild_id, activity){
    let response = {};
    guild_id = parseInt(guild_id);
    if(isNaN(guild_id))
        throw new TypeError(`The guild id given couldn't be converted into an integer. guild_id: ${guild_id}.`);
    if(!(typeof activity === "string"))
        throw new TypeError("The activity is not a string.");
    await pool.query("SELECT Channels.name FROM ((Activities INNER JOIN Guilds ON Activities.guild_id = Guilds.id AND Guilds.id = ?) INNER JOIN Channels ON Channels.activity_id = Activities.id and Activities.name = ?) ORDER BY RAND() LIMIT 1", [guild_id, activity])
        .then(dbr => {
            if (dbr.length !== 0){
                response.content = dbr[0]["name"];
                response.status = 0;
            } else {
                response.status = 3;
                response.content = "No match";
            }
        })
        .catch(err => {
            throw err
        });
    return response;
}

async function register_activities(guild_id, activities) {
    let response = {};
    let i;
    let data = [];
    guild_id = parseInt(guild_id);
    if(isNaN(guild_id))
        throw new TypeError(`The guild id given couldn't be converted into an integer. guild_id: ${guild_id}.`);
    if(!(Array.isArray(activities)))
        throw new TypeError("Activities is not in an array.");
    for(i = 0; i < activities.length; i++)
        data.push([activities[i], guild_id]);
    await pool.batch("INSERT IGNORE INTO Activities(name, guild_id) VALUES(?, ?)", data)
        .then(dbr => {
            response.status = 0;
            response.content = dbr["affectedRows"];
        })
        .catch(err => {
            throw err;
        });
    return response;
}


async function register_channel_names(guild_id, activity, channel_names){
    let i;
    let response = {};
    let data = []
    let sql_query;
    guild_id = parseInt(guild_id);
    if(isNaN(guild_id))
        throw new TypeError(`The guild id given couldn't be converted into an integer. guild_id: ${guild_id}.`);
    if(!(typeof activity === "string"))
        throw new TypeError("Activity is not a string.");
    if(!Array.isArray(channel_names))
        throw new TypeError("The channel names are not in an array.");
    for(i = 0; i < channel_names.length; i++)
        data.push([channel_names[i], activity, guild_id]);
    sql_query = "INSERT IGNORE INTO Channels(name, activity_id) VALUES (?, (SELECT id FROM Activities WHERE name=? AND guild_id=?))"
    await pool.batch(sql_query, data)
        .then(dbr => {
            response.status = 0;
            response.content = dbr["affectedRows"];
        })
        .catch(err => {
            throw err;
        });
    return response;
}


async function register_guild(guild_id){
    let response = {};
    guild_id = parseInt(guild_id);
    if(isNaN(guild_id))
        throw new TypeError(`The guild id given couldn't be converted into an integer. guild_id: ${guild_id}.`);
    await pool.query("INSERT IGNORE INTO Guilds VALUES (?)", [guild_id])
        .then(dbr => {
            response.status = 0;
            response.content = dbr["affectedRows"];
        })
        .catch(err => {
            throw err;
        });
    return response;
}

async function delete_activities(guild_id, activities){
    let response = {};
    let data = []
    let i;
    guild_id = parseInt(guild_id);
    if(isNaN(guild_id))
        throw new TypeError(`The guild id given couldn't be converted into an integer. guild_id: ${guild_id}.`);
    if (!(typeof Array.isArray(activities)))
        throw new TypeError("Activities are not in an array.");
    for(i = 0; i < activities.length; i++)
        data.push([guild_id, activities[i]]);
    await pool.batch("DELETE FROM Activities WHERE guild_id=? AND name=?", data)
        .then(dbr => {
            response.status = 0
            response.content = dbr["affectedRows"];
        })
        .catch(err => {
            throw err;
        });
    return response;
}

async function delete_guild(guild_id){
    let response = {};
    guild_id = parseInt(guild_id);
    if(isNaN(guild_id))
        throw new TypeError(`The guild id given couldn't be converted into an integer. guild_id: ${guild_id}.`);
    await pool.query("DELETE FROM Guilds WHERE id=?", [guild_id])
        .then(dbr => {
            response.status = 0;
            response.content = dbr["affectedRows"];
        })
        .catch(err => {
            throw err;
        });
    return response;
}

module.exports = {
    get_activities,
    get_voice_channel_names,
    get_voice_channel_name,
    register_activities,
    register_channel_names,
    register_guild,
    delete_activities,
    delete_guild
}