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
            console.log(err);
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
    var decrypter = require("crypto");
    var key = new Buffer("abcdefgh");
    var iv = new Buffer([0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF]);
    try{
      var decipher = decrypter.createDecipheriv('des',key,iv);
      var result = decipher.update(enCode,'hex','utf8');
      result += decipher.final('utf8');
    }
    catch(err){
      res.json({failed: err.message});
    }

    function codeSplit() {
        var attributes = new Array();
        attributes.push(result.substring(0,21));
        attributes.push(result.substring(21,34));
        attributes.push(result.substring(34,str.length));
        return attributes;
    }

    var checkAtt = codeSplit();
    //TODO: Check if the result exists in db, then return a flag

    var options = {
      code: checkAtt[0],
      updated_at: new Date(Number(checkAtt[1])),
      randNum: checkAtt[2]
    };

    CodeCheckLog.findOne(options, function(err, succ) {
        // If cannot find code in this table, probably is a new used one,
        // We need to insert this req into table
        if (err) {
            CodeCheckLog.create(
                {code: }
            );

        }
    });

      //Qrcodegen.findOne(options, function(err, code) {
      //    if (err) res.json({failed : err.message});
      //    if (code === undefined) res.json({err : 'undifined'});
      //    res.json({success: "flag"});
      //});

    res.json(result);
  },
    tester: function (req, res) {
        var cipher = require("crypto");
        var key = new Buffer("abcdefgh");
        var iv = new Buffer([0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF]);
        var encrypter = cipher.createCipheriv('des',key,iv);
        var result = encrypter.update("73ab9265507996e1d14b95c2af99f10a60922039733489292266",'utf8','hex');
        result += encrypter.final('hex');
        res.send(result);
    }
};
