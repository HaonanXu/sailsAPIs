/**
 * QrcodegenController
 *
 * @description :: Server-side logic for managing qrcodegens
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {



  /**
   * `QrcodegenController.generator()`
   */
  generator: function (req, res) {

    // Get required code pool size
    var code_num = req.param('setsize');

    // Hashtable as code pool
    var codes = new Object();



    // Random number generator
    function generateNum(len) {
      var str = "",
        range = len,
        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

      for(var i=0; i<range; i++){
        pos = Math.round(Math.random() * (arr.length-1));
        str += arr[pos];
      }
      return str;
    }

    // Generate key and check if it's already exsits
    // If not, insert into hashtable
    // Else, re-generate
    for(var i = 0; i < code_num; ) {
      var randcode = generateNum(20);
      if (!codes.hasOwnProperty(randcode)) {
        codes[randcode] = 1;
        i++;
      }
    }

    // md5 encrypted then append to original code
    var md5 = require('md5');
    for(var k in codes) {
      codes[k] = k + md5(k);
    }


    //TODO: insert into table


    return res.send(codes);
  }
};

