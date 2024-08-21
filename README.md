# StatsVLR-Discord

The StatsVLR-Discord bot enhances your Discord experience by providing comprehensive Valorant data directly within your server. Utilizing advanced Slash Commands, Modals, and Buttons, this bot offers a seamless way to access and interact with a wide range of Valorant-related information. Key features include:

- **Detailed Player Information:** Retrieve in-depth profiles of Valorant players, including stats, past teams, and social media links.
- **Team Insights:** Get detailed data about Valorant teams, including player rosters, staff, results, and upcoming matches.
- **Match and Event Data:** Access results from past matches, view upcoming fixtures, and explore event details such as dates, prize pools, and statuses.

## Table of Contents

- [Features](#features)
- [Commands](#commands)
- [Project Tree](#project-tree)
- [Todo](#todo)
- [Setup](#setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Troubleshooting](#troubleshooting)
- [Contribution](#contribution)
- [License](#license)

## Features

<details>
<summary>Fetch detailed player information</summary>

Response:
```json
{
  "status": "string",
  "data": {
    "info": {
      "id": "string",
      "url": "string",
      "img": "string",
      "user": "string",
      "name": "string",
      "country": "string",
      "flag": "string"
    },
    "team": {
      "id": "string",
      "url": "string",
      "name": "string",
      "logo": "string",
      "joined": "string"
    },
    "results": [
      {
        "match": {
          "id": "string",
          "url": "string"
        },
        "event": {
          "name": "string",
          "logo": "string"
        },
        "teams": [
          {
            "name": "string",
            "tag": "string",
            "logo": "string"
          }
        ]
      }
    ],
    "pastTeams": [
      {
        "id": "string",
        "url": "string",
        "name": "string",
        "logo": "string",
        "info": "string"
      }
    ],
    "socials": {
      "twitter": "string",
      "twitter_url": "string",
      "twitch": "string",
      "twitch_url": "string"
    }
  }
}
```
</details>

<details>
<summary>Fetch all players or from a specific country</summary>

Response:
```json
{
  "status": "string",
  "size": 0,
  "pagination": {
    "page": 0,
    "limit": 0,
    "totalElements": 0,
    "totalPages": 0,
    "hasNextPage": true
  },
  "data": [
    {
      "url": "string",
      "user": "string",
      "name": "string",
      "img": "string",
      "country": "string"
    }
  ]
}
```
</details>

<details>
<summary>Fetch detailed team information</summary>

Response:
```json
{
  "status": "string",
  "data": {
    "info": {
      "name": "string",
      "tag": "string",
      "logo": "string"
    },
    "players": [
      {
        "id": "string",
        "url": "string",
        "user": "string",
        "name": "string",
        "img": "string",
        "country": "string"
      }
    ],
    "staff": [
      {
        "id": "string",
        "url": "string",
        "user": "string",
        "name": "string",
        "tag": "string",
        "img": "string",
        "country": "string"
      }
    ],
    "events": [
      {
        "id": "string",
        "url": "string",
        "name": "string",
        "results": ["string"],
        "year": "string"
      }
    ],
    "results": [
      {
        "match": {
          "id": "string",
          "url": "string"
        },
        "event": {
          "name": "string",
          "logo": "string"
        },
        "teams": [
          {
            "name": "string",
            "tag": "string",
            "logo": "string",
            "points": "string"
          }
        ]
      }
    ],
    "upcoming": [
      {
        "match": {
          "id": "string",
          "url": "string"
        },
        "event": {
          "name": "string",
          "logo": "string"
        },
        "teams": [
          {
            "name": "string",
            "tag": "string",
            "logo": "string"
          }
        ]
      }
    ]
  }
}
```
</details>

<details>
<summary>Fetch all the events</summary>

Response:
```json
{
  "status": "string",
  "size": 0,
  "data": [
    {
      "id": "string",
      "name": "string",
      "status": "string",
      "prizepool": "string",
      "dates": "string",
      "country": "string",
      "img": "string"
    }
  ]
}
```
</details>

<details>
<summary>Fetch all the matches</summary>

Response:
```json
{
  "status": "string",
  "size": 0,
  "data": [
    {
      "id": "string",
      "teams": [
        {
          "name": "string",
          "country": "string",
          "score": "string"
        }
      ],
      "status": "string",
      "event": "string",
      "tournament": "string",
      "img": "string",
      "in": "string"
    }
  ]
}
```
</details>

<details>
<summary>Fetch all the results</summary>

Response:
```json
{
  "status": "string",
  "size": 0,
  "data": [
    {
      "id": "string",
      "teams": [
        {
          "name": "string",
          "score": "string",
          "country": "string",
          "won": true
        }
      ],
      "status": "string",
      "ago": "string",
      "event": "string",
      "tournament": "string",
      "img": "string"
    }
  ]
}
```
</details>

## Commands

Here is a list of available commands and their descriptions:

- **Events:** Provides information about all events.
- **Matches:** Provides information about upcoming matches or matches being played.
- **Panel:** Manages the command panel for interaction with the bot.
- **Player:**
  - **List Players:** Provides information about Valorant players.
  - **Player Info:** Provides information about a specific Valorant Esports player.
- **Results:** Provides information about the results of games already played.
- **Team:**
  - **List Teams:** Provides information about all teams.
  - **Team Info:** Provides detailed information about a Valorant team.

## Project Tree

```
📦 
├─ .gitignore
├─ LICENSE
├─ README.md
├─ commands
│  ├─ events
│  │  └─ events.js
│  ├─ matches
│  │  └─ matches.js
│  ├─ panel
│  │  └─ panel.js
│  ├─ player
│  │  ├─ listplayers.js
│  │  └─ player.js
│  ├─ results
│  │  └─ result.js
│  └─ team
│     ├─ listteams.js
│     └─ team.js
├─ events
│  ├─ client
│  │  └─ ready.js
│  └─ guild
│     ├─ interactionCreate.js
│     └─ modal
│        ├─ modalCreate.js
│        └─ modalData.js
├─ example.config.json
├─ index.js
├─ package-lock.json
└─ package.json
```

## Todo:

### Completed:

- Events
- Matches
- Result
- News
- Players
  - List All Players
- Team
  - List All Teams
- Panel
  - Find Player
  - Find Team
- Autopost news in a channel
- Player stats from tracker.gg

### Yet to Do:

- Agents
- Buddies
- Bundles
- Ceremonies
- Competitive Tiers
- Content Tiers
- Contracts
- Currencies
- Gamemodes
- Gear
- Level Borders
- Maps
- Player Cards
- Player Titles
- Seasons
- Sprays
- Weapons


## Setup

### Prerequisites

- Node.js (version 16 or later)
- Discord.js (v14 or later)
- Axios
- A Discord bot token and a registered bot application

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/krushna06/StatsVLR-Discord
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Configure your bot:**

    ```json
    {
      "token": "",
      "clientId": "",
      "embedColor": "#00FF00",
      "errorColor": "#FF0000",
      "successColor": "#00FF00",
      "api_url": "https://statsvlr.n0step.xyz"
    }
    ```
  
4. **Run the bot:**

    ```bash
    npm start
    ```

## Troubleshooting

- **Error: "Something went wrong. Try again"**  
  This message typically means there's an issue with the API call or the interaction. Check the console for any error messages and verify your API endpoints.

- **Error: "Invalid ID provided"**  
  This error

 occurs if the ID provided does not match any data in the API. Double-check the ID and ensure it is correct.

## Contribution

Feel free to contribute to this project by submitting issues, feature requests, or pull requests. Your feedback and contributions are welcome!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.