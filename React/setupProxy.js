const {createProxyMiddleware} = require('http-proxy-middleware')

module.exports = function (app)
{
    app.use(createProxyMiddleware('/svr',
        {
            target: "http://localhost:12000",
            changeOrigin: true,
            withCredentials: false,
            pathRewrite: {
                "^/svr": "/"
            },
            "secure": false
        }));
    app.use(createProxyMiddleware('/luc',
        {
            target: "http://localhost:8080",
            changeOrigin: true,
            withCredentials: false,
            pathRewrite: {
                "^/luc": "/LucServer_war_exploded/Search"
            },
            "secure": false
        }))
}


