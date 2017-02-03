module.exports = {
  stripPrefix: 'build/',
  staticFileGlobs: [
    'build/*.html',
    'build/manifest.json',
    'build/static/**/!(*map*)',
		'build/Images/**/*.jpg',
		'build/fonts/*.*'
  ],
  dontCacheBustUrlsMatching: /\.\w{8}\./,
  swFilePath: 'build/service-worker.js'
};