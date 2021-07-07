# URL-shortener
實作類似 TinyURL 的縮網址功能，使用 nodejs 的 expressjs 作為後端框架。搭配 mongodb 儲存 short url 跟 long url 的對應。最後用 redis 緩存頻繁被存取的 short url，降低資料庫存取負擔。  

## 使用工具
* nodejs
* expressjs
* mongodb
* redis

## Issue
1. 建立 url_id(short url) 與 long url 對應時，該怎麼產生獨一二的 url_id？
    * <b>方法一(一開始使用的方法):</b> 透過 nanoid (產生隨機字串的套件) 產生出 url_id，將此 url_id 去比對資料庫中是否有衝突(表示此 url_id 已被使用過)。如果有衝突，則再產生一組新的 url_id，反覆檢查直到無衝突為止。
        * 可能問題：
            1. 在少量使用的情況下，隨機產生的 url_id 幾乎不會跟資料庫中有衝突，但在極大使用量時，衝突的機率就會提高，增加資料庫的負擔。
            2. 因為其方式是先隨機產生，再去檢查，檢查後在儲存到資料庫中，此時在很高流量的情況，會有 race condition 的危險。(ex: 可能兩個請求產生了同個 url_id，同時檢查到在資料庫沒有這筆資料，就會各自以為這個 url_id 是沒人使用的)  
    
    * <b>方法二(當前使用方法):</b> 預先在資料庫的一個 pool collection 中產生多組獨特的 url_id，作為一個可用 url_id 的 pool。當需要取得獨特的 url_id 時，可以到這個 pool 裡面取出來使用，並且在取出後刪掉此紀錄。
    因為產生多組 url_id 需要耗費相對應的時間，因此在本專案先產生 500 組作為 demo 使用。若要在使用量更高的系統的話，可能需要額外的一個 service 負責建立新的 url_id，並且要建立很大量的 url_id。
        * 改良重點：
            1. 因為 url_id 是預先產生的，因此在需要獲取 url_id 時，利用 mongodb 的 findOneAndDelete 的 atomic function，確保可以拿到獨特的 url_id，並且同時將此 url_id 從 pool 中移除，表示被使用了，其他人不可使用。改善了方法一的 race condition 問題。
            2. 方法一在使用率高時，衝突的機率就高，資料庫負擔也會因此增加。方法二只要對資料庫做一次存取刪除，即可保證拿到獨特 url_id。
        * 其他未實現改善項目：
            1. 在 demo 中，只有預先產生 500 組，但在使用量高的情況下，500 組絕對不夠用。因此需要有另一個 service 來專門產生 url_id。而需要獲取 url_id 時，就去跟這個 service 要求一個。並且這個 service 會在 url_id 快要不夠用時，產生出更多 url_id 備著。 

2. 如何實作快取？

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

## Database
- mongodb
- redis

## To-do
- check url_id is unique

## package
- express: backend framework
- nodemon: development tool
- valid-url: url validation
- nanoid: generating less duplicate rate url_id
- joi: request body/param validation tool
- mongoose: mongodb ORM
- redis: cache