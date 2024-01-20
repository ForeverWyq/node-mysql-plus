import mysql from 'mysql';
export default class MysqlDB {
    pool: mysql.Pool;
    connection: mysql.PoolConnection;
    private errNum;
    private lock;
    constructor(config: string | mysql.PoolConfig);
    connect(callback?: (error: mysql.MysqlError) => any): Promise<mysql.PoolConnection>;
    executeSql(sql: string, arr?: any[]): Promise<any>;
}
