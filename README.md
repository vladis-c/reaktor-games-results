# Reaktor Pre-Assignment

### Vladislav Cherkasheninov December 2021

### About the project

This is a pre-assignment task from Reaktor. The task was to implement a web application that displays rock-paper-scissors match results. The web application displays the games as they are in progress and historical results of individual players. The historical results include all games that a player has played and the following aggregate data: win ratio, total number of matches played, and the most played hand (rock, paper, or scissors).

There are two buttons History and Live. Feel free to ckick on them, to see historical results and live results correspondingly. 
History: search can be performed by name to see only one particular player result.
Live: when any match starts, it recors it in the table. When match is over, it shows the winner, highlights the line that the match is over, and highlights the winner (if not a Draw). The line disappears in 10 seconds after result is recieved.

React.js, Node.js, axios, express are used in the project and code quality is mainained with eslint. Project includes mini-server.

### App URL

The app is deployed to Heroku and running at:

[https://reaktor-task-vladislav.herokuapp.com](https://reaktor-task-vladislav.herokuapp.com/)

### How to start

To install dependencies:

```
npm install
```

To run locally:

```
npm run dev
```

### Linter

I'm using `eslint-config-airbnb`

To run linter:

```
npm run lint
```