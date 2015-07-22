# Promise Repeat

A simple utility that retries a given function until it either succeeds or certain failure criteria are met.  It's also useful in case you want to just timeout a Promise.

I wrote this because I couldn't find a small library without dependencies for the purpose of including in a browser environment.

## Installation

```bash
$ npm install promise-repeat
```

## Usage

```js
somePromiseFunction()
  .then ( something )
  .then ( promiseRepeat( fn, [options] ) )
  .then ( ... )
  .catch( ... )

promiseRepeat( fn, [options] )() // note the trailing () which kicks-off the chain
  .then ( ... )
  .catch( ... )
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| maxAttempts | 3 | Maximum number of attempts to make before failing
| minTimeout | 0 | Minimum time before first retry
| maxTimeout | 3,000 (3 sec) | Maximum amount of time before the promsie gets rejected
| debounce | 0 | How long to wait between calls to the function
| debounceFn | returns debounce | `function( retryCount, debounce )` - Custom debounce function to allow for timing adjustments
| boolRetryFn | returns true | `function( err, { retryCount: # })` - Function that should return true or false based on `err` as to whether or not the function should keep trying.  Note that this does _not_ override the `maxRetries` or `maxTimeout` options.  Set those both to `Infinity` if you want to rely solely on this option.
| resolveAfterReject | | If the function returns a value _after_ the promise has been rejected due to a timeout, this is called so that you can actually catch the result (in case you need to roll it back, notify user, etc)

If a promise is rejected it is rejected with one of the following:

- If the promise has timed out, it is rejected with an Error describing the timeout
- If the promise is rejected due to max # of retries, it is rejected with the last error

TODO (maybe): Somehow include all errors in the reject.

### License

"Unlicense" or to put it simply: "Do whatever you want with this, and you don't need to include any silly licenses in your code.  Oh, and nothing is my fault!"
