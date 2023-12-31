const fs = require("fs");
const https = require("https");
const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  console.log(err.stack);
  process.exit(1);
});

dotenv.config();
const app = require('./app');

// Connect MongoDB
console.log(process.env.DATABASE_LOCAL)
const DB = "mongodb+srv://modunkung:zxc142753869@cluster0.l7sz8lo.mongodb.net/";
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('DB connection successful!');
  });

const port = process.env.SERVER_PORT || 3000;
const env = process.env.NODE_ENV?  process.env.NODE_ENV : 'development';
console.log(`Starting Backend Server in ${env} mode...`)
let server
// if (env == "development") {
  server = app.listen(port, () => { });
// } else{
//   server = https
//     .createServer(
//       {
//         key: fs.readFileSync("key.pem"),
//         cert: fs.readFileSync("cert.pem"),
//       },
//       app
//     )
//     .listen(port, () => {
//       console.log(`server is runing at port ${port}`)
//     });
// }

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});