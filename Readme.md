# Version History
1. Java app: Read google sheets: Runs only locally. Start the app
2. SpringBoot BE + FE: Runs on locally since BE is running on local. Start BE: Runs on localhost:8080. From FE, go to IP address instead of localhost due to CORS restrictions.
   1. FE: HTML
   2. FE: React
   3. BE: Move server to public with ngrok: `ngrok http 8080`. Runs anywhere but only when ngrok server is ON (ngrok is still local).
3. React + jsonserver: BE & FE both on server. Add cors in jsonserver: localhost access is okay.

# Json

* `stats`
* `kanji`