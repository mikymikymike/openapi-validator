/*
    **********   DO NOT MODIFY THIS FILE   **********


    To configure the validator, edit the '.validaterc'
    file in the root folder of this project.

    This file contains the defaults rules for the
    validator. It is used to check for errors in
    the .validaterc file and for running the
    validator in default mode.

    NOTE: If you are contributing a validation to this code
    base, you should add the default rule to this object.
    In that case, please modify this file.

    Additionally, if a rule is being deprecated and/or replaced,
    this file must be modified (see bottom of file).
*/

const defaults = {
  'shared': {
    'common': {
        'data_extensions': 'off',
        'version_in_path': 'off'
    },
    'info': {
        'no_description': 'off',
        'version_regex_rule': 'off',
        'contact_email_domain': ['off', 'none']
    },
    'operations': {
      'no_operation_id': 'warning',
      'operation_id_case_convention': ['warning', 'lower_snake_case'],
      'no_summary': 'warning',
      'neither_description_nor_summary': 'off',
      'no_array_responses': 'error',
      'parameter_order': 'warning',
      'undefined_tag': 'warning',
      'unused_tag': 'warning',
      'operation_id_naming_convention': 'warning'
    },
    'pagination': {
      'pagination_style': 'warning'
    },
    'parameters': {
      'no_parameter_description': 'error',
      'param_name_case_convention': ['error', 'lower_snake_case'],
      'param_name_alternative_case_convention': ['off', 'lower_snake_case'],
      'invalid_type_format_pair': 'error',
      'content_type_parameter': 'error',
      'accept_type_parameter': 'error',
      'authorization_parameter': 'warning',
      'required_param_has_default': 'warning'
    },
    'paths': {
      'missing_path_parameter': 'error',
      'duplicate_path_parameter': 'warning',
      'snake_case_only': 'off',
      'alternate_resources_and_identifiers': 'off',
      'path_segments_with_s': 'off',
      'path_ending_with_slash': 'off',
      'max_path_levels': [
        'off',
        6
      ],
      'paths_case_convention': ['error', 'lower_snake_case'],
      'paths_alternative_case_convention': ['off', 'lower_snake_case']
    },
    'responses': {
      'inline_response_schema': 'warning'
    },
    'security_definitions': {
      'unused_security_schemes': 'warning',
      'unused_security_scopes': 'warning'
    },
    'security': {
      'invalid_non_empty_security_array': 'error'
    },
    'schemas': {
      'invalid_type_format_pair': 'error',
      'snake_case_only': 'off',
      'no_schema_description': 'warning',
      'no_property_description': 'warning',
      'description_mentions_json': 'warning',
      'array_of_arrays': 'warning',
      'inconsistent_property_type': 'warning',
      'property_case_convention': [ 'error', 'lower_snake_case'],
      'property_alternative_case_convention': [ 'off', 'lower_camel_case'],
      'property_case_collision': 'error',
      'enum_case_convention': [ 'warning', 'lower_snake_case'],
      'undefined_required_properties': 'warning'
    },
    'walker': {
      'no_empty_descriptions': 'error',
      'has_circular_references': 'warning',
      '$ref_siblings': 'off',
      'duplicate_sibling_description': 'warning',
      'incorrect_ref_pattern': 'warning'
    }
  },
  'swagger2': {
    'operations': {
      'no_consumes_for_put_or_post': 'error',
      'get_op_has_consumes': 'warning',
      'no_produces': 'warning',
      'content_not_in_json': 'off'
    }
  },
  'oas3': {
    'operations': {
      'no_request_body_content': 'error',
      'no_request_body_name': 'warning',
      'content_not_in_json': 'off'
    },
    'parameters': {
      'no_in_property': 'error',
      'invalid_in_property': 'error',
      'missing_schema_or_content': 'error',
      'has_schema_and_content': 'error'
    },
    'responses': {
      'no_response_codes': 'error',
      'no_success_response_codes': 'warning',
      'no_response_body': 'warning',
      'ibm_status_code_guidelines': 'warning'
    },
    'schemas': {
      'json_or_param_binary_string': 'warning'
    }
  },
  'spectral': {
    'rules': {
      'no-eval-in-markdown': "warning",
      'no-script-tags-in-markdown': "warning",
      'openapi-tags': "warning",
      'operation-description': "warning",
      'operation-tags': "warning",
      'operation-tag-defined': "warning",
      'path-keys-no-trailing-slash': "warning",
      'typed-enum': "warning",
      'oas2-api-host': "warning",
      'oas2-api-schemes': "warning",
      'oas2-host-trailing-slash': "warning",
      'oas2-valid-example': "warning",
      'oas2-valid-definition-example': "error",
      'oas2-anyOf': "warning",
      'oas2-oneOf': "warning",
      'oas3-api-servers': "warning",
      'oas3-examples-value-or-externalValue': "warning",
      'oas3-server-trailing-slash': "warning",
      'oas3-valid-example': "error",
      'oas3-valid-schema-example': "error"
    }
  }
};

// Put deprecated rules here. If the rule was replaced by a new one,
// add that as a string property. If not, make the property an empty string.
// Example:
/*
{
  'replaced_rule': 'new_rule',
  'unreplaced_rule': '
}
*/
const deprecated = {
  'no_produces_for_get': 'no_produces',
  'parameters.snake_case_only': 'param_name_case_convention'
};

const configOptions = {
  'case_conventions': [
    'lower_snake_case', // lower_snake_case
    'upper_snake_case', // UPPER_SNAKE_CASE
    'all_snake_case', // lower_snake_case ou UPPER_SNAKE_CASE
    'upper_camel_case', // UpperCamelCase
    'lower_camel_case', // lowerCamelCase
    'all_camel_case', // UpperCamelCase ou lowerCamelCase
    'k8s_camel_case', // kubernetesAPICamelCase
    'k8s_upper_camel_case', // UpperKubernetesAPICamelCase
    'k8s_all_camel_case', // kubernetesAPICamelCase ou KubernetesAPICamelCase
    'lower_dash_case', 'lower_spinal_case', // lower-spinal-case
    'upper_dash_case', 'upper_spinal_case', // UPPER-SPINAL-CASE
    'all_dash_case', 'all_spinal_case' // lower-spinal-case ou UPPER-SPINAL-CASE
  ]
};


module.exports.defaults = defaults;
module.exports.deprecated = deprecated;
module.exports.options = configOptions;
