# AChannel API

## Purpose

This API is meant to add a layer between the database and the [AChannel](https://github.com/SamuelCHICHA/achannel) bot.
It can only be used with local queries.

## Installation

Clone the project and run `npm install` then run `npm start` to launch the app. 

## Routes

- /guild/{guild_id}/activity/{activity_name}/random-channel-name [**GET**]

Get a random channel name for an acitivity inside a guild.

- /guild/{guild_id}/activity/{activity_name}/channel-names [**GET**]

Get all channel names for an activity inside a guild.

- /guild/{guild_id}/activities [**GET**]

Get all activities inside a guild.

- /guild/{guild_id}/register-activity [**POST**]

Register an activity inside a guild.

- /guild/{guild_id}/delete-activities [**POST**]

Delete all activities inside a guild.

- /guild/{guild_id}/activity/{activity_name}/register-channel-name [**POST**]

Register a channel name for an activity inside a guild.

- /register-guild [**POST**]

Register a guild

- /delete-guild [**POST**]

Delete a guild
