function extend( obj ){
	[].slice.call( arguments, 1 ).forEach( function( extend ){
		Object.keys( extend ).forEach( function( key ){
			if( !obj[ key ] ){
				obj[ key ] = extend[ key ];
			}
		} );
	} );

	return obj;
}

// Note -- Not a "safe" delay function since it can execute immediately,
//   i.e. it might not be pushed onto the end of the call stack.
//
// This behavior is desired in this case since we're using it only within a Promise
function delay( ms ){
  return new Promise( function( resolve ){
    ( ms === Infinity )
      ? '' // do nothing since it'll never resolve anyway!
      : ( ms > 0 )
        ? setTimeout( resolve, ms )
        : resolve();
  } );
}

var defaultOptions = {
    maxAttempts        : 3
  , minTimeout         : 0
  , maxTimeout         : 3000
  , throttle           : 0
  , throttleFn         : function( retries, throttle ){ return throttle; }
  , boolRetryFn        : function(){ return true; }
  , resolveAfterReject : function(){}
	, timeoutMessage     : ''
};

function retryPromise( fn, options ){
  options = extend( {}, options || {}, defaultOptions );

  return function(){
		// Arguments coming into the actual .then() call
    var args = [].slice.call( arguments );

    return new Promise( function( resolve, reject ){
      var startTime  = +new Date();
      var retryCount = 0;

      // Success!  Either pass the value through or call `resolveAfterReject`
      function successHandler( result ){
        var now = +new Date();

        // if reject() should have already been called
        if( now >= ( startTime + options.maxTimeout ) ){
          options.resolveAfterReject( result );

        // pass through
        } else {
          return result;
        }
      }

      function errHandler( err ){
        var now = +new Date();

        // if( should retry ){
        //   delay( ms ).then( run );
        if(
             ( ++retryCount < options.maxAttempts )                // if retry count exceeded
          && ( now < ( startTime + options.maxTimeout ) )          // if timeout exceeded
          && options.boolRetryFn( err, {retryCount : retryCount} ) // if custom retry handler failed
        ){
          return delay(
             ( options.minTimeout - now + startTime )              // delay first retry
            || options.throttleFn( retryCount, options.throttle )  // delay subsequent retries
          )
            .then( run );
        }

        reject( err );
      }

      function run(){
        // in case the promise comes in as a "spread" bind the incoming arguments to the function
        // function is inlined instead of using `.bind` because we don't want an extra `undefined`
        //   from the `.resolve()` to pass through
        return Promise.resolve().then( function(){
          return fn.apply( fn, args );
        })
        .then( successHandler, errHandler )
        .then( resolve );
      }

      // reject if fn (or subsequent call) is taking too long
      var deferReject = delay( options.maxTimeout )
        .then( function(){
          throw new Error( options.timeoutMessage ||
						               'PromiseRepeat: Function failed to resolve after ' + (1+retryCount) +
													 ' attempts and ' + options.maxTimeout + 'ms.' );
        });

      return Promise.race([ run(), deferReject ]);
    });
  };
}

if( typeof module !== 'undefined' ){
  module.exports              = retryPromise;
  module.exports.validOptions = Object.keys( defaultOptions );
}
