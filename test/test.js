let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
const { create_url_id } = require('../tools/pool');

// Configure chai
chai.use(chaiHttp);
chai.should();

let test_url = "";

describe("URL shortener test!", () => {

    describe("create testing data(500 unique url_id in pools)", () => {
        it("yeah!", async () => {
            await create_url_id();
        });
    });

    describe("upload with valid url & expireAt", () => {
        it("should return 201", (done) => {
            let t = "2022-07-10T12:20:59.574Z";
            chai.request(app)
                .post('/api/v1/urls')
                .send({
                    'url': 'www.google.com',
                    'expireAt': t
                })
                .end((err, res) => {
                    test_url = JSON.parse(res.text).url_id;
                    res.should.have.status(201);
                    done();
                });
        });
        it("should return 201", (done) => {
            let t = "2023-07-10T12:20:59.574Z";
            chai.request(app)
                .post('/api/v1/urls')
                .send({
                    'url': 'https://github.com/hansenwuwu',
                    'expireAt': t
                })
                .end((err, res) => {
                    res.should.have.status(201);
                    done();
                });
        });
    });

    describe("upload with invalid url or expireAt", () => {
        it("expireAt outdated, should return 400", (done) => {
            let t = "1995-07-10T12:20:59.574Z";
            chai.request(app)
                .post('/api/v1/urls')
                .send({
                    'url': 'www.google.com',
                    'expireAt': t
                })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });
        it("wrong expireAt format, should return 400", (done) => {
            let t = "2020-07-1012:20:59.574";
            chai.request(app)
                .post('/api/v1/urls')
                .send({
                    'url': 'www.google.com',
                    'expireAt': t
                })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });
        it("empty URL, should return 400", (done) => {
            let t = "2023-07-10T12:20:59.574Z";
            chai.request(app)
                .post('/api/v1/urls')
                .send({
                    'url': '',
                    'expireAt': t
                })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });
    });

    describe("access short url", () => {
        it("valid short url, should return 302", (done) => {
            let u = '/' + test_url;
            chai.request(app)
                .get(u)
                .redirects(0)
                .end((err, res, body) => {
                    res.should.have.status(302);
                    done();
                });
        });
        it("invalid short url, should return 404", (done) => {
            chai.request(app)
                .get(`/noturl`)
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });
    });

});