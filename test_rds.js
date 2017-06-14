var rds = require('./rds');

callback = function(err, endpoints) {
    if (err) {
        console.log(err);
    } else {
        console.log(endpoints);
    }
};

rds.describeDBClusters(callback);
