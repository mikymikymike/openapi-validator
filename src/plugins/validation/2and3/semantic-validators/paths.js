// Assertation 1:
// Path parameters definition, either at the path-level or the operation-level, need matching paramater declarations

// Assertation 2:
// Path parameter declarations do not allow empty names (/path/{} is not valid)

// Assertation 3:
// Path strings must be (equivalently) different (Example: /pet/{petId} and /pet/{petId2} are equivalently the same and would generate an error)

// Assertation 4:
// Paths must have unique (name + in combination) parameters

// Assertation 5:
// Paths cannot have partial templates. (/path/abc{123} is illegal)

// Assertation 6:
// Paths cannot have literal query strings in them.

// Assertation 7:
// Paths parts should be at plural : ending with s, x or z, or having first word ending with it

// Assertation 8:
// Resources and identifier must be alternated in path
// NB : version is excluded

// Assertation 9:
// Path must contains 6 depths max (alternating resources and identifier Assertion 8).
// NB : version is excluded

// Assertation 10:
// Path should not end with a "/"

const each = require('lodash/each');
const findIndex = require('lodash/findIndex');
const isObject = require('lodash/isObject');
const MessageCarrier = require('../../../utils/messageCarrier');

const templateRegex = /\{(.*?)\}/g;
const versionRegex = /^v(ersion)?(\d+\.)?(\d+\.)?(\d+)$/;
const parameterRegex = /^{.*}$/;

const pluralFirstWordLowerCase = /^[a-z][a-z0-9]*[sxz](?:[\_\-\.][a-z0-9]+)*$/; // example : learnings_opt_out or learningx-opt-out or learningz.opt.Out
const pluralFirstWordCamelCase = /^[a-zA-Z][a-z0-9]*[sxz](?:[A-Z][a-z0-9]+)*$/; // example : learningxOptOut or LearningsOptOut


module.exports.validate = function({ resolvedSpec }, config) {
  const messages = new MessageCarrier();

  config = config.paths;

  const paths = resolvedSpec.paths;
  const hasPaths = paths && typeof paths === 'object';
  if (hasPaths) {

    const seenRealPaths = {};

    const tallyRealPath = path => {
        // ~~ is a flag for a removed template string
        const realPath = path.replace(templateRegex, '~~');
        const prev = seenRealPaths[realPath];
        seenRealPaths[realPath] = true;
        // returns if it was previously seen
        return !!prev;
    };

    each(resolvedSpec.paths, (path, pathName) => {
        if (!path || !pathName) {
            return;
        }

        let resourcesMalFormed = '';
        let resourcesAlternated = true;
        let depthPath = 0;
        let numberOfLevels = 0;
        pathName.split('/').map(substr => {
            depthPath += 1;
            substr = substr.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            
            // Assertation 5
            if (
                templateRegex.test(substr) &&
                substr.replace(templateRegex, '').length > 0
            ) {
                messages.addMessage(
                `paths.${pathName}`,
                'Partial path templating is not allowed.',
                'error'
                );
            }

            //check if root path (number 2) is the version
            if (depthPath > 1) {
                if (! (depthPath == 2 && versionRegex.test(substr.toLowerCase()))) {
                    numberOfLevels += 1;

                    if (substr.length > 0 && !parameterRegex.test(substr)) {
                        const lastPathChar = substr.charAt(substr.length-1).toLowerCase();

                        // Assertation 7
                        //checks last word last char
                        if(lastPathChar != "s" && lastPathChar != "x" && lastPathChar != "z") {

                            //check first word depending on case
                            let firstWordPlural = false;
                            if (substr.indexOf('_') > -1 || substr.indexOf('-') > -1 || substr.indexOf('.') > -1 ) {
                                firstWordPlural = pluralFirstWordLowerCase.test(substr.toLowerCase());
                            } else {
                                //check in camelCase
                                firstWordPlural = pluralFirstWordCamelCase.test(substr);
                            }

                            if (firstWordPlural === false) {
                                if (resourcesMalFormed == '') {
                                    resourcesMalFormed = `'${substr}'`;

                                } else {
                                    resourcesMalFormed = `${resourcesMalFormed}, '${substr}'`;
                                }
                            }
                        }
                    }

                    //Assertion 9
                    //even number must levels must be parameters, and odd must be resources
                    if ( (numberOfLevels % 2 == 0) != parameterRegex.test(substr) ) {
                        resourcesAlternated = false;
                    }
                }   
            }
        });

        const checkResourcesPlural = config.path_segments_with_s
        if (resourcesMalFormed != '' && checkResourcesPlural != 'off') {
            messages.addTypedMessage(
                `paths.${pathName}`,
                `Resources in paths should be plural (with an 's', 'x' or 'z') : ${resourcesMalFormed}.`,
                checkResourcesPlural,
                'convention',
                'CTMO.STANDARD-CODAGE-03'
            );
        }

        // Assertation 8
        let checkPathDepth = 'off';
        let maxPathDepth = 0;
        if (config.max_path_levels) {
            checkPathDepth = config.max_path_levels[0];
            maxPathDepth = config.max_path_levels[1];
        }
        if (numberOfLevels > maxPathDepth && checkPathDepth != 'off') {
            messages.addTypedMessage(
                `paths.${pathName}`,
                `Path must contain 6 depths maximum (3 levels alternating resource and identifier).`,
                checkPathDepth,
                'convention',
                'CTMO.STANDARD-CODAGE-05'
            );
        }

        const checkResourcesAlternated = config.alternate_resources_and_identifiers
        if (!resourcesAlternated && checkResourcesAlternated != 'off') {
            messages.addTypedMessage(
                `paths.${pathName}`,
                `Path must alternate resource type and identifier (eg 'resource/{id}/subresource/{id}').`,
                checkResourcesAlternated,
                'convention',
                'CTMO.STANDARD-CODAGE-04'
            );
        }

        //Assertation 10
        const checkFinalSlash = config.path_ending_with_slash
        if (checkFinalSlash != 'off' && numberOfLevels > 0 && pathName.length > 1 && pathName.charAt(pathName.length-1) == "/") {
            messages.addTypedMessage(
                `paths.${pathName}`,
                `Path should not end with a '/'.`,
                checkFinalSlash,
                'convention',
                'CTMO.STANDARD-CODAGE-11'
            );
        }

        // Assertation 6
        if (pathName.indexOf('?') > -1) {
        messages.addMessage(
            `paths.${pathName}`,
            'Query strings in paths are not allowed.',
            'error'
        );
        }

        const parametersFromPath = path.parameters ? path.parameters.slice() : [];

        const availableParameters = parametersFromPath.map((param, i) => {
        if (!isObject(param)) {
            return;
        }
        param.$$path = `paths.${pathName}.parameters[${i}]`;
        return param;
        });

        each(path, (operation, operationName) => {
        if (
            operation &&
            operation.parameters &&
            Array.isArray(operation.parameters)
        ) {
            availableParameters.push(
            ...operation.parameters.map((param, i) => {
                if (!isObject(param)) {
                return;
                }
                param.$$path = `paths.${pathName}.${operationName}.parameters[${i}]`;
                return param;
            })
            );
        }
        });

        // Assertation 3
        const hasBeenSeen = tallyRealPath(pathName);
        if (hasBeenSeen) {
        messages.addMessage(
            `paths.${pathName}`,
            'Equivalent paths are not allowed.',
            'error'
        );
        }

        // Assertation 4
        each(parametersFromPath, (parameterDefinition, i) => {
        const nameAndInComboIndex = findIndex(parametersFromPath, {
            name: parameterDefinition.name,
            in: parameterDefinition.in
        });
        // comparing the current index against the first found index is good, because
        // it cuts down on error quantity when only two parameters are involved,
        // i.e. if param1 and param2 conflict, this will only complain about param2.
        // it also will favor complaining about parameters later in the spec, which
        // makes more sense to the user.
        if (i !== nameAndInComboIndex && parameterDefinition.in) {
            messages.addMessage(
            `paths.${pathName}.parameters[${i}]`,
            "Path parameters must have unique 'name' + 'in' properties",
            'error'
            );
        }
        });

        let pathTemplates = pathName.match(templateRegex) || [];
        pathTemplates = pathTemplates.map(str =>
        str.replace('{', '').replace('}', '')
        );

        // Assertation 1
        each(availableParameters, (parameterDefinition, i) => {
        if (
            isObject(parameterDefinition) &&
            parameterDefinition.in === 'path' &&
            pathTemplates.indexOf(parameterDefinition.name) === -1
        ) {
            messages.addMessage(
            parameterDefinition.$$path || `paths.${pathName}.parameters[${i}]`,
            `Path parameter was defined but never used: ${
                parameterDefinition.name
            }`,
            'error'
            );
        }
        });

        if (pathTemplates) {
        pathTemplates.forEach(parameter => {
            // Assertation 2

            if (parameter === '') {
            // it was originally "{}"
            messages.addMessage(
                `paths.${pathName}`,
                'Empty path parameter declarations are not valid',
                'error'
            );
            }
        });
        } else {
        each(availableParameters, (parameterDefinition, i) => {
            // Assertation 1, for cases when no templating is present on the path
            if (parameterDefinition.in === 'path') {
            messages.addMessage(
                `paths.${pathName}.parameters[${i}]`,
                `Path parameter was defined but never used: ${
                parameterDefinition.name
                }`,
                'error'
            );
            }
        });
        }
    });
  }

  return messages;
};
