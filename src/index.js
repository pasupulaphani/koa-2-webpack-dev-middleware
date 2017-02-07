const expressMiddleware = require('webpack-dev-middleware');

function middleware(doIt, req, res) {
  const { end: originalEnd } = res;

  return (done) => {
    res.end = function end() {
      originalEnd.apply(this, arguments);
      done(null, 0);
    };
    doIt(req, res, () => {
      done(null, 1);
    })
  };
}

module.exports = (compiler, option) => {
  const doIt = expressMiddleware(compiler, option);

  return function(ctx, next) {
    const req = ctx.req;

    ctx.webpack = doIt;

    return next().then(function () {
      middleware(doIt, req, {
        end(content) {
          ctx.body = content;
        },
        setHeader() {
          ctx.set.apply(ctx, arguments);
        }
      });
    });
  }

  Object.keys(doIt).forEach(p => {
    koaMiddleware[p] = doIt[p];
  });

  return koaMiddleware;
};
