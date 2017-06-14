var signRequest = require('./sign_request').signRequest;
var request = require('request');
var convertXMLToJSON = require('xml2js').parseString;

var access_key = process.env.AWS_ACCESS_KEY_ID;
var secret_key = process.env.AWS_SECRET_ACCESS_KEY;

module.exports.describeDBInstances = function() {
    var action = "DescribeDBInstances";
    console.log(JSON.stringify(options));
    console.log('\nBEGIN REQUEST++++++++++++++++++++++++++++++++++++');
    console.log('Request URL = ' + options.url + '\n');

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            convertXMLToJSON(body, function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    dbs = result.DescribeDBInstancesResponse.DescribeDBInstancesResult[0].DBInstances[0].DBInstance;
                    for (var i = 0, len = dbs.length; i < len; i++) {
                        endpoint = dbs[i].Endpoint[0].Address[0];
                        console.log(endpoint);
                    }
                }
            });
        }
    }

    request(options, callback);
}

module.exports.describeDBClusters = function(callback) {
    var action = "DescribeDBClusters";
    var options = signRequest(action, access_key, secret_key);
    console.log('\nBEGIN REQUEST++++++++++++++++++++++++++++++++++++');
    console.log('Request URL = ' + options.url + '\n');

    var endpoints = [];
    function parseData(error, response, body) {
        if (!error && response.statusCode == 200) {
            convertXMLToJSON(body, function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    dbs = result.DescribeDBClustersResponse.DescribeDBClustersResult[0].DBClusters[0].DBCluster;
                    for (var i = 0, len = dbs.length; i < len; i++) {
                        endpoint = dbs[i].Endpoint[0];
                        endpoints.push(endpoint);
                    }

                    callback(error, endpoints);
                }
            });
        } else {
            callback(error, endpoints);
        }
    }

    request(options, parseData);
}
