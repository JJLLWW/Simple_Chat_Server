import Express from 'express';
import { Sequelize, DataTypes } from 'sequelize';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import conf from './serv_config';

async function start() {
  // sequelize
  const endpoint = `http://${conf.host}:${conf.port}`;
  const sequelize = new Sequelize({
    dialect: 'postgres',
    username: 'postgres',
    password: 'password',
    database: 'schat',
  });
  await sequelize.authenticate();

  const Message = sequelize.define('Message', {
    text: {
      type: DataTypes.STRING,
    },
  });
  Message.sync();

  // socket.io
  const io = new Server(conf.sio_port, {
    cors: {
      // seriously bad idea but I need it to work
    //   origin: 'http://localhost:3001',
      origin: '*',
    },
  });

  const UserIds = ['A', 'B'];
  let NextUsrIdx = 0;

  io.on('connection', (sock) => {
    const UserID = UserIds[NextUsrIdx];
    if (NextUsrIdx < UserIds.length - 1) {
      NextUsrIdx++;
    }
    sock.on('client_msg', (msg) => {
      msg.senderID = UserID;
      // TODO: remember the previous messages
      console.log('stub', msg.text, msg.senderID);
      sock.broadcast.emit('serv_msg', msg);
      sock.emit('serv_msg', msg);
    });
  });

  console.log(`socket.io listening on port ${conf.sio_port}`);

  // express
  const app = Express();

  app.get('/', (req : any, res : any) => {
    req.send('jsakdnsajkds');
  });

  // let express know we're using CORS
  app.use(cors());

  app.listen(conf.port, () => {
    console.log(`server listening on ${endpoint}`);
  });
}

start();
