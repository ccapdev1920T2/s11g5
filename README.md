# Tabcore

## Contents

- [controllers](https://github.com/ccapdev1920T2/s11g5/tree/master/controller) - This folder contains files which defines callback functions for client requests.
- [helpers](https://github.com/ccapdev1920T2/s11g5/tree/master/helpers) - This folder contains files which contains helper functions.
- [models](https://github.com/ccapdev1920T2/s11g5/tree/master/models) - This folder contains files for database modeling and access.
- [routes](https://github.com/ccapdev1920T2/s11g5/tree/master/routes) - This folder contains files which describes the response of the server for each HTTP method request to a specific path in the server.
- [views](https://github.com/ccapdev1920T2/s11g5/tree/master/views) - This folder contains all hbs files to be rendered when requested from the server.
- [views](https://github.com/ccapdev1920T2/s11g5/blob/master/index.js) - The main entry point of the web application.

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

Once **index.js** is running, go on any browser and type in:
http://localhost:3000

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


## Main Features to Check Out

### Debate Rounds / Matches
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
