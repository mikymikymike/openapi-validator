const expect = require('expect');
const {
  validate
} = require('../../../../src/plugins/validation/swagger2/semantic-validators/form-data');

describe('validation plugin - semantic - form data', function() {
  describe('/parameters/...', function() {

    describe('typo in formdata', function() {
      it('should warn about formdata ( typo )', function() {
        const spec = {
          parameters: {
            CoolParam: [{ in: 'formdata' }],
            queryParam: [{ in: 'formData' }],
            testParam: [{ in: 'query' }]
          }
        };

        const res = validate({ resolvedSpec: spec });
        expect(res.errors.length).toEqual(1);
        expect(res.errors[0].message).toEqual(
          'The form data value for `in` must be camelCase (formData)'
        );
        expect(res.errors[0].path).toEqual('parameters.CoolParam.0');
      });
    });
  });

  describe('/paths/...', function() {
    describe('typo in formdata', function() {
      it('should warn about formdata ( typo )', function() {
        const spec = {
          paths: {
            '/some': {
              post: {
                parameters: [{ in: 'formdata' }]
              }
            }
          }
        };

        const res = validate({ resolvedSpec: spec });
        expect(res.errors.length).toEqual(1);
        expect(res.errors[0].message).toEqual(
          'The form data value for `in` must be camelCase (formData)'
        );
        expect(res.errors[0].path).toEqual('paths./some.post.parameters.0');
      });
    });

    // Already covered in validators/operations.js
    describe('in: formdata + in: body', function() {
      it('should complain about having both in the same parameter', function() {
        const spec = {
          paths: {
            '/some': {
              post: {
                consumes: ['multipart/form-data'],
                parameters: [
                  { in: 'query' },
                  { in: 'body' },
                  { in: 'formData' }
                ]
              }
            }
          }
        };

        const res = validate({ resolvedSpec: spec });
        expect(res.errors.length).toEqual(1);
        expect(res.errors[0].message).toEqual(
          'Parameters cannot have `in` values of both "body" and "formData", as "formData" _will_ be the body'
        );
        expect(res.errors[0].path).toEqual('paths./some.post.parameters.1');
      });
    });

    describe('missing consumes', function() {
      it("should complain if 'type:file` and no 'in: formData", function() {
        const spec = {
          paths: {
            '/some': {
              post: {
                consumes: ['multipart/form-data'],
                parameters: [
                  {
                    type: 'file'
                  }
                ]
              }
            }
          }
        };

        const res = validate({ resolvedSpec: spec });
        expect(res.errors.length).toEqual(1);
        expect(res.errors[0].message).toEqual(
          'Parameters with `type` "file" must have `in` be "formData"'
        );
        expect(res.errors[0].path).toEqual('paths./some.post.parameters.0');
      });

      it("should complain if 'type:file` and no consumes - 'multipart/form-data'", function() {
        const spec = {
          paths: {
            '/some': {
              post: {
                parameters: [
                  {
                    in: 'formData',
                    type: 'file'
                  }
                ]
              }
            }
          }
        };

        const res = validate({ resolvedSpec: spec });
        expect(res.errors.length).toEqual(1);
        expect(res.errors[0].message).toEqual(
          'Operations with Parameters of `type` "file" must include "multipart/form-data" in their "consumes" property'
        );
        expect(res.errors[0].path).toEqual('paths./some.post.parameters.0');
      });

      it("should complain if 'in:formData` and no consumes - 'multipart/form-data' or 'application/x-www-form-urlencoded'", function() {
        const spec = {
          paths: {
            '/some': {
              post: {
                parameters: [
                  {
                    in: 'formData'
                  }
                ]
              }
            }
          }
        };

        const res = validate({ resolvedSpec: spec });
        expect(res.errors.length).toEqual(1);
        expect(res.errors[0].message).toEqual(
          'Operations with Parameters of `in` "formData" must include "application/x-www-form-urlencoded" or "multipart/form-data" in their "consumes" property'
        );
        expect(res.errors[0].path).toEqual('paths./some.post');
      });
    });
  });

  describe('/pathitems/...', function() {
    it("should complain if 'type:file` and no 'in: formData", function() {
      const spec = {
        pathitems: {
          SomePathItem: {
            consumes: ['multipart/form-data'],
            parameters: [
              {
                type: 'file'
              }
            ]
          }
        }
      };

      const res = validate({ resolvedSpec: spec });
      expect(res.errors.length).toEqual(1);
      expect(res.errors[0].message).toEqual(
        'Parameters with `type` "file" must have `in` be "formData"'
      );
      expect(res.errors[0].path).toEqual('pathitems.SomePathItem.parameters.0');
    });

    it("should complain if 'type:file` and no consumes - 'multipart/form-data'", function() {
      const spec = {
        pathitems: {
          SomePathItem: {
            parameters: [
              {
                in: 'formData',
                type: 'file'
              }
            ]
          }
        }
      };

      const res = validate({ resolvedSpec: spec });
      expect(res.errors.length).toEqual(1);
      expect(res.errors[0].message).toEqual(
        'Operations with Parameters of `type` "file" must include "multipart/form-data" in their "consumes" property'
      );
      expect(res.errors[0].path).toEqual('pathitems.SomePathItem.parameters.0');
    });
  });
});
