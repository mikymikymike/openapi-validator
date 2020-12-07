const commandLineValidator = require('../../src/cli-validator/runValidator');
const dateTime = require('node-datetime');

const program = {};
let exitcode;

let swagger_file_name = 'CMAn-NOE-117-07.01-AV-Demande_d’accès_à_la_Passerelle_API.yaml';
let dir_path = './test/mock-validation/input/';

//swagger_file_name = "missing-object.yml"
//dir_path = "./test/cli-validator/mockFiles/";


let swagger_name = '';
let swagger_ext = '';
swagger_file_name.split('.').map(filename_part => {
    if (swagger_name == '') {
        swagger_name = filename_part;
    } else {
        swagger_ext = filename_part;
    }
});

var dt = dateTime.create();
var formattedDate = dt.format('Y-m-d');

//Validation Swagger
program.args = [`${dir_path}${swagger_file_name}`];
program.config = './test/mock-validation/validation-configuration.yaml';
program.report_statistics = true;
program.output = `./test/mock-validation/output/report-${formattedDate}-${swagger_name}.json`;

console.log('Validation de swagger-to-validate.yaml');
exitCode = commandLineValidator(program);

