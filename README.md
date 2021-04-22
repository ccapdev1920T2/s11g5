# Tabcore

## Setting Up

### Local
To setup this app locally, run

**npm install**

and then run

**node index.js**

Once **index.js** is running, go on any browser and type in:
http://localhost:3000

### Online
To access the app online, visit

[tabcore.herokuapp.com](https://www.tabcore.herokuapp.com)


## Sessions

The app uses cookies to store your session, and will automatically redirect you to the dashboard if you haven't logged out yet and will redirect to the index page if you try to access pages while not being logged in.


## Accounts

### Dummy Accounts
There are a few *dummy accounts* created. You can use a dummy account with the following credentials:

**username**: john_doe

__password__: p@ssword


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
- http
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
