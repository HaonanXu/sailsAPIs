/**
* Qrcodegen.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  schema: true,
  attributes: {
    number: {
      type: 'string',
      required: true,
      unique: true
    },
    code: {
      type: 'string',
      required: true,
      unique: true
    },
    toJSON: function () {
      var obj = this.toObject();
      return obj;
    }

  }
};

