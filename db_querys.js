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
 * 1 => Database communication failed
 * 2 => Data already exists (Case of insertion)
 * 3 => No match (case of selection)
 * 4 => Unknown
 */

async function get_activities (guild_id){
    let response = {};
    if(!(typeof guild_id ===  "number"))
        throw new TypeError("Wrong types");
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
        .catch((err) => {
            response.status = 1;
            response.content = "Database Error";
            console.log(`Error when trying to query DB: ${err}`);
        });
    return response;
}

async function get_voice_channel_names(guild_id, activity){
    let response = {};
    if(!(typeof guild_id === "number" && typeof activity === "string"))
        throw new TypeError("Wrong types");
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
            response.status = 1;
            response.content = "Database Error";
            console.log(err);
        });
    return response;
}

async function get_voice_channel_name(guild_id, activity){
    let response = {};
    if(!(typeof guild_id === "number" && typeof activity === "string"))
        throw new TypeError("Wrong types");
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
            response.status = 1;
            response.content = "Database Error"
            console.log(err);
        });
    return response;
}

async function register_activities(guild_id, activities) {
    let response = {};
    let i;
    let data = [];
    if(!(typeof guild_id === "number" && Array.isArray(activities)))
        throw new TypeError("Wrong types");
    for(i = 0; i < activities.length; i++)
        data.push([activities[i], guild_id]);
    await pool.batch("INSERT INTO Activities(name, guild_id) VALUES(?, ?)", data)
        .then(() => {
            response.status = 0
            console.log()
        })
        .catch(dbr => {
            console.log(dbr);
            response.status = 1;
        });
    return response;
}


async function register_channel_names(guild_id, activity, channel_names){
    let i;
    let response = {};
    let data = []
    let sql_query;
    if(!(typeof guild_id === "number" && typeof activity === "string" && Array.isArray(channel_names)))
        throw new TypeError("Wrong types");
    for(i = 0; i < channel_names.length; i++)
        data.push([channel_names[i], activity, guild_id]);
    sql_query = "INSERT INTO Channels(name, activity_id) VALUES (?, (SELECT id FROM Activities WHERE name=? AND guild_id=?))"
    await pool.batch(sql_query, data)
        .then(() => response.status = 0)
        .catch(dbr => {
            console.log(dbr);
            response.status = 1;
        });
    return response;
}


async function register_guild(guild_id){
    let response = {};
    if(!(typeof guild_id === "number"))
        throw new TypeError("Wrong type");
    await pool.query("INSERT INTO Guilds VALUES (?)", [guild_id])
        .then(dbr => {
            if(dbr["affectedRows"] === 1)
                response.status = 0;
            else if(dbr["affectedRows"] === 0)
                response.status = 2;
            else
                response.status = 4;
        })
        .catch(err => {
            console.log(err);
            response.status = 1;
        });
    return response;
}

async function delete_activity(guild_id, activity){
    let response = {};
    if (!(typeof guild_id === "number" && typeof activity === "string"))
        throw new TypeError("Wrong types");
    await pool.query("DELETE FROM Activities WHERE guild_id=? AND name=?", [guild_id, activity])
        .then(() => response.status = 0)
        .catch(dbr => {
            console.log(dbr);
            response.status = 0;
        });
    return response;
}

async function delete_guild(guild_id){
    let response = {};
    if (!(typeof guild_id === "number"))
        throw new TypeError("Wrong type");
    await pool.query("DELETE FROM Guilds WHERE id=?", [guild_id])
        .then(()=> response.status = 0)
        .catch(dbr => {
            console.log(dbr);
            response.status = 1;
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
    delete_activity,
    delete_guild
}