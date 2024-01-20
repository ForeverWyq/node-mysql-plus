import mysql from 'mysql';
import RunLock from './utils/RunLock';

export default class MysqlDB {
  public pool: mysql.Pool;
  public connection: mysql.PoolConnection;
  private errNum: number;
  private lock: RunLock;
  constructor(config: string | mysql.PoolConfig) {
    this.pool = mysql.createPool(config);
    this.errNum = 0;
    this.lock = new RunLock();
    this.connect();
  }
  async connect(callback?: (error: mysql.MysqlError) => any): Promise<mysql.PoolConnection> {
    if (this.connection) {
      return this.connection;
    }
    const lockStatus = this.lock.lock();
    if (!lockStatus) {
      await this.lock.wait();
      return this.connection;
    }
    return await new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        this.lock.unlock();
        if (err) {
          typeof callback === 'function' && callback(err);
          return reject(err);
        }
        this.connection = connection;
        resolve(connection);
      });
    });
  }
  async executeSql(sql: string, arr: any[] = []): Promise<any> {
    await this.lock.wait();
    return new Promise((resolve, reject) => {
      this.connection.query(sql, arr, async (err, result) => {
        if (err) {
          this.connection.release();
          this.connection.destroy();
          this.connection = null;
          this.connect();
          if (this.errNum > 0) {
            reject(err);
            return;
          }
          this.errNum++;
          return resolve(await this.executeSql(sql, arr));
        }
        this.errNum = 0;
        resolve(result);
      });
    });
  }
}
