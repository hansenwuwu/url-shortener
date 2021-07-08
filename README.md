# URL-shortener
實作類似 TinyURL 的縮網址功能，使用 nodejs 的 expressjs 作為後端框架。搭配 mongodb 儲存 short url 跟 long url 的對應。最後用 redis 緩存頻繁被存取的 short url，降低資料庫存取負擔。  

## 使用工具
- Node.js
- Express
- MongoDB
- Redis

## 使用方法

### Requirment
- Docker
- Docker compose

### Ubuntu, MacOS
1. pull 此專案
```
$ git clone https://github.com/hansenwuwu/url-shortener.git
```
2. 用 docker compose 啟動，即可開始使用！
```
$ docker-compose up -d
```

## 問題探討
### 如何產生獨特的 url_id (6位數的字串，包含[A-Za-z0-9])
- <b>方法一:</b> 使用 nanoid (產生隨機字串的套件) 產生隨機 url_id，比對資料庫中有無重複。如果有，則再產生一組新的 url_id，反覆檢查直到無重複為止。
    - 可能問題：
        1. 低使用量的情況下，隨機產生的 url_id 幾乎不會有重複。但在使用量變高時，重複的機率就會跟著提高，導致檢查重複次數增加。
        2. 在高流量下，有機會發生類似 Race condition 的問題。例如：在兩個請求同時發生，同時隨機產生了同一組 url_id，同時檢查都沒有重複，就會都使用了同一組 url_id，是不能被接受的狀況。
- <b>方法二(此專案使用):</b> 事先在資料庫中產生多組獨特的 url_id 作為可用名單。當需要時可以從這個名單內取出來使用，並在取出後刪掉此 url_id，當作是被使用過了！
    - 改良重點:
        1. 使用 mongodb 的 findOneAndDelete 的 atomic function 特性，確保從名單拿取時，可以拿到獨特的 url_id，並且同時移除此紀錄，讓其他請求不會同被拿到。改善了方法一的 race condition 問題。
        2. 方法一在高使用量時，容易產生重複的 url_id ，資料庫負擔也會因此增加。此方法只需對資料庫做一次存取刪除，並定能拿到取得獨特 url_id。
    - 備註:
        因為產生多組獨特 url_id 需要耗費相對應的時間，因此在本專案在啟動時先產生 500 組作為 demo 使用。
    - 其他未實現改善項目:
        1. 在 demo 中，只有預先產生 500 組，但在使用量高的情況下，500 組絕對不夠用。因此需要有一個額外的 service 來專門產生獨特的 url_id。在需要 url_id 時，找這個 service 請求一個。並且在不夠用時，產生出更多 url_id 備著。

### cache 機制

## API 與設計理念
1. http://localhost/api/v1/urls
* 功能描述：上傳 long url，server 將 long url 對應至一個 unique 的 url_id，並且回傳 url_id。
* 詳細流程：
    1. <b>檢查 url</b> 是否為大於 1 位數的 string。<b>檢查 expireAt</b> 是否為 iso 格式，並且時間大於現在時間。
        * Error handle: 回傳錯誤的資料欄位，status code 400。
    2. <b>檢查 url 是否為 http 或 https 開頭</b>。
        * Error handle: 若 url 無此兩種開頭，則自動加上 "http://" 在 url 前方，此 url 是給後續轉址做使用，因此必須帶有 http 或 https 以區別是否為外部 url。
    3. <b>檢查 url 是否為合理的網址</b>。
        * Error handle: 若不合理則回傳 invalid url，status code 400。
    4. <b>取得獨一無二的 url_id 給 url 去對應</b>。(如何取得獨一無二的 url_id 見後方詳細描述！)
    5. <b>建立 url_id, url, expireAt 的資料到 mongodb 中</b>。
    5. <b>建立完後回傳 url_id 與完整網址</b>。

2. http://localhost/<url_id>
* 功能描述：透過 url_id，轉址到其對應的 long url。
* 詳細流程：
    1. <b>檢查 url_id</b> 是否為 6 位數的 string。(在此 homework，我將 url_id 固定為 6 位數)
        * Error handle: 回傳錯誤的資料欄位，status code 400。
    2. <b>檢查 database 中是否有 url_id 這筆資料</b>。
        * Error handle: 回傳 no such url，status code 400。
    3. <b>檢查 url_id 這筆資料的 expire date 是否到期</b>。如果到期，則將此筆資料刪除。
        * Error handle: 回傳 url has been expired，status code 400。
    4. <b>將網址 redirect 到 url_id 對應到的 url</b>(long url/original url)。

## Testing tool
- mocha
- chai
- chai-http

## To-do
- docker manual

## Package usage
- Express: web backend framework
- Nodemon: development tool
- Valid-url: url validation
- Nanoid: generating less duplicate rate url_id
- Joi: request body/param validation tool
- Mongoose: MongoDB ODM
- Redis: redis package