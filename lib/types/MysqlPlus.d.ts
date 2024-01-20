import type MysqlDB from './MysqlDB';
import type { TableColumn, Order, LogicField, QueryObject } from './utils/sql';
export declare interface DbTable {
    name: string;
    columns: TableColumn[];
    mainKey: string;
    isLogicDelete: boolean;
    orderKey: Order;
    logicDeleteField: string;
    logicDeleteValue: string | number;
}
export default class MysqlPlus {
    db: MysqlDB;
    tableName: string;
    tableColumns: TableColumn[];
    mainKey: string;
    order: Order;
    isLogicDelete: boolean;
    logicField: LogicField;
    constructor(db: MysqlDB, table: DbTable);
    page(obj: QueryObject, order?: Order): Promise<{
        list: any;
        total: any;
        pageSize: string | number | string[] | number[];
        pageNum: string | number | string[] | number[];
    }>;
    select(obj: QueryObject, order?: Order): Promise<any>;
    count(obj: QueryObject): Promise<any>;
    insert(data: QueryObject | QueryObject[]): Promise<any>;
    updateById(obj: QueryObject): Promise<any>;
    beatchUpdateById(data: QueryObject[]): Promise<any>;
    removeById(id: string): Promise<any>;
    removeByIds(ids: string[]): Promise<any>;
}
