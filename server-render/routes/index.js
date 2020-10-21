var express = require('express');
var router = express.Router();

var React = require('react');
var ReactDOMServer = require('react-dom/server');
var VDom = require('../components/VDom');
// renderToString 是把虚拟DOM转化为真实DOM的关键方法
const RDom = ReactDOMServer.renderToString(<VDom />)
// 编写HTML模板，插入转化后的真实DOM内容
const Page = `
            <html>
              <head>
                <title>test</title>
              </head>
              <body>
                <span>服务端渲染出了真实DOM:  </span>
                ${RDom}
              </body>
            </html>
            `;
/* GET home page. */
router.get('/', function(req, res, next) {
  res.send(Page);
  // res.render('index', { title: 'Express' });
});

module.exports = router;
