#!/usr/bin/env node

const net = require("net");
const fs = require("fs");

let stream = fs.createWriteStream("logs/logs.txt", {flags:'a'});

stream.write(`



--- ${new Date} ---

Server Start. \n
`);

/* debug: global._ = args => console.log(args);
prod: */  global._ = args => {
  stream.write(`[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}.${new Date().getMilliseconds()}]${args}
`);
  //stream.end();
};
                                                                /*** Send to server */
const sendToServer = (data, callback) => {
  /* Test if http or https to select the port */
  let http = false;
  if (/http/gi.test) {
    http = true;
  }

  let port = 0;
  if (http === true) {
    port = 8000;
  } else {
    port = 8001;
  }

  /* Test if request is valid */


  /* Test if ip banned, etc */

  /* Send to server */
  let client = new net.Socket();
  client.connect({
    port: port
  });

  client.on("connect", () => {
    _("Client: connection established with http internal server");
  });

  client.write(data);
  client.setEncoding("utf8");

  client.on("data", recv => {
    _(`Server Response (only first 20 bytes shown): ${recv.substr(0,20)}`);
    callback(recv);
  });

  /*setTimeout( () => {
    client.end("Proxy Timeout Processing Request");
  }, 15000);*/

}
/* Send to server ***/


let proxy = net.createServer();
proxy.on("close", () => {
  _("Proxy closed.");
});

proxy.on("connection", socket => {
_(`Buffer size: ${socket.bufferSize}

--------- proxy details -----------------
Port: ${proxy.address().port}
Family: ${proxy.address().family}
Ip: ${proxy.address().address}
LocalPort: ${socket.localPort}
LocalAddress: ${socket.localAddress}
--------------------------------------


------------ remote client info --------------
Port: ${socket.remotePort}
Address: ${socket.remoteAddress}
Family: ${socket.remoteFamily}
--------------------------------------------

`);


proxy.getConnections( (error, count) => {
  _(`Concurrent connections now: ${count}`);
});

socket.setEncoding('utf8');
socket.setTimeout(800000, () => {
  _("Socket timeout");
});


socket.on("data", data => {
  _(`BytesRead: ${socket.bytesRead}
BytesWritten: ${socket.bytesWritten}
Data (only 20 first bytes shown): ${data.substr(0, 20)}
`);

  sendToServer(data, internalServerResponse => {
    let is_kernel_buffer_full = socket.write(internalServerResponse);
    if (is_kernel_buffer_full) {
      _("Data Send Sucesfully");
    } else {
      socket.pause();
    }
  });

});

socket.on("drain", () => {
  _(`write buffer is empty now .. u can resume the writable stream`);
  socket.resume();
});

socket.on("error", error => {
  _(`Error: ${error}`);
});

socket.on("timeout", () => {
  _("Socket timed out !");
  socket.end("Timed out!");
  // can call socket.destroy() here too.
});

socket.on("end", data => {
  _(`Socket ended from other end!
End data: ${data}`);
});

socket.on("close", error => {
  _(`BytesRead: ${socket.bytesRead}
BytesWritten: ${socket.bytesWritten}
Socket closed!`);

  if(error) {
    _(`Socket was closed. Transmission error`);
  }
});

setTimeout( () => {
  _(`Socket destroyed: ${socket.destroyed}`);
  socket.destroy();
},1200000);

});

proxy.on("error", error => {
  _(`Error: ${error}`);
});

proxy.on("listening", () => {
  _(`Proxy is accepting requests.`);
});

proxy.maxConnections = 10;

proxy.listen(8080);

if (proxy.listening) {
  _("Proxy is listening");
} else {
  _(`Proxy is not listening`);
}

setTimeout( () => {
  proxy.close();
},5000000);
