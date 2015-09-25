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

            for (var i = 0; i < range; i++) {
                pos = Math.round(Math.random() * (arr.length - 1));
                str += arr[pos];
            }
            return str;
        }

        // Generate key and check if it's already exsits
        // If not, insert into hashtable
        // Else, re-generate
        for (var i = 0; i < code_num;) {
            var randcode = generateNum(20);
            if (!codes.hasOwnProperty(randcode)) {
                codes[randcode] = 1;
                i++;
            }
        }

        // md5 encrypted then append to original code
        // after combine md5 and string, insert into mongodb
        var md5 = require('md5');
        for (var k in codes) {
            codes[k] = md5(k) + k;
            Qrcodegen
                .create(
                {number: k, code: codes[k]})
                .exec(function createCB(err) {
                    if (err) {
                        console.log(err.message);
                    } else {
                        console.log('succ');
                    }
                });
        }

        //TODO: insert into table
        res.send('RUN SUCC');

    },

    codeParser: function (req, res) {
        var enCode = req.param('code');
        res.json(typeof(enCode));
        var decrypter = require("crypto");
        var key = new Buffer("12345678");
        var iv = new Buffer([0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF]);
        res.json(enCode);
        try {
            var decipher = decrypter.createDecipheriv('des', key, iv);
            var result = decipher.update(enCode, 'hex', 'utf8');
            result += decipher.final('utf8');
        }
        catch (err) {
            res.json({failed: err.message});
        }


        function codeSplit() {
            var attributes = new Array();

            //Suppose 20 digits code
            attributes.push(result.substring(0, 52));

            //Date is set as 13 digits unix numbers
            attributes.push(result.substring(52, 65));

            //The rest is a random number
            attributes.push(result.substring(65, result.length));
            return attributes;
        }

        var checkAtt = codeSplit();

        var options = {
            code: checkAtt[0]
        };

        var systemTime = new Date().getTime();
        // If the diff of request created time and arriving time is greater than 10s
        // We consider this request is cracked and faked
        if (Math.abs(systemTime - Number(checkAtt[1])) / 1000 > 10) {

            //TODO: We need a method to deal with attacks !!!
        }
        CodeCheckLog.findOne(options, function findOneCB(err, found) {

            // If cannot find code in this table, probably is a new used one,
            // We need to insert this req into table
            if (err) {
                res.json({failed : err.message});
            }
            if (!found) {

                CodeCheckLog.create(
                    {
                        code: checkAtt[0],
                        updated_at: checkAtt[1],
                        randNum: checkAtt[2],
                        times: 1
                    }
                ).exec(function createCB(err) {
                        err ? res.json({Failed: "Create New Log Failed - ERR: " + err.message})
                            : res.json({succ : "New Log Inserted"});
                    });

            } else {
                // Find same code exists in table already
                // Need to check updated_at and randNum attributes
                var reqTimeStamp = new Date((Number(checkAtt[1])));
                var existTime = new Date(Number(found.updated_at));
                var timeDiff = (reqTimeStamp - existTime) / 1000;
                // If time stamp and random number are same
                // Means the request is fake
                if (timeDiff <= 1000 && checkAtt[2] == found.randNum) {

                    //TODO: We need dealing with attacks !!!
                } else {
                    var data = {
                        code: checkAtt[0],
                        updated_at: checkAtt[1],
                        randNum: checkAtt[2],
                        times: found.times + 1
                    };
                    CodeCheckLog.update({code: checkAtt[0]}, data).exec(function (err) {
                        err ? res.json({Failed: "Update Log Err: " + err.message}) :
                            res.json({succ : "Code log updated"});
                    });
                }
            }
        });
        //Qrcodegen.findOne(options, function(err, code) {
        //    if (err) res.json({failed : err.message});
        //    if (code === undefined) res.json({err : 'undifined'});
        //    res.json({success: "flag"});
        //});

        //res.json(result);

    },
    tester: function (req, res) {
        var cipher = require("crypto");
        var key = new Buffer("abcdefgh");
        var iv = new Buffer([0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF]);
        var encrypter = cipher.createCipheriv('des', key, iv);
        var result = encrypter.update("73ab9265507996e1d14b95c2af99f10a60922039733489292266", 'utf8', 'hex');
        result += encrypter.final('hex');
        res.send(result);
    }
};
