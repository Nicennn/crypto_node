# CRYPTO NODE

## Description
Nodejs server fething cryptocurrencies prices in euro from [ CoinMarketCap ](https://coinmarketcap.com/api/), and notifying the user by email when the price goes down below a price chooses as a limit.

## How to use
You need to have a mail transfer agent installed. If you do not have one, you can use [sendmail](https://www.proofpoint.com/us/open-source-email-solution).  
Clone the repo in a directory.  
run: `npm install` to install the dependecies  
in another terminal, in the directory of your choice, run: `mongod --dbpath=$PWD/data`  
run: `npm run dev` to run the server localy.  
You can now access it at 127.0.0.1:5000 

## Npm modules used
	* express
	* express-session
	* bcrypt: to encrypt and decrypt passwords
	* body-parser: to fetch the body portion of incoming HTTP request and expose it in req.boy
	* ejs: template engine
	* mongoose
	* morgan
	* passport
	* passport-local: our login strategy
	* session-file-store: to save datas relative to sessions

## How it works

The user can choose coins to watch among the list of coins. He must then choose
a price limit, which is 0 by default.

Every 1h, the server makes another call to the MarketCoinCap API and updates its list of cryptocurrencies. At the same time, it also checks if the value of coins watched by the user are below the user choosen limit. If so,  the user is then notified by an email.

If a user removes a coin from his watchlist, he will not be notified for price variations of this coin.
