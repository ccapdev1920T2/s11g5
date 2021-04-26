# Tabcore

## Contents

- [controllers](https://github.com/ccapdev1920T2/s11g5/tree/master/controller) - This folder contains files which defines callback functions for client requests.
- [helpers](https://github.com/ccapdev1920T2/s11g5/tree/master/helpers) - This folder contains files which contains helper functions.
- [models](https://github.com/ccapdev1920T2/s11g5/tree/master/models) - This folder contains files for database modeling and access.
- [routes](https://github.com/ccapdev1920T2/s11g5/tree/master/routes) - This folder contains files which describes the response of the server for each HTTP method request to a specific path in the server.
- [views](https://github.com/ccapdev1920T2/s11g5/tree/master/views) - This folder contains all hbs files to be rendered when requested from the server.
- [index.js](https://github.com/ccapdev1920T2/s11g5/blob/master/index.js) - The main entry point of the web application.

## Setting Up

### Local
1. To setup this app locally, clone this repository by either downloading [here](https://github.com/ccapdev1920T2/s11g5/archive/refs/heads/master.zip), or is git is downloaded, run the following command in the command prompt:
```
git clone https://github.com/ccapdev1920T2/s11g5
```

2. Once cloned, navigate to the project folder then run the following command in the command prompt in order to initialize and install all necessary modules used throughout the project:
```
npm install
```

3. Once all necessary modules are initialized and installed, the server could now run with the following command:
```
node index.js
```

4. Once the server is running, go on any browser and type in:
```
http://localhost:3000
```

### Online
To access the app online, visit

[tabcore.herokuapp.com](https://www.tabcore.herokuapp.com)


## Accounts

### Dummy Accounts
There are a few *dummy accounts* created. You may use any of the following dummy accounts:

| Username    | Password   |
|-------------|------------|
| bern_betito | t@bcore123 |
| marcgone    | marcmarc   |
| john_doe    | p@ssword   |
| janeDoe123  | p@ssword   |
| shortCut    | marcmarc   |


### Register
You can also *register* and *create your own account*. Do note that an **actual email address** is needed when registering.


### Guest
You can also login as a __guest user__ using an email address but as a guest, you would only have _limited features_ to explore.


## Tabcore Features

### Sidebar
#### 1. Dashboard
This is your profile page. You'll find some information such as the number of debates you've won and lost.

#### 2. Create a Round
When you want to create your own round, this is where you head to.

#### 3. Join a Round
If any of your teams are invited to join rounds, here is where you'll find them, as well as ongoing rounds.

#### 4. Grade a Round
If you're an adjudicator for a round, you can head on over to this tab when the round ends in order to grade everyone.

#### 5. Round Stats
For any of your concluded rounds, get the round ID and enter them in this tab so you can see the statistics of that round.

#### 6. Round History
To see a list of your previous rounds, head on over to this tab to find all of them.

#### 7. Teams
This is your Teams Dashboard. In here, you'll be able to find all of your teams and create and edit them.

#### 8. Profile Settings
To change anything about your personal information, you can edit and save these changes under this tab.


### Notification Tab
#### 1. Join Round
If you receive any invites to debate rounds, they will appear here.

#### 2. Team Updates
If there are any updates within your team such as change of team name or change of members, they will appear here.


### User Menu
#### 1. Dashboard
This is your profile page. You'll find some information such as the number of debates you've won and lost.

#### 2. Profile Settings
To change anything about your personal information, you can edit and save these changes under this tab.

#### 3. Tutorial
If you need a refresher on where everything is, you can take a look at a tutorial by clicking on Tutorial.

#### 4. Logout
When you need to log out of your account, you can click on Logout.


### Dashboard
#### 1. Create a Round
When you want to create your own round, this is where you head to.

#### 2. Join a Round
If any of your teams are invited to join rounds, here is where you'll find them, as well as ongoing rounds.

#### 3. Round Stats
For any of your concluded rounds, get the round ID and enter them in this tab so you can see the statistics of that round.

#### 4. Round History
To see a list of your previous rounds, head on over to this tab to find all of them.


### Teams Dashboard
#### 1. Create a Team
If you want to create a brand new team with other registered users, go ahead and click on the Create a Team.

#### 2. My Teams
If you want to see a full list of all of the teams you\'re part of, you can head on over to My Teams.

#### 3. Team Updates
If there are any updates within your team such as change of team name or change of members, they will appear here.

#### 4. Edit a Team
If there are any changes that you would want to do to your team, you can edit your team and save these changes under Edit a Team.


### Debate Rounds
Users can participate as debaters in rounds that their team has been invited to or as an adjudicator wherein they will be judging, grading, and giving their comments regarding the speakers and the round itself. A concurrent timer is used, allowing the users to easily synchronize their debate.


### Teams
Users can form teams with either registered users or guest users. In Tabcore, there are three (3) people in a team, a Leader, a Deputy Leader, and a Whip. Users could edit their teams in order to reassign a role or to remove and add a different user.


## Dependencies
- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [body-parser](https://www.npmjs.com/package/body-parser)
- [connect-flash](https://www.npmjs.com/package/connect-flash)
- [connect-mongostore](https://www.npmjs.com/package/connect-mongostore)
- [cookie-parser](https://www.npmjs.com/package/cookie-parser)
- [express](https://www.npmjs.com/package/express)
- [express-session](https://www.npmjs.com/package/express-session)
- [express-validator](https://www.npmjs.com/package/express-validator)
- [http](https://nodejs.org/api/http.html)
- [mongo-sanitize](https://www.npmjs.com/package/mongo-sanitize)
- [mongodb](https://www.npmjs.com/package/mongodb)
- [mongoose](https://www.npmjs.com/package/mongoose)
- [morgan](https://www.npmjs.com/package/morgan)
- [nodemailer](https://www.npmjs.com/package/nodemailer)
- [passport](https://www.npmjs.com/package/passport)
- [passport-local](https://www.npmjs.com/package/passport-local)
- [passport-local-mongoose](https://www.npmjs.com/package/passport-local-mongoose)
- [pug](https://www.npmjs.com/package/pug)
- [socket.io](https://www.npmjs.com/package/socket.io)
- [validator](https://www.npmjs.com/package/validator)


## Authors
* Bernice Betito - Developer
* Marc Gonzales - Tester
* Sean Pe - Designer
