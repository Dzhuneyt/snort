// BrowserSync config (lite-server)
module.exports = {
  port: 4200,
  files: ['./dist/**/*'],
  server: {
    baseDir: './dist/frontend',
  }
};
