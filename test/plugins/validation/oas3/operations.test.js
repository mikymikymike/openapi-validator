const expect = require('expect');
const {
  validate
} = require('../../../../src/plugins/validation/oas3/semantic-validators/operations');
const configOas3 = require('../../../../src/.defaultsForValidator').defaults.oas3;

describe('validation plugin - semantic - operations - oas3', function() {

  it('should complain about a request body not having a content field', function() {
    const spec = {
      paths: {
        '/pets': {
          post: {
            summary: 'this is a summary',
            operationId: 'operationId',
            requestBody: {
              description: 'body for request'
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec, jsSpec: spec }, configOas3);
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].path).toEqual('paths./pets.post.requestBody');
    expect(res.errors[0].message).toEqual(
      'Request bodies MUST specify a `content` property'
    );
    expect(res.warnings.length).toEqual(0);
  });

  it('should warn about an operation with a non-form, array schema request body that does not set a name', function() {
    const spec = {
      paths: {
        '/pets': {
          post: {
            summary: 'this is a summary',
            operationId: 'operationId',
            requestBody: {
              description: 'body for request',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          },
          patch: {
            'x-sdk-exclude': true,
            summary: 'this is a summary',
            operationId: 'operationId',
            requestBody: {
              description: 'body for request',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec, jsSpec: spec }, configOas3);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].path).toEqual('paths./pets.post');
    expect(res.warnings[0].message).toEqual(
      'Operations with non-form request bodies should set a name with the x-codegen-request-body-name annotation.'
    );
    expect(res.errors.length).toEqual(0);
  });

  it('should not warn about an operation with a non-array application/json request body that does not set a name', function() {
    const spec = {
      paths: {
        '/pets': {
          post: {
            summary: 'this is a summary',
            operationId: 'operationId',
            requestBody: {
              description: 'body for request',
              content: {
                'application/json': {
                  schema: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec, jsSpec: spec }, configOas3);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors.length).toEqual(0);
  });

  it('should not warn about an operation with a non-array `+json` request body that does not set a name', function() {
    const spec = {
      paths: {
        '/pets': {
          post: {
            summary: 'this is a summary',
            operationId: 'operationId',
            requestBody: {
              description: 'body for request',
              content: {
                'application/merge-patch+json': {
                  schema: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec, jsSpec: spec }, configOas3);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors.length).toEqual(0);
  });

  it('should not warn about an operation with a non-form request body that sets a name', function() {
    const spec = {
      paths: {
        '/pets': {
          post: {
            'x-codegen-request-body-name': 'goodRequestBody',
            summary: 'this is a summary',
            operationId: 'operationId',
            requestBody: {
              description: 'body for request',
              content: {
                'application/json': {
                  schema: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec, jsSpec: spec }, configOas3);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors.length).toEqual(0);
  });

  it('should not warn about an operation with a form request body that does not set a name', function() {
    const spec = {
      paths: {
        '/pets': {
          post: {
            summary: 'this is a summary',
            operationId: 'operationId',
            requestBody: {
              description: 'body for request',
              content: {
                'multipart/form-data': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec, jsSpec: spec }, configOas3);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors.length).toEqual(0);
  });

  it('should not warn about an operation with a referenced request body that does not set a name', function() {
    const resolvedSpec = {
      paths: {
        '/pets': {
          post: {
            summary: 'this is a summary',
            operationId: 'operationId',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    };

    const jsSpec = {
      paths: {
        '/pets': {
          post: {
            summary: 'this is a summary',
            operationId: 'operationId',
            requestBody: {
              $ref: '#/components/requestBodies/SomeBody'
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec, jsSpec }, configOas3);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors.length).toEqual(0);
  });

  it('should not crash in request body name check when path name contains a period', function() {
    const spec = {
      paths: {
        '/other.pets': {
          post: {
            summary: 'this is a summary',
            operationId: 'operationId',
            requestBody: {
              description: 'body for request',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec, jsSpec: spec }, configOas3);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].path).toEqual('paths./other.pets.post');
    expect(res.warnings[0].message).toEqual(
      'Operations with non-form request bodies should set a name with the x-codegen-request-body-name annotation.'
    );
    expect(res.errors.length).toEqual(0);
  });

  it('should not crash when request body is behind a ref', function() {
    const jsSpec = {
      paths: {
        '/resource': {
          $ref: 'external.yaml#/some-path'
        }
      }
    };

    const resolvedSpec = {
      paths: {
        '/resource': {
          post: {
            operationId: 'create_resource',
            summary: 'simple operation',
            requestBody: {
              description: 'body',
              content: {
                'application/json': {
                  schema: {
                    type: 'string'
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'success'
              }
            }
          }
        }
      }
    };

    const res = validate({ jsSpec, resolvedSpec, isOAS3: true }, configOas3);
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(0);
  });

  it('should not complain about valid use of type:string, format: binary', function() {
    const spec = {
      paths: {
        '/pets': {
          post: {
            'x-codegen-request-body-name': 'goodRequestBody',
            summary: 'this is a summary',
            operationId: 'operationId',
            requestBody: {
              description: 'body for request',
              content: {
                'multipart/form-data': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        prop1: {
                          type: 'string',
                          format: 'binary'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec, jsSpec: spec }, configOas3);
    expect(res.warnings.length).toEqual(0);
  });

  it('should warn about application/json request body with type:string, format: binary', function() {
    const spec = {
      paths: {
        '/pets': {
          post: {
            'x-codegen-request-body-name': 'goodRequestBody',
            summary: 'this is a summary',
            operationId: 'operationId',
            requestBody: {
              description: 'body for request',
              content: {
                'application/json': {
                  schema: {
                    type: 'string',
                    format: 'binary'
                  }
                }
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec, jsSpec: spec }, configOas3);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].message).toEqual(
      'JSON request/response bodies should not contain binary (type: string, format: binary) values.'
    );
    expect(res.warnings[0].path).toEqual(
      'paths./pets.post.requestBody.content.application/json.schema'
    );
  });

  it('should warn about application/json request body with nested array of type:string, format: binary', function() {
    const spec = {
      paths: {
        '/pets': {
          post: {
            'x-codegen-request-body-name': 'goodRequestBody',
            summary: 'this is a summary',
            operationId: 'operationId',
            requestBody: {
              description: 'body for request',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'array',
                      items: {
                        type: 'array',
                        items: {
                          type: 'string',
                          format: 'binary'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec, jsSpec: spec }, configOas3);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].message).toEqual(
      'JSON request/response bodies should not contain binary (type: string, format: binary) values.'
    );
    expect(res.warnings[0].path).toEqual(
      'paths./pets.post.requestBody.content.application/json.schema.items.items.items'
    );
  });

  it('should warn about application/json request body with nested arrays of Objects with octet sequences', function() {
    const spec = {
      paths: {
        '/pets': {
          post: {
            'x-codegen-request-body-name': 'goodRequestBody',
            summary: 'this is a summary',
            operationId: 'operationId',
            requestBody: {
              description: 'body for request',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'array',
                      items: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            prop1: {
                              type: 'string',
                              format: 'binary'
                            },
                            prop2: {
                              type: 'string',
                              format: 'binary'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec, jsSpec: spec }, configOas3);
    expect(res.warnings.length).toEqual(2);
    expect(res.warnings[0].message).toEqual(
      'JSON request/response bodies should not contain binary (type: string, format: binary) values.'
    );
    expect(res.warnings[0].path).toEqual(
      'paths./pets.post.requestBody.content.application/json.schema.items.items.items.properties.prop1'
    );
    expect(res.warnings[1].message).toEqual(
      'JSON request/response bodies should not contain binary (type: string, format: binary) values.'
    );
    expect(res.warnings[1].path).toEqual(
      'paths./pets.post.requestBody.content.application/json.schema.items.items.items.properties.prop2'
    );
  });

  it('should warn about json with type: string, format: binary when json is the second mime type', function() {
    const spec = {
      paths: {
        '/pets': {
          post: {
            'x-codegen-request-body-name': 'goodRequestBody',
            summary: 'this is a summary',
            operationId: 'operationId',
            requestBody: {
              description: 'body for request',
              content: {
                'text/plain': {
                  schema: {
                    type: 'string'
                  }
                },
                'application/json': {
                  schema: {
                    type: 'string',
                    format: 'binary'
                  }
                }
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec, jsSpec: spec }, configOas3);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].message).toEqual(
      'JSON request/response bodies should not contain binary (type: string, format: binary) values.'
    );
    expect(res.warnings[0].path).toEqual(
      'paths./pets.post.requestBody.content.application/json.schema'
    );
  });

  it('should warn about json request body with nested arrays of Objects with prop of nested array type: string, format: binary', function() {
    const spec = {
      paths: {
        '/pets': {
          post: {
            'x-codegen-request-body-name': 'goodRequestBody',
            summary: 'this is a summary',
            operationId: 'operationId',
            requestBody: {
              description: 'body for request',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          prop1: {
                            type: 'array',
                            items: {
                              type: 'array',
                              items: {
                                type: 'string',
                                format: 'binary'
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec, jsSpec: spec }, configOas3);
    expect(res.warnings.length).toEqual(1);
    expect(res.warnings[0].message).toEqual(
      'JSON request/response bodies should not contain binary (type: string, format: binary) values.'
    );
    expect(res.warnings[0].path).toEqual(
      'paths./pets.post.requestBody.content.application/json.schema.items.items.properties.prop1.items.items'
    );
  });

  it('should warn about json request body with nested arrays of Objects with props of type Object that have props of type: string, format: binary', function() {
    const spec = {
      paths: {
        '/pets': {
          post: {
            'x-codegen-request-body-name': 'goodRequestBody',
            summary: 'this is a summary',
            operationId: 'operationId',
            requestBody: {
              description: 'body for request',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          prop1: {
                            type: 'object',
                            properties: {
                              sub_prop1: {
                                type: 'string',
                                format: 'binary'
                              },
                              sub_prop2: {
                                type: 'string',
                                format: 'binary'
                              }
                            }
                          },
                          prop2: {
                            type: 'object',
                            properties: {
                              sub_prop3: {
                                type: 'string',
                                format: 'binary'
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec, jsSpec: spec }, configOas3);
    expect(res.warnings.length).toEqual(3);
    expect(res.warnings[0].message).toEqual(
      'JSON request/response bodies should not contain binary (type: string, format: binary) values.'
    );
    expect(res.warnings[0].path).toEqual(
      'paths./pets.post.requestBody.content.application/json.schema.items.items.properties.prop1.properties.sub_prop1'
    );
    expect(res.warnings[1].message).toEqual(
      'JSON request/response bodies should not contain binary (type: string, format: binary) values.'
    );
    expect(res.warnings[1].path).toEqual(
      'paths./pets.post.requestBody.content.application/json.schema.items.items.properties.prop1.properties.sub_prop2'
    );
    expect(res.warnings[2].message).toEqual(
      'JSON request/response bodies should not contain binary (type: string, format: binary) values.'
    );
    expect(res.warnings[2].path).toEqual(
      'paths./pets.post.requestBody.content.application/json.schema.items.items.properties.prop2.properties.sub_prop3'
    );
  });

  it('should warn about json request body with nested arrays of Objects with props of type Object that have props of type: string, format: binary', function() {
    const spec = {
      paths: {
        '/pets': {
          post: {
            'x-codegen-request-body-name': 'goodRequestBody',
            summary: 'this is a summary',
            operationId: 'operationId',
            requestBody: {
              description: 'body for request',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          prop1: {
                            type: 'object',
                            properties: {
                              sub_prop1: {
                                type: 'string',
                                format: 'binary'
                              }
                            }
                          },
                          prop2: {
                            type: 'array',
                            items: {
                              type: 'string',
                              format: 'binary'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec, jsSpec: spec }, configOas3);
    expect(res.warnings.length).toEqual(2);
    expect(res.warnings[0].message).toEqual(
      'JSON request/response bodies should not contain binary (type: string, format: binary) values.'
    );
    expect(res.warnings[0].path).toEqual(
      'paths./pets.post.requestBody.content.application/json.schema.items.items.properties.prop1.properties.sub_prop1'
    );
    expect(res.warnings[1].message).toEqual(
      'JSON request/response bodies should not contain binary (type: string, format: binary) values.'
    );
    expect(res.warnings[1].path).toEqual(
      'paths./pets.post.requestBody.content.application/json.schema.items.items.properties.prop2.items'
    );
  });

  it('should not complain when json, or hal+json is used in request or response', function() {
    configOas3.operations.wrong_content_type = 'error';

    
    const spec = {
      paths: {
        '/pets': {
          post: {
            'x-codegen-request-body-name': 'goodRequestBody',
            summary: 'this is a summary',
            operationId: 'operationId',
            requestBody: {
              description: 'body for request',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          prop1: {
                            type: 'object',
                            properties: {
                              sub_prop1: {
                                type: 'string'
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                'application/hal+json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          prop1: {
                            type: 'object',
                            properties: {
                              sub_prop1: {
                                type: 'string'
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: 'body for request',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            prop1: {
                              type: 'object',
                              properties: {
                                sub_prop1: {
                                  type: 'string'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  'application/hal+json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            prop1: {
                              type: 'object',
                              properties: {
                                sub_prop1: {
                                  type: 'string'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec, jsSpec: spec }, configOas3);
    expect(res.warnings.length).toEqual(0);
    expect(res.errors.length).toEqual(0);
  });

  it('should complain warnings when text/json, or json with charset is used', function() {
    configOas3.operations.wrong_content_type = 'error';
    
    const spec = {
      paths: {
        '/pets': {
          post: {
            'x-codegen-request-body-name': 'goodRequestBody',
            summary: 'this is a summary',
            operationId: 'operationId',
            requestBody: {
              description: 'body for request',
              content: {
                'application/json;charset=UTF-8': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          prop1: {
                            type: 'object',
                            properties: {
                              sub_prop1: {
                                type: 'string'
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                'text/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          prop1: {
                            type: 'object',
                            properties: {
                              sub_prop1: {
                                type: 'string'
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: 'body for request',
                content: {
                  'text/json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            prop1: {
                              type: 'object',
                              properties: {
                                sub_prop1: {
                                  type: 'string'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  'application/json;charset=UTF-8': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            prop1: {
                              type: 'object',
                              properties: {
                                sub_prop1: {
                                  type: 'string'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec, jsSpec: spec }, configOas3);
    expect(res.errors.length).toEqual(0);
    expect(res.warnings.length).toEqual(4);
    expect(res.warnings[0].message).toEqual(`JSON Response Content-type must be 'application/json' or 'application/hal+json' or 'application/problem+json', without charset.`);
    expect(res.warnings[0].path).toEqual('paths./pets.post.responses.200.content.text/json');
    expect(res.warnings[1].message).toEqual(`JSON Response Content-type must be 'application/json' or 'application/hal+json' or 'application/problem+json', without charset.`);
    expect(res.warnings[1].path).toEqual('paths./pets.post.responses.200.content.application/json;charset=UTF-8');
    expect(res.warnings[2].message).toEqual(`JSON Request body Content-type must be 'application/json' or 'application/hal+json' or 'application/problem+json', without charset.`);
    expect(res.warnings[2].path).toEqual('paths./pets.post.requestBody.content.application/json;charset=UTF-8');
    expect(res.warnings[3].message).toEqual(`JSON Request body Content-type must be 'application/json' or 'application/hal+json' or 'application/problem+json', without charset.`);
    expect(res.warnings[3].path).toEqual('paths./pets.post.requestBody.content.text/json');
    expect(res.errors.length).toEqual(0);
  });

  it('should complain when text/json or xml is used', function() {
    configOas3.operations.wrong_content_type = 'error';
    
    const spec = {
      paths: {
        '/pets': {
          put: {
            'x-codegen-request-body-name': 'goodRequestBody',
            summary: 'this is a summary',
            operationId: 'operationId',
            requestBody: {
              description: 'body for request',
              content: {
                'text/html': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          prop1: {
                            type: 'object',
                            properties: {
                              sub_prop1: {
                                type: 'string'
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                'application/xml': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          prop1: {
                            type: 'object',
                            properties: {
                              sub_prop1: {
                                type: 'string'
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: 'body for request',
                content: {
                  'application/xml': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            prop1: {
                              type: 'object',
                              properties: {
                                sub_prop1: {
                                  type: 'string'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  'text/html': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            prop1: {
                              type: 'object',
                              properties: {
                                sub_prop1: {
                                  type: 'string'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const res = validate({ resolvedSpec: spec, jsSpec: spec }, configOas3);
    expect(res.errors.length).toEqual(2);
    
    expect(res.errors[0].message).toEqual(`Response Content-Type must be JSON ('application/json' or 'application/hal+json' or 'application/problem+json').`);
    expect(res.errors[0].path).toEqual('paths./pets.put.responses.200.content.text/html');
    expect(res.errors[1].message).toEqual(`Request body Content-Type must be JSON ('application/json' or 'application/hal+json' or 'application/problem+json').`);
    expect(res.errors[1].path).toEqual('paths./pets.put.requestBody.content.text/html');
    
    expect(res.warnings.length).toEqual(2);
    expect(res.warnings[0].message).toEqual(`Response Content-Type should be JSON ('application/json' or 'application/hal+json' or 'application/problem+json'), instead of other allowed content-types ('text/xml' or 'application/xml' or 'application/yaml' or 'text/csv' or 'text/plain' or 'application/pdf').`);
    expect(res.warnings[0].path).toEqual('paths./pets.put.responses.200.content.application/xml');
    expect(res.warnings[1].message).toEqual(`Request body Content-Type should be JSON ('application/json' or 'application/hal+json' or 'application/problem+json'), instead of other allowed content-types ('text/xml' or 'application/xml' or 'application/yaml' or 'text/csv' or 'text/plain' or 'application/pdf').`);
    expect(res.warnings[1].path).toEqual('paths./pets.put.requestBody.content.application/xml');

  });

});
