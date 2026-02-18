const app = require('../server/dist/index.js').default;

module.exports = (req, res) => {
    app(req, res);
};
