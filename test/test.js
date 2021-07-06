let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');

// Configure chai
chai.use(chaiHttp);
chai.should();

describe("URL shortener testing", () => {

    describe("hello world", () => {
        it("should have return 200 with hello world", (done) => {
            chai.request(app)
                .get('/')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.text.should.equal(`Hs's URL shortener`);
                    done();
                });
        });
    });

    describe("upload url", () => {
        it("should return 200", (done) => {
            let t = new Date();
            chai.request(app)
                .post('/api/v1/urls')
                .send({
                    'url': 'google.com',
                    'expireAt': t.toISOString()
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });

});