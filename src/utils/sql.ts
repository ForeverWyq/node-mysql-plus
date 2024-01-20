import _ from 'lodash';
import { QUERY_TYPE } from './CONSTANT';

export declare interface AnyObject {
  [key: string]: any;
}

export declare interface LogicField {
  id: string;
  logicDeleteValue: string | number;
}

export declare interface TableColumn {
  id: string;
  queryType: string;
  unInsert?: boolean;
  unUpdate?: boolean;
}

export declare interface Order {
  field: string;
  type: string;
}

export declare interface WhereTableColumn extends TableColumn {
  table: string;
  dataKey?: string;
}

export declare interface QueryObject {
  [key: string]: string | number | string[] | number[];
}

// 查询条件
export function selectDataCreated(value: string | number, queryType: string) {
  const searchValue = String(value).replace(/[%_\\]/g, (v) => `\\${v}`);
  const map = new Map([
    [QUERY_TYPE.head, `${searchValue}%`],
    [QUERY_TYPE.last, `%${searchValue}`],
    [QUERY_TYPE.includes, value !== '' ? `%${searchValue}%` : '%'],
    [QUERY_TYPE.exact, value],
  ]);
  return map.get(queryType) || value;
}

export function whereCreated(data: QueryObject, tableColumns: WhereTableColumn[]) {
  let sql = 'where 1=1';
  const arr = [];
  tableColumns.forEach(({ id, dataKey, table, queryType }) => {
    const value = data[_.isNil(dataKey) ? id : dataKey];
    if (Array.isArray(value)) {
      sql = `${sql} and ??.?? in (?)`;
      arr.push(table, id, value);
      return;
    }
    if (_.isEmpty(value) && !_.isNumber(value)) {
      return;
    }
    if (queryType === QUERY_TYPE.exact) {
      sql = `${sql} and ??.??=?`;
    } else {
      sql = `${sql} and ??.?? like ? escape '\\\\'`;
    }
    arr.push(table, id, selectDataCreated(value, queryType));
  });
  return { sql, arr };
}

// 查询
export function select(
  data: QueryObject,
  table: string,
  tableColumns: TableColumn[],
  order: Order
) {
  const { pageNum, pageSize, ...selectData } = data || {};
  const where = whereCreated(
    selectData,
    tableColumns.map((item) => ({ ...item, table }))
  );
  let sql = `select ?? from ?? ${where.sql}`;
  const arr = [tableColumns.map(({ id }) => id), table, ...where.arr];
  const { field, type } = order || {};
  if (field) {
    sql = `${sql} order by ??`;
    arr.push(field);
    if (type?.toLowerCase() === 'desc') {
      sql = `${sql} DESC`;
    }
  }
  if (pageNum && pageSize) {
    const start = (Number(pageNum) - 1) * Number(pageSize);
    sql = `${sql} limit ?,?`;
    arr.push(start, pageSize);
  }
  return { sql, arr };
}

// 查询总数
export function selectCount(
  data: QueryObject,
  table: string,
  tableColumns: TableColumn[],
  tableMainKey: string
) {
  const { sql, arr } = whereCreated(
    data,
    tableColumns.map((item) => ({ ...item, table }))
  );
  return { sql: `select count(??) as total from ?? ${sql}`, arr: [tableMainKey, table, ...arr] };
}

// 获取插入的行数据
export function getInsertColumnWithVal(
  data: QueryObject | QueryObject[],
  tableColumns: TableColumn[]
) {
  const column = tableColumns.filter(({ unInsert }) => !unInsert).map(({ id }) => id);
  const arr = [];
  if (Array.isArray(data)) {
    data.forEach((item) => {
      const valArr = [];
      column.forEach((id) => {
        valArr.push(item[id]);
      });
      arr.push(valArr);
    });
    return { column, arr };
  }
  const keys: string[] = [];
  column.forEach((id) => {
    const value = data[id];
    if (!_.isNil(value)) {
      keys.push(id);
      arr.push(value);
    }
  });
  return { column: keys, arr };
}

// 插入
export function insert(
  data: QueryObject | QueryObject[],
  table: string,
  tableColumns: TableColumn[]
) {
  const { column, arr } = getInsertColumnWithVal(data, tableColumns);
  return {
    sql: `insert into ?? (??) values ?`,
    arr: [table, column, [arr]],
  };
}

// 更新
export function updateById(
  data: QueryObject,
  table: string,
  tableColumns: TableColumn[],
  tableMainKey: string
) {
  const sets = {};
  tableColumns.forEach(({ id, unUpdate }) => {
    if (unUpdate) {
      return;
    }
    const value = data[id];
    if (!_.isUndefined(value) && id !== tableMainKey) {
      sets[id] = value;
    }
  });
  return {
    sql: `update ?? set ? where ??=?`,
    arr: [table, sets, tableMainKey, data[tableMainKey]],
  };
}

// 批量更新
export function beatchUpdateById(
  data: QueryObject[],
  table: string,
  tableColumns: TableColumn[],
  tableMainKey: string
) {
  let sql = `update ?? set`;
  const arr: any[] = [table];
  let count = 0;
  const ids = [];
  tableColumns.forEach(({ id, unUpdate }) => {
    if (unUpdate) {
      return;
    }
    let updateField = '';
    const columnArr = [];
    data.forEach((item) => {
      const value = item[id];
      const idValue = item[tableMainKey];
      if (_.isUndefined(value)) {
        return;
      }
      if (id === tableMainKey) {
        idValue && ids.push(idValue);
        return;
      }
      updateField = `${updateField} when ? then ?`;
      columnArr.push(idValue, value);
    });
    if (updateField) {
      if (count > 0) {
        sql += ',';
      }
      sql = `${sql} ?? = case ?? ${updateField} else ?? end`;
      count++;
      arr.push(id, tableMainKey, ...columnArr, id);
    }
  });
  sql = `${sql} where ?? in (?)`;
  arr.push(tableMainKey, ids);
  return { sql, arr };
}

// 批量删除
export function removeByIds(ids: string[] | number[], table: string, tableMainKey: string) {
  const arr = ids.filter((id) => !_.isNil(id));
  return {
    sql: `delete from ?? where ?? in (?)`,
    arr: [table, tableMainKey, arr],
  };
}

// 批量逻辑删除
export function logicRemoveByIds(
  ids: string[] | number[],
  table: string,
  tableMainKey: string,
  logicField: LogicField
) {
  const arr = ids.filter((id) => !_.isNil(id));
  return {
    sql: `update ?? set ??=? where ?? in (?)`,
    arr: [table, logicField.id, logicField.logicDeleteValue, tableMainKey, arr],
  };
}
