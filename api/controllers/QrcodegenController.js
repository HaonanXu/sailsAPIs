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
    // after combine md5 and string, insert into mongodb
    var md5 = require('md5');
    for(var k in codes) {
      codes[k] = md5(k) + k;
      Qrcodegen
        .create(
        {number:k, code:codes[k]})
        .exec(function createCB(err,created){
          if(err){
            console.log('err');
            //res.jsonx();
          } else {
            console.log('succ');
            //res.jsonx()
          }
        });
    }

    //TODO: insert into table
    res.send('RUN SUCC');

  },

  codeParser: function (req,res) {
    var enCode = req.param('code');
    var decrypter = require("crypto-js");
    var salt = '1q2w3e4rABC';
    try{
       var code = decrypter.TripleDES.decrypt(enCode, salt);
    }
    catch(err){
      res.json({success: false});
    }
    var result = '';

    function hex2str() {
      var hex = code.toString();
      res.json({success: hex.length});
      if (hex.length % 2) {
        res.json({success:false});
      }
      for (var i = 0; i < hex.length; i+=2) {
        result += String.fromCharCode(parseInt(hex.substr(i,2), 16));
      }
      return result;
    }

    //TODO: Check if the result exists in db, then return a flag

    //var options = {
    //  code: hex2str()
    //};

    //Qrcodegen.findOne(options, function(err, code) {
    //  if (code === undefined) return res.notFound();
    //  if (err) return next(err);
    //  res.json({success: true});
    //});



    res.send(hex2str());
  },



  tester: function (req, res) {
    var encrypter = require("crypto");
    //var algorithm =
    var code = '1234sad';
    var salt = '1q2w3e4rABC';
    var result = encrypter.TripleDES.encrypt(code, salt);

    res.send(result.toString());
  },

};

