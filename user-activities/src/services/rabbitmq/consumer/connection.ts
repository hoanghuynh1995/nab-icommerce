// channel promise for
import * as amqp from 'amqplib/callback_api'
import config from '../../../config'

interface IConnection {
  createChannel: Function
}
interface IChannel {
  assertQueue: Function
  consume: Function
  ack: Function
}
class Connection {
  connectionPromise: Promise<IConnection>
  channelPromise: Promise<IChannel>
  constructor() {
    this.connect()
  }
  connect() {
    this.connectionPromise = new Promise((resolve, reject) => {
      amqp.connect(config.amqp.url, (err, conn) => {
        if (err) {
          // retry after 5 seconds
          setTimeout(() => {
            this.connect()
          }, 5000)
          return reject(err)
        }
        console.log('amqp connected!')
        this.createChannel(conn)
        return resolve(conn)
      })
    })
  }
  createChannel(conn: IConnection) {
    this.channelPromise = new Promise<IChannel>((resolve, reject) => {
      conn.createChannel((err, ch) => {
        if (err) return reject(err)
        return resolve(ch)
      })
    })
  }
}

export default new Connection()
