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
export declare function selectDataCreated(value: string | number, queryType: string): string | number;
export declare function whereCreated(data: QueryObject, tableColumns: WhereTableColumn[]): {
    sql: string;
    arr: any[];
};
export declare function select(data: QueryObject, table: string, tableColumns: TableColumn[], order: Order): {
    sql: string;
    arr: any[];
};
export declare function selectCount(data: QueryObject, table: string, tableColumns: TableColumn[], tableMainKey: string): {
    sql: string;
    arr: any[];
};
export declare function getInsertColumnWithVal(data: QueryObject | QueryObject[], tableColumns: TableColumn[]): {
    column: string[];
    arr: any[];
};
export declare function insert(data: QueryObject | QueryObject[], table: string, tableColumns: TableColumn[]): {
    sql: string;
    arr: (string | string[] | any[][])[];
};
export declare function updateById(data: QueryObject, table: string, tableColumns: TableColumn[], tableMainKey: string): {
    sql: string;
    arr: {}[];
};
export declare function beatchUpdateById(data: QueryObject[], table: string, tableColumns: TableColumn[], tableMainKey: string): {
    sql: string;
    arr: any[];
};
export declare function removeByIds(ids: string[] | number[], table: string, tableMainKey: string): {
    sql: string;
    arr: (string | (string | number)[])[];
};
export declare function logicRemoveByIds(ids: string[] | number[], table: string, tableMainKey: string, logicField: LogicField): {
    sql: string;
    arr: (string | number | (string | number)[])[];
};
