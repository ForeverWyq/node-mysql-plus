import _ from 'lodash';
import type MysqlDB from './MysqlDB';
import * as sqlCreate from './utils/sql';
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
  public db: MysqlDB;
  public tableName: string;
  public tableColumns: TableColumn[];
  public mainKey: string;
  public order: Order;
  public isLogicDelete: boolean;
  public logicField: LogicField;
  constructor(db: MysqlDB, table: DbTable) {
    const {
      name,
      columns,
      mainKey,
      isLogicDelete,
      orderKey,
      logicDeleteField,
      logicDeleteValue
    } = table;
    this.db = db;
    this.tableName = name;
    this.tableColumns = columns;
    this.mainKey = mainKey;
    this.order = orderKey;
    const hasDelField = !!logicDeleteField;
    this.isLogicDelete = _.isNil(isLogicDelete) ? hasDelField : isLogicDelete && hasDelField;
    this.logicField = { id: logicDeleteField, logicDeleteValue: logicDeleteValue };
  }
  // 分页
  async page(obj: QueryObject, order?: Order) {
    const { pageNum = 1, pageSize = 10, ...selectData } = obj || {};
    const list = await this.select(obj, order);
    const total = await this.count(selectData);
    return { list, total, pageSize, pageNum };
  }
  // 查询
  async select(obj: QueryObject, order?: Order) {
    const { sql, arr } = sqlCreate.select(
      obj || {},
      this.tableName,
      this.tableColumns,
      order || this.order
    );
    return await this.db.executeSql(sql, arr);
  }
  // 查询数量
  async count(obj: QueryObject) {
    const { sql, arr } = sqlCreate.selectCount(
      obj || {},
      this.tableName,
      this.tableColumns,
      this.mainKey
    );
    const [{ total }] = await this.db.executeSql(sql, arr);
    return total;
  }
  // 新增/批量新增
  async insert(data: QueryObject | QueryObject[]) {
    const { sql, arr } = sqlCreate.insert(data || {}, this.tableName, this.tableColumns);
    return await this.db.executeSql(sql, arr);
  }
  // 更新
  async updateById(obj: QueryObject) {
    const { sql, arr } = sqlCreate.updateById(
      obj || {},
      this.tableName,
      this.tableColumns,
      this.mainKey
    );
    return await this.db.executeSql(sql, arr);
  }
  // 批量更新
  async beatchUpdateById(data: QueryObject[]) {
    const { sql, arr } = sqlCreate.beatchUpdateById(
      data || [],
      this.tableName,
      this.tableColumns,
      this.mainKey
    );
    return await this.db.executeSql(sql, arr);
  }
  async removeById(id: string) {
    return await this.removeByIds([id]);
  }
  async removeByIds(ids: string[]) {
    const removeFunc = sqlCreate[this.isLogicDelete ? 'logicRemoveByIds' : 'removeByIds'];
    const { sql, arr } = removeFunc(ids || [], this.tableName, this.mainKey, this.logicField);
    return await this.db.executeSql(sql, arr);
  }
}
