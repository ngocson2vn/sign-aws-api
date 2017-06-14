var crypto = require("crypto");
var utf8 = require("utf8");
var util = require("util");
var formatter = require("sprintf-js");

function sign(key, msg) {
    return crypto.createHmac("sha256", key).update(msg).digest();
}

function signhex(key, msg) {
    return crypto.createHmac("sha256", key).update(msg).digest('hex');
}

function getSignatureKey(key, dateStamp, regionName, serviceName) {
    kDate = sign(utf8.encode('AWS4' + key), dateStamp);
    kRegion = sign(kDate, regionName);
    kService = sign(kRegion, serviceName);
    kSigning = sign(kService, 'aws4_request');
    return kSigning;
}

module.exports.signRequest = function (action, access_key, secret_key) {
    var method = 'GET';
    var region = 'ap-northeast-1';
    var service = 'rds';
    var host = service + '.' + region + '.amazonaws.com';
    var endpoint = 'https://' + host;

    var date = new Date();
    var datestamp = formatter.sprintf("%04d%02d%02d", date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    var amzdate = formatter.sprintf("%sT%02d%02d%02dZ", datestamp, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    var canonical_uri = '/';
    var request_parameters = 'Action=' + action + '&Version=2014-10-31';
    var canonical_querystring = request_parameters;
    var canonical_headers = 'host:' + host + '\n' + 'x-amz-date:' + amzdate + '\n';
    var signed_headers = 'host;x-amz-date';
    var payload_hash = crypto.createHash('sha256').update('').digest('hex');
    var canonical_request = method + '\n' + canonical_uri + '\n' + canonical_querystring + '\n' + canonical_headers + '\n' + signed_headers + '\n' + payload_hash;
    var algorithm = 'AWS4-HMAC-SHA256';
    var credential_scope = datestamp + '/' + region + '/' + service + '/' + 'aws4_request';
    var string_to_sign = algorithm + '\n' + amzdate + '\n' + credential_scope + '\n' + crypto.createHash('sha256').update(canonical_request).digest('hex');
    var signing_key = getSignatureKey(secret_key, datestamp, region, service);
    var signature = signhex(signing_key, utf8.encode(string_to_sign));
    var authorization_header = algorithm + ' ' + 'Credential=' + access_key + '/' + credential_scope + ', ' +  'SignedHeaders=' + signed_headers + ', ' + 'Signature=' + signature;
    var headers = {'x-amz-date': amzdate, 'Authorization': authorization_header};
    var request_url = endpoint + '?' + canonical_querystring;
    var options = {'url': request_url, 'headers': headers};
    return options;
}

