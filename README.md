# TreeFeatureCollectorServer

Server part for Tree Feature Collector

## GET local IP addres

run in terminal 
- mac: ```ipconfig getifaddr en0```
- windows: ```ipconfig```
- linux: ```ip a```

Use it in TFC-app in env as ```EXPO_PUBLIC_API_URL```

## Local server run

- to run it locally, you need .env file with
```
PORT
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY 
```

- Author will send on demand

## Deploy
- app is deployed on
```
https://treefeaturecollectorserver.onrender.com/health
```

- runs on free tier - so maybe need to wake up by access
```https://treefeaturecollectorserver.onrender.com/health```