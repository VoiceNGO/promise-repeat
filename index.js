function delay( ms ){
  return new Promise(function( resolve ){
    ms ? setTimeout( resolve, ms ) : resolve();
  });
}

function retryPromise( fn, options ){
  return new Promise( function( resolve, reject ){
    options || ( options = {} );

    var maxRetries  = options.maxRetries  || 3;
    var minTimeout  = options.minTimeout  || 0;
    var maxTimeout  = options.maxTimeout  || 3000;
    var debounce    = options.debounce    || 0;
    var debounceFn  = options.debounceFn  || function(retries, debounce){ return debounce; };
    var boolRetryFn = options.boolRetryFn || function(){ return true; };

    var startTime  = +new Date();
    var retryCount = 0;

    // reject if fn (or subsequent call) is taking too long
    setTimeout( reject, maxTimeout );

    function run(){
      var now = +new Date();

      return Promise.resolve().then( fn ).then(
        undefined, // pass through success
        function( err ){
          if(
               ( ++retryCount <= maxRetries )
            && ( now < ( startTime + maxTimeout ) )
            && boolRetryFn( err, {retryCount: retryCount} )
          ){
            return delay( Math.max( 0, minTimeout - now + startTime ) || debounceFn( retryCount, debounce ) )
              .then( run );
          }

          reject( err );
        }
      ).then( resolve );
    }

    return run();
  });
}

if( typeof module !== 'undefined' ){ module.exports = retryPromise; }
