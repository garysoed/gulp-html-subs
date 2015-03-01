# gulp-html-subs

A gulp module to extract the inner HTML of HTML element (using selector), pass it to the pipe, and
reassemble it.

```javascript
var subsScript = subs('script');
var subsStyle = subs('style');
gulp.src(['src/**/*.html'])
    .pipe(subsScript.extract)  // Extract the content of every script element
        .pipe(to5())           // Pass it to 6to5
    .pipe(subsScript.inject)   // Put the output back to the script element
    .pipe(subsStyle.extract)   // Extract the style elements
        .pipe(myth())          // Pass it through Myth
    .pipe(subsStyle.inject)    // Put the output back to the style elements
```

Always call `subs()` for every replacement you make.
