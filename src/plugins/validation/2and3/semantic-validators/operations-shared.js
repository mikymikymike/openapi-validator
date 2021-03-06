// Assertations

// Operations must have unique (name + in combination) parameters.

// Operations must have a non-empty `operationId`

// `operationId` should adhere to a given case convention

// Operations must have a non-empty `summary` field.

// Arrays MUST NOT be returned as the top-level structure in a response body.
// ref: https://pages.github.ibm.com/CloudEngineering/api_handbook/fundamentals/format.html#object-encapsulation

// All required parameters of an operation are listed before any optional parameters.
// http://watson-developer-cloud.github.io/api-guidelines/swagger-coding-style#parameter-order

// Assertation :
// check header names in "encoding" object

const pick = require('lodash/pick');
const map = require('lodash/map');
const each = require('lodash/each');
const findIndex = require('lodash/findIndex');
const { checkCase, hasRefProperty } = require('../../../utils');
const MessageCarrier = require('../../../utils/messageCarrier');
const headerNameChecker = require('../../../utils/headerNameChecker');

module.exports.validate = function({ jsSpec, resolvedSpec, isOAS3 }, config) {
  const messages = new MessageCarrier();

  configOperations = config.operations;

  let checkHeaderWithX = 'off';
  let headerCaseConventionValue;
  let checkHeaderCaseConvention = 'off';
  if (config.common) {
    checkHeaderWithX = config.common.header_starting_with_x;
    if (config.common.header_name_case_convention && Array.isArray(config.common.header_name_case_convention)) {
      checkHeaderCaseConvention = config.common.header_name_case_convention[0];
      if (checkHeaderCaseConvention !== 'off') {
        headerCaseConventionValue = config.common.header_name_case_convention[1];
      }
    }
  }

  const globalTags = resolvedSpec.tags || [];
  const hasGlobalTags = !!globalTags.length;
  const resolvedTags = globalTags.map(({ name }) => name);
  const unusedTags = new Set(resolvedTags);

  map(resolvedSpec.paths, (path, pathKey) => {
    if (pathKey.slice(0, 2) === 'x-') {
      return;
    }
    const pathOps = pick(path, [
      'get',
      'head',
      'post',
      'put',
      'patch',
      'delete',
      'options',
      'trace'
    ]);

    each(pathOps, (op, opKey) => {
      if (!op || op['x-sdk-exclude'] === true) {
        return;
      }

      // check for operations that have a $ref property
      // these are illegal in the spec
      if (hasRefProperty(jsSpec, ['paths', pathKey, opKey])) {
        messages.addTypedMessage(
          `paths.${pathKey}.${opKey}.$ref`,
          '$ref found in illegal location',
          'error',
          'structural'
        );
      }

      // check for unique name/in properties in params
      each(op.parameters, (param, paramIndex) => {
        const nameAndInComboIndex = findIndex(op.parameters, {
          name: param.name,
          in: param.in
        });
        // comparing the current index against the first found index is good, because
        // it cuts down on error quantity when only two parameters are involved,
        // i.e. if param1 and param2 conflict, this will only complain about param2.
        // it also will favor complaining about parameters later in the spec, which
        // makes more sense to the user.
        if (paramIndex !== nameAndInComboIndex) {
          messages.addTypedMessage(
            `paths.${pathKey}.${opKey}.parameters[${paramIndex}]`,
            "Operation parameters must have unique 'name' + 'in' properties",
            'error',
            'structural'
          );
        }
      });

      // Arrays MUST NOT be returned as the top-level structure in a response body.
      const checkStatusArrRes = configOperations.no_array_responses;
      if (checkStatusArrRes !== 'off') {
        each(op.responses, (response, name) => {
          if (isOAS3) {
            each(response.content, (content, contentType) => {
              const isArray =
                content.schema &&
                (content.schema.type === 'array' || content.schema.items);

              if (isArray) {
                messages.addTypedMessage(
                  `paths.${pathKey}.${opKey}.responses.${name}.content.${contentType}.schema`,
                  'Arrays MUST NOT be returned as the top-level structure in a response body (create an object with data and metadata for collection, except if collection contains less than 50 items).',
                  checkStatusArrRes,
                  'no_array_responses',
                  'structural',
                  'CTMO.STANDARD-CODAGE-16'
                );
              }
            });
          } else {
            const isArray =
              response.schema &&
              (response.schema.type === 'array' || response.schema.items);

            if (isArray) {
              messages.addTypedMessage(
                `paths.${pathKey}.${opKey}.responses.${name}.schema`,
                'Arrays MUST NOT be returned as the top-level structure in a response body (create an object with data and metadata for collection, except if collection contains less than 50 items).',
                checkStatusArrRes,
                'no_array_responses',
                'structural',
                'CTMO.STANDARD-CODAGE-16'
              );
            }
          }
        });
      }
      
      //check header names in encoding object in oas3
      if (isOAS3 === true) {
        if (op.requestBody) {
            const requestBodyContent = op.requestBody.content;
            const requestBodyMimeTypes =
                op.requestBody.content && Object.keys(requestBodyContent);
            if (requestBodyContent &&requestBodyMimeTypes.length) {
                for (const mimeType of requestBodyMimeTypes) {
                    const requestBodyContentDefinition = requestBodyContent[mimeType];

                    if (requestBodyContentDefinition.encoding) {
                        const encodedParameters = Object.keys(requestBodyContentDefinition.encoding);
                        encodedParameters.forEach(encodedParameterName => {
                            const encodedParameter = requestBodyContentDefinition.encoding[encodedParameterName];
                            if (encodedParameter.headers) {
                                const parameterHeaders = Object.keys(encodedParameter.headers);
                                parameterHeaders.forEach(paramHeaderName => {
                                    headerNameChecker.checkHeaderName(paramHeaderName, checkHeaderCaseConvention, headerCaseConventionValue, checkHeaderWithX, 
                                        ['paths', pathKey, opKey, 'requestBody', 'content', mimeType, 'encoding', encodedParameterName, 'headers', paramHeaderName],
                                        messages);
                                });
                            }
                        });
                    }
                }
            }
        }
      }

      const hasOperationId =
        op.operationId &&
        op.operationId.length > 0 &&
        !!op.operationId.toString().trim();
      if (!hasOperationId) {
        messages.addTypedMessage(
          `paths.${pathKey}.${opKey}.operationId`,
          'Operations must have a non-empty `operationId`.',
          configOperations.no_operation_id,
          'no_operation_id',
          'structural'
        );
      } else {
        // check operationId for case convention
        const checkStatus = configOperations.operation_id_case_convention[0];
        const caseConvention = configOperations.operation_id_case_convention[1];
        const isCorrectCase = checkCase(op.operationId, caseConvention);
        if (!isCorrectCase) {
          messages.addTypedMessage(
            `paths.${pathKey}.${opKey}.operationId`,
            `operationIds must follow case convention: ${checkCase.getCaseConventionExample(caseConvention)}.`,
            checkStatus,
            'operation_id_case_convention',
            'convention'
          );
        }
      }
      const hasOperationTags = op.tags && op.tags.length > 0;
      if (hasOperationTags && hasGlobalTags) {
        for (let i = 0, len = op.tags.length; i < len; i++) {
          if (!resolvedTags.includes(op.tags[i])) {
            messages.addTypedMessage(
              `paths.${pathKey}.${opKey}.tags`,
              'Operation tag is not defined at the global level: ' + op.tags[i],
              configOperations.undefined_tag,
              'undefined_tag',
              'structural'
            );
          } else {
            unusedTags.delete(op.tags[i]);
          }
        }
      }

      const hasSummary =
        op.summary && op.summary.length > 0 && !!op.summary.toString().trim();
      const hasDescription =
        op.description && op.description.length > 0 && !!op.description.toString().trim();
      if (configOperations.no_summary != 'off') {
        if (!hasSummary) {
          messages.addTypedMessage(
            `paths.${pathKey}.${opKey}.summary`,
            'Operations must have a non-empty `summary` field.',
            configOperations.no_summary,
            'no_summary',
            'documentation'
          );
        }
      }

      if (configOperations.neither_description_nor_summary != 'off') {
        if (!hasSummary && !hasDescription) {
          messages.addTypedMessage(
            `paths.${pathKey}.${opKey}`,
            'Operations must have a non-empty `summary` field or a non-empty `description` field.',
            configOperations.neither_description_nor_summary,
            'neither_description_nor_summary',
            'documentation'
          );
        }
      }

      // this should be good with resolved spec, but double check
      // All required parameters of an operation are listed before any optional parameters.
      const checkStatusParamOrder = configOperations.parameter_order;
      if (checkStatusParamOrder !== 'off') {
        if (op.parameters && op.parameters.length > 0) {
          let firstOptional = -1;
          for (let indx = 0; indx < op.parameters.length; indx++) {
            const param = op.parameters[indx];
            if (firstOptional < 0) {
              if (!param.required) {
                firstOptional = indx;
              }
            } else {
              if (param.required) {
                messages.addTypedMessage(
                  `paths.${pathKey}.${opKey}.parameters[${indx}]`,
                  'Required parameters should appear before optional parameters.',
                  checkStatusParamOrder,
                  'parameter_order',
                  'convention'
                );
              }
            }
          }
        }
      }
    });
  });

  unusedTags.forEach(tagName => {
    messages.addTypedMessage(
      `tags`,
      `A tag is defined but never used: ${tagName}`,
      configOperations.unused_tag,
      'unused_tag',
      'convention'
    );
  });

  return messages;
};
