api_path=./../document/app/assets/api/
rm -fr $api_path
jsdoc ../amdquery/ ../amdquery/**/*.js --template templates/docstrap --destination $api_path