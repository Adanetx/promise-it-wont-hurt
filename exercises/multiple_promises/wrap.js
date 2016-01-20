'use strict';

function wrap(ctx) {
  /* eslint-disable no-extend-native, no-param-reassign, no-native-reassign, no-undef */
  var p;
  var savedPrototype;

  function isInUserCode(stack) {
    return stack[0].getFileName().substring(0, ctx.mainProgram.length)
      === ctx.mainProgram;
  }

  ctx.usedPrototypeThen = false;
  ctx.isInAll = false;

  require('es6-promise');
  p = Promise;

  Promise.all = undefined;

  global.getPromise1 = function () {
    var timeout;
    var used = false;

    var out = new Promise(function (fulfill) {
      timeout = setTimeout(fulfill, 400 + ctx.rand * 200, ctx.data[0]);
    });

    out.then = function (onFulfilled, onRejected) {
      used = true;

      var stack = ctx.$captureStack(out.then);

      if (isInUserCode(stack)) ctx.usedPrototypeThen = true;

      for (var i = 0; i < stack.length; i++) {
        if (isInUserCode([ stack[i] ]) &&
            stack[i].getFunctionName() === 'all') {
          ctx.isInAll = true;
        }
      }

      return p.prototype.then.apply(this, arguments);
    };

    // Evil. Yes, I know.
    process.nextTick(function () {
      if (!used) timeout.unref();
    });

    return out;
  };

  global.getPromise2 = function () {
    var timeout;
    var used = false;

    var out = new Promise(function (fulfill) {
      timeout = setTimeout(fulfill, 400 - ctx.rand * 200, ctx.data[1]);
    });

    out.then = function (onFulfilled, onRejected) {
      used = true;
      return p.prototype.then.apply(this, arguments);
    };

    process.nextTick(function () {
      if (!used) timeout.unref();
    });

    return out;
  };

  /* eslint-enable no-extend-native, no-param-reassign, no-undef */
}

wrap.wrapSubmission = true;
wrap.wrapSolution = true;

module.exports = wrap;