# Promise Repeat

A simple utility that retries a given function until it either succeeds or certain failure criteria are met.

I wrote this because I couldn't find a small library without dependencies for the purpose of including in a browser environment.

## Installation

```bash
$ npm install promise-repeat
```

## Usage

```js
promiseRepeat( fn, [options] )
  .then ( ... )
  .catch( ... )
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| maxRetries | 3 | Maximum number of attempts to make before failing
| minTimeout | 0 | Minimum time before first retry
| maxTimeout | 3,000 (3 sec) | Maximum number of time before the promsie gets rejected
| debounce | 0 | How long to wait between calls to the function
| debounceFn | returns debounce | `function( retryCount, debounce )` - Custom debounce function to allow for timing adjustments
| boolRetryFn | returns true | `function( err, { retryCount: # })` - Function that should return true or false based on `err` as to whether or not the function should keep trying.  Note that this does _not_ override the `maxRetries` or `maxTimeout` options.  Set those both to `Infinity` if you want to rely solely on this option.
| resolveAfterReject | | If the function returns a value _after_ the promise has been rejected due to a timeout, this is called so that you can actually catch the result (in case you need to roll it back, notify user, etc)

### License

"Unlicense" or to put it simply: "Do whatever you want with this, and you don't need to include any silly licenses in your code.  Oh, and nothing is my fault!"
