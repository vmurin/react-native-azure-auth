var library = require('../package.json');
var execSync = require('child_process').execSync;
var fs = require('fs');

execSync('npm run jsdoc:generate', {stdio: 'inherit'});
if (fs.existsSync('docs')) {
  execSync('rm -r docs', {stdio: 'inherit'});
}
execSync(`mv out/react-native-azure-auth/${library.version}/ docs`, {stdio: 'inherit'});
execSync('rm -rf out/');
execSync('git add docs');