To setup this app, run

npm install

and then run

node index.js

The app uses cookies to store your session, and will automatically redirect you to the dashboard if you havent logged out yet and will redirect to the login page if you try to access pages while not being logged in. Pleas make sure that cookies are enabled when you view this app in a browser.

A default user has been made with some dummy data, but you can create your own account.
Its credentials are as follows:
username: iamyourfather
password: lukeandleia


Please also note that as of phase 2, some features may not be accessible yet, such as creating a round room, joining a debate, and grading a debate, as these features
are to be implemented in phase 3 of the MP, as phase 2 requires the schema. Features that are available are the viewing of one's match history and the creation of an account, as well as logging in and signing out.

Furthermore, for the live room feature, where users can dynamically start and join a room, the roomdata will be saved in redis, as redis is a key-value store most appropriate for caching. This also means that functionalities such as adding a new user to a room, removing them, and the like will depend on socket.io functions, which will also be implemented by phase 3. Finally, proper error handling will also be implemented by phase 3, as well as logic for the front-end in terms of form validation.

Overall, our models and views are complete, with some of the controllers missing. Stay safe, sir, and you can contact any of us for question and/or a demonstration.
