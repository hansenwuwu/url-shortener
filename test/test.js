let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
const { create_url_id } = require('../tools/pool');

// Configure chai
chai.use(chaiHttp);
chai.should();

describe("URL shortener testing", async () => {

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
                    res.should.have.status(201);
                    done();
                });
        });
    });

    describe("upload with invalid url or expireAt", () => {
        it("should return 400", (done) => {
            let t = "2020-07-10T12:20:59.574Z";
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
        it("should return 400", (done) => {
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
    });

});