/**
* CodeCheckLog.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

    schema: true,

    attributes: {
        code: {
            type: string,
            required: true,
            unique: true
        },
        updated_at: {
            type: date,
            required: true
        },
        randNum: {
            type: string,
            required: true
        },
        times: {
            type: integer,
            required: true
        },
        toJSON: function () {
            var obj = this.toObject();
            return obj;
        }
    }
};
