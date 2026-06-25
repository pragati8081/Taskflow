const dns = require("dns");

console.log("Default DNS servers:", dns.getServers());

dns.setServers(["8.8.8.8", "1.1.1.1"]);

console.log("Using DNS servers:", dns.getServers());

dns.resolveSrv("_mongodb._tcp.taskflow.vepl70h.mongodb.net", (err, records) => {
  console.log("Error:", err);
  console.log("Records:", records);
});