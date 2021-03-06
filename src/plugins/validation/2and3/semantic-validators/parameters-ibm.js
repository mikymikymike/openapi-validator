// Assertation 1:
// Parameters must have descriptions, and parameter names must be snake_case

// Assertation 2:
// If parameters define their own format, they must follow the formatting rules.

// Assertation 3:
// Header parameters must not define a content-type or an accept-type.
// http://watson-developer-cloud.github.io/api-guidelines/swagger-coding-style#do-not-explicitly-define-a-content-type-header-parameter

const { checkCase, isParameterObject, walk } = require('../../../utils');
const headerNameChecker = require('../../../utils/headerNameChecker');
const MessageCarrier = require('../../../utils/messageCarrier');

const headerStartingWithXRegex = /^([xX])(([-_\.A-Z]))/;

module.exports.validate = function({ jsSpec, isOAS3 }, config) {
  const messages = new MessageCarrier();

  let checkHeaderCaseConvention = 'off';
  let headerCaseConventionValue;
  let checkHeaderWithX = 'off';
  if (config.common) {
    if (config.common.header_name_case_convention && Array.isArray(config.common.header_name_case_convention)) {
        checkHeaderCaseConvention = config.common.header_name_case_convention[0];
        if (checkHeaderCaseConvention !== 'off') {
            headerCaseConventionValue = config.common.header_name_case_convention[1];
        }
    }
    checkHeaderWithX = config.common.header_starting_with_x;
  }

  walk(jsSpec, [], function(obj, path) {
    // skip parameters within operations that are excluded
    if (obj['x-sdk-exclude'] === true) {
      return;
    }

    const contentsOfParameterObject = isParameterObject(path, isOAS3);

    if (contentsOfParameterObject) {
      // obj is a parameter object
      const isRef = !!obj.$ref;
      const hasDescription = !!obj.description;

      if (!hasDescription && !isRef) {
        messages.addTypedMessage(
          path,
          'Parameter objects must have a `description` field.',
          config.parameters.no_parameter_description,
          'no_parameter_description',
          'documentation',
          'D19.15'
        );
      }

      const isParameter = obj.in; // the `in` property is required by OpenAPI for parameters - this should be true (unless obj is a ref)
      const isHeaderParameter = obj.in && obj.in.toLowerCase() === 'header'; // header params need not be checked for case
      const isDeprecated = obj.deprecated === true;

      if (isParameter && !isRef && !isDeprecated) {
              
        if (isHeaderParameter) {
          //for header parameters
          headerNameChecker.checkHeaderName(obj.name, checkHeaderCaseConvention, headerCaseConventionValue, checkHeaderWithX, path, messages);

        } else {
          //for non header parameters
          const checkStatus = config.parameters.param_name_case_convention[0];

          if (checkStatus !== 'off') {
            const caseConvention = config.parameters.param_name_case_convention[1];        
            let checkAlternativeParameterCaseConvention = 'off';
            let caseConventionAlternative;
            if (config.parameters.param_name_alternative_case_convention) {
              checkAlternativeParameterCaseConvention = config.parameters.param_name_alternative_case_convention[0];
                if (checkAlternativeParameterCaseConvention != 'off') {
                    caseConventionAlternative = config.parameters.param_name_alternative_case_convention[1];
                }
            }
            
            // Relax snakecase check to allow names with "." and names like "filter[paramname]"
            let paramName = obj.name;
            paramName = paramName.replace('[','.');
            paramName = paramName.replace(']','.');
            const nameSegments = paramName.split('.');
            nameSegments.forEach(segment => {
                // the first element will be "" since pathName starts with "/"
                // also, ignore validating the path parameters
                if (segment !== '') {                
                  checkCase.checkCaseConventionOrAlternativeCase(segment, caseConvention, checkStatus, 
                    caseConventionAlternative, checkAlternativeParameterCaseConvention, 
                    messages, path, 'Parameter names', 
                    'param_name_case_convention', 'CTMO.STANDARD-CODAGE-19');
                }
            });
          }
        }

      }

      if (isParameter && isHeaderParameter) {
        // check for content-type defined in a header parameter (CT = content-type)
        const checkStatusCT = config.parameters.content_type_parameter;
        const definesContentType = obj.name.toLowerCase() === 'content-type';
        let messageCT = 'Parameters must not explicitly define `Content-Type`.';
        messageCT = isOAS3
          ? `${messageCT} Rely on the \`content\` field of a request body or response object to specify content-type.`
          : `${messageCT} Rely on the \`consumes\` field to specify content-type.`;
        if (definesContentType) {
          messages.addMessage(
            path,
            messageCT,
            checkStatusCT,
            'content_type_parameter'
          );
        }

        // check for accept-type defined in a header parameter (AT = accept-type)
        const checkStatusAT = config.parameters.accept_type_parameter;
        const definesAcceptType = obj.name.toLowerCase() === 'accept';
        let messageAT = 'Parameters must not explicitly define `Accept`.';
        messageAT = isOAS3
          ? `${messageAT} Rely on the \`content\` field of a response object to specify accept-type.`
          : `${messageAT} Rely on the \`produces\` field to specify accept-type.`;
        if (definesAcceptType) {
          messages.addMessage(
            path,
            messageAT,
            checkStatusAT,
            'accept_type_parameter'
          );
        }

        // check for Authorization defined in a header parameter
        const checkStatusAuth = config.parameters.authorization_parameter;
        const definesAuth = obj.name.toLowerCase() === 'authorization';
        let messageAuth =
          'Parameters must not explicitly define `Authorization`.';
        messageAuth = isOAS3
          ? `${messageAuth} Rely on the \`securitySchemes\` and \`security\` fields to specify authorization methods.`
          : `${messageAuth} Rely on the \`securityDefinitions\` and \`security\` fields to specify authorization methods.`;
        // temporary message to alert users of pending status change
        if (checkStatusAuth === 'warning') {
          messageAuth =
            messageAuth +
            ' This check will be converted to an `error` in an upcoming release.';
        }
        if (definesAuth) {
          messages.addMessage(
            path,
            messageAuth,
            checkStatusAuth,
            'authorization_parameter'
          );
        }
      }

      const isParameterRequired = obj.required;
      let isDefaultDefined;
      if (isOAS3) {
        isDefaultDefined = obj.schema && obj.schema.default !== undefined;
      } else {
        isDefaultDefined = obj.default !== undefined;
      }

      if (isParameterRequired && isDefaultDefined) {
        messages.addMessage(
          path,
          'Required parameters should not specify default values.',
          config.parameters.required_param_has_default,
          'required_param_has_default'
        );
      }
    }
  });

  return messages;
};
