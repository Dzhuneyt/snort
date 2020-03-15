const fs = require('fs');

/**
 * Use this utility script in a CI environment to easily replace
 * Angular configuration variables in environment.prod.ts
 *
 * Example
 *
 * BACKEND_URL=http://google.com npx ts-node ./scripts/replace-env-vars.ts
 */
const backendUrl = process.env.BACKEND_URL;
const envFile = './src/environments/environment.prod.ts';

if (!backendUrl) {
  throw new Error('BACKEND_URL not provided as env var');
}

fs.readFile(
  envFile,
  'utf8',
  function (err, data) {
    if (err) {
      console.log(err);
      process.exit(1);
      return;
    }
    data = data.replace(/\${BACKEND_URL}/g, backendUrl);

    console.log('New environment file contents:', data);

    fs.writeFile(envFile, data, 'utf8', function (err) {
      if (err) return console.log(err);
    });
  });
