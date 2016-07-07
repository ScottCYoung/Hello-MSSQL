
// appdynamics config
var appd = require('appdynamics');
require("appdynamics").profile({
  controllerHostName: 'ubuntuserver140412-scy42controller-0xv2hnal.srv.ravcloud.com',
  controllerPort: 8090,
  controllerSslEnabled: false,  // Set to true if controllerPort is SSL
  accountName: 'customer1',
  accountAccessKey: '', //required
  applicationName: 'Node.JS Apps',
  tierName: 'Basic MSSQL',
  nodeName: 'node1',
});

var sql = require("mssql");

var dbConfig = {
  server: '192.168.1.171', // You can use 'localhost\\instance' to connect to named instance
  database: 'NodeSample',
  user: 'sa',
  password: '',
  port: 1433
};

function getEmp() {
  var conn = new sql.Connection(dbConfig);
  //console.log(conn);
  var request = new sql.Request(conn); // or: var request = connection.request();

  conn.connect(function (err) {
    if (err) {
      console.log(err);
      return;
    }

    request.query("select * from dbo.emp", function (err,recordset) {
      if (err) {
        console.log(err);
      }
      else {
        console.log(recordset);
        console.log('success!');
        return(recordset)
      }

      conn.close();
    });
  });
}

//getEmp();

//Lets require/import the HTTP module
var http = require('http');

//Lets define a port we want to listen to
const PORT=8080;

//We need a function which handles requests and send response
function handleRequest(request, response){
   var trx = appd.startTransaction('custom ms-sql call');  //start appd transaction

   var exit = trx.startExitCall({   //define and start appd exit call
     exitType: 'EXIT_DB',
     label: 'MSSQL',
     backendName: "MSSql Express",
     identifyingProperties: {
       "Host": "WinSrv-All",
       "Port": "3333",
       "Database": "NodeSample",
       "Vendor": "MSSQL"
     }
   });
   var request = {
     ci: trx.createCorrelationInfo(exit),
     at: new Date()
  };

  trx.beforeExitCall = function getExitInfo(exitcall) {
    return;
  }

   response.end(getEmp());
   trx.endExitCall(exit);
   trx.end();
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});
