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

async function get_activities (guild_id){
    let dbr;
    await pool.query("SELECT activity_name FROM Activity WHERE guild_id = ?", [guild_id])
        .then((rows) => {
            dbr = rows.slice();
        })
        .catch((err) => {
            console.log(`Error when trying to query DB: ${err}`);
        });
    return dbr;
}

async function get_voice_channel_names(guild_id, activity){
    let dbr;
    await pool.query("SELECT channel_name FROM ((Activity inner join Guild on Activity.guild_id = Guild.guild_id and Guild.guild_id = ?) inner join ChannelName on ChannelName.activity_id = Activity.activity_id and activity_name = ?)", [guild_id, activity])
        .then((rows) => {
            dbr = rows.slice()
        })
        .catch((err) => {
           console.log(`Error when trying to query DB: ${err}`);
        });
    return dbr;
}

async function get_voice_channel_name(guild_id, activity){
    let dbr;
    await pool.query("SELECT channel_name FROM ((Activity INNER JOIN Guild ON Activity.guild_id = Guild.guild_id AND Guild.guild_id = ?) INNER JOINS ChannelName ON ChannelName.activity_id = Activity.activity_id and activity_name = ?) ORDER BY RAND() LIMIT 1", [guild_id, activity])
        .then((rows) => {
            dbr = rows[0];
        })
        .catch((err) => {
            console.log(`Error when trying to query DB: ${err}`);
        });
    return dbr;
}

async function register_activity(guild_id, activity) {
    let dbr;
    await pool.query("INSERT INTO Activity(activity_name, guild_id) SELECT ?, ? FROM Activity WHERE NOT EXISTS(SELECT * FROM Activity WHERE activity_name=? and guild_id=?)", [activity, guild_id, activity, guild_id])
        .then((rows) => {
            console.log(rows);
        })
        .catch((err) => {
            console.log(err);
        });
}

async function register_channel_name(guild_id, activity, channel_name){

}

module.exports = {
    get_activities,
    get_voice_channel_names,
    get_voice_channel_name,
    register_activity
}