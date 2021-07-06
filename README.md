# url-shortener

## package
- express: backend framework
- nodemon: development tool
- valid-url: for url validation
- nanoid: for generating none duplicate id 
- joi: for data validation
- redis: cache

## Test
```
curl -X POST -H "Content-Type:application/json" http://localhost:3000/api/v1/urls -d '{
"url": "<original_url>",
"expireAt": "2021-02-08T09:20:41Z"
}'
```

```
curl -L -X GET http://localhost:3000/test
```

## Testing tool
- mocha
- chai
- chai-http

## Database
- mongodb
- mongoose

## To-do
- check url_id is unique
- cache