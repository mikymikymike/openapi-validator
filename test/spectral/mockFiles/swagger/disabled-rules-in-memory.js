module.exports = {
  swagger: '2.0',
  info: {
    version: '1.0.0',
    title: 'Swagger Petstore',
    termsOfService: 'http://swagger.io/terms/',
    contact: {
    	email: 'test@test.com',
    	name: 'toto'
    }
  },
  host: 'petstore.swagger.io',
  basePath: '/v2',
  tags: [
    {
      name: 'pet',
      description: 'Everything about your Pets',
      externalDocs: { description: 'Find out more', url: 'http://swagger.io' }
    },
    {
      name: 'animal',
      description: 'Everything about your Pets',
      externalDocs: { description: 'Find out more', url: 'http://swagger.io' }
    }
  ],
  schemes: ['http'],
  paths: {
    '/pet': {
      post: {
        tags: ['pet'],
        summary: 'Add a new pet to the store',
        description: 'post a pet to store',
        operationId: 'add pet',
        consumes: ['application/json', 'application/xml'],
        produces: ['application/xml', 'application/json'],
        parameters: [
          {
            in: 'body',
            name: 'body',
            description: 'Pet object that needs to be added to the store',
            required: true,
            schema: { $ref: '#/definitions/Pet' }
          }
        ],
        responses: { '405': { description: 'Invalid input' } },
        security: [{ petstore_auth: ['write:pets', 'read:pets'] }]
      },
      put: {
        tags: ['pet'],
        summary: 'Update an existing pet',
        description: 'put new data for existing pet',
        operationId: 'add_pet',
        consumes: ['application/json', 'application/xml'],
        produces: ['application/xml', 'application/json'],
        parameters: [
          {
            in: 'body',
            name: 'body',
            required: true,
            schema: { $ref: '#/definitions/Pet' }
          }
        ],
        responses: {
          '400': { description: 'Invalid ID supplied' },
          '404': { description: 'Pet not found' },
          '405': { description: 'Validation exception' },
          default: { description: 'Error' }
        },
        security: [{ petstore_auth: ['write:pets', 'read:pets'] }]
      }
    },
    '/anotherpet': {
      post: {
        tags: ['pet'],
        summary: 'Add a new pet to the store',
        description: 'post a pet to store',
        operationId: 'add_pet',
        consumes: ['application/json', 'application/xml'],
        produces: ['application/xml', 'application/json'],
        parameters: [
          {
            in: 'body',
            name: 'body',
            description: 'Pet object that needs to be added to the store',
            required: true,
            schema: { $ref: '#/definitions/Pet' }
          }
        ],
        responses: {
          '405': { description: 'Invalid input' },
          default: { description: 'Invalid input' }
        },
        security: [{ petstore_auth: ['write:pets', 'read:pets'] }]
      }
    },
    '/path1': {
      post: {
        summary: 'path one',
        description: 'operation with form data',
        operationId: 'form_data',
        tags: ['pet'],
        consumes: ['application/xml'],
        produces: ['application/xml', 'application/json'],
        parameters: [
          {
            in: 'formData',
            name: 'body',
            description: 'Pet object that needs to be added to the store',
            required: true,
            schema: { type: 'file' }
          }
        ],
        responses: {
          '405': { description: 'Invalid input' },
          default: { description: 'Invalid input' }
        },
        security: [{ apikey: ['write:pets'] }]
      }
    },
    '/pet/find_by_status/path?query=true': {
      get: {
        tags: ['pet'],
        summary: 'Finds Pets by status',
        description:
          'Multiple status values can be provided with comma separated strings',
        produces: ['application/xml', 'application/json'],
        parameters: [
          {
            name: 'status',
            in: 'query',
            description: 'Status values that need to be considered for filter',
            required: true,
            type: 'array',
            items: {
              type: 'string',
              enum: ['available', 'pending', 'sold'],
              default: 'available'
            },
            collectionFormat: 'multi'
          },
          {
            name: 'status',
            in: 'query',
            description: 'Status values that need to be considered for filter',
            required: true,
            type: 'array',
            items: {
              type: 'string',
              enum: ['available', 'pending', 'sold'],
              default: 'available'
            },
            collectionFormat: 'multi'
          }
        ],
        responses: {
          '200': {
            description: 'successful operation',
            schema: { $ref: '#/definitions/InlineResponse200' }
          },
          '400': { description: 'Invalid status value' },
          default: { description: 'Error' }
        },
        security: [{ petstore_auth: ['write:pets', 'read:pets'] }]
      }
    },
    '/given/{}': {
      post: {
        summary: 'bad path',
        description: 'Operation with a bad path',
        operationId: 'update_path',
        tags: ['pet'],
        consumes: ['application/json', 'application/xml'],
        produces: ['application/xml', 'application/json'],
        parameters: [
          {
            in: 'body',
            name: 'body',
            description: 'Pet object that needs to be added to the store',
            required: true,
            schema: { type: 'object' }
          }
        ],
        responses: {
          '405': { description: 'Invalid input' },
          default: { description: 'Invalid input' }
        }
      }
    }
  },
  securityDefinitions: {
    petstore_auth: {
      type: 'oauth2',
      authorizationUrl: 'http://petstore.swagger.io/oauth/dialog',
      flow: 'implicit',
      scopes: {
        'write:pets': 'modify pets in your account',
        'read:pets': 'read your pets'
      }
    }
  },
  definitions: {
    InlineResponse200: {
      type: 'object',
      description: 'string',
      properties: {
        pets: {
          type: 'array',
          description: 'list of pets',
          items: { $ref: '#/definitions/Pet' }
        }
      }
    },
    Category: {
      type: 'object',
      description: 'string',
      properties: {
        id: { type: 'integer', format: 'int64', description: 'string' },
        name: { type: 'string', description: 'string' }
      },
      xml: { name: 'Category' }
    },
    Tag: {
      type: 'object',
      description: 'string',
      properties: {
        id: { type: 'integer', format: 'int64', description: 'string' },
        name: { type: 'string', description: 'string' }
      },
      xml: { name: 'Tag' }
    },
    Sibling: {
      $ref: '#/definitions/Category',
      examples: null,
      an_example: { name: 'something' }
    },
    Pet: {
      type: 'object',
      description: 'string',
      required: ['name', 'photo_urls'],
      properties: {
        id: { type: 'integer', format: 'int64', description: 'string' },
        category: { $ref: '#/definitions/Category' },
        name: { type: 'string', example: 'doggie', description: 'string' },
        photo_urls: {
          type: 'array',
          description: 'string',
          xml: { name: 'photo_url', wrapped: true },
          items: { type: 'string' }
        },
        tags: {
          type: 'array',
          description: 'string',
          pattern: '^http(s)?:\\/\\/([^\\/?#]*)([^?#]*)(\\?([^#]*))?(#(.*))?$',
          xml: { name: 'tag', wrapped: true },
          items: { $ref: '#/definitions/Tag' }
        },
        status: {
          type: 'string',
          description: 'pet status in the store',
          enum: ['available', 'pending', 'sold']
        }
      },
      xml: { name: 'Pet' }
    }
  },
  externalDocs: {
    description: 'Find out more about Swagger',
    url: 'http://swagger.io'
  }
};
