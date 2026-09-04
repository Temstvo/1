import { Pool, PoolClient } from 'pg';
import {
  ColumnTypeEnum,
  DriverAdapterError,
  IsolationLevel,
  Transaction,
  SqlDriverAdapter,
  SqlQuery,
  SqlResultSet,
} from '@prisma/driver-adapter-utils';
import { parse as parsePgArray } from 'postgres-array';

const { types: pgTypes } = require('pg');

const FIRST_NORMAL_OBJECT_ID = 16384;

const ArrayColumnType: Record<string, number> = {
  BIT_ARRAY: 1561,
  BOOL_ARRAY: 1000,
  BYTEA_ARRAY: 1001,
  BPCHAR_ARRAY: 1014,
  CHAR_ARRAY: 1002,
  CIDR_ARRAY: 651,
  DATE_ARRAY: 1182,
  FLOAT4_ARRAY: 1021,
  FLOAT8_ARRAY: 1022,
  INET_ARRAY: 1041,
  INT2_ARRAY: 1005,
  INT4_ARRAY: 1007,
  INT8_ARRAY: 1016,
  JSONB_ARRAY: 3807,
  JSON_ARRAY: 199,
  MONEY_ARRAY: 791,
  NUMERIC_ARRAY: 1231,
  OID_ARRAY: 1028,
  TEXT_ARRAY: 1009,
  TIMESTAMP_ARRAY: 1115,
  TIMESTAMPTZ_ARRAY: 1185,
  TIME_ARRAY: 1183,
  UUID_ARRAY: 2951,
  VARBIT_ARRAY: 1563,
  VARCHAR_ARRAY: 1015,
  XML_ARRAY: 143,
};

class UnsupportedNativeDataType extends Error {
  readonly type: string;
  constructor(code: number) {
    super(`Unsupported column type ${code}`);
    this.type = String(code);
  }
}

function fieldToColumnType(
  fieldTypeId: number,
): (typeof ColumnTypeEnum)[keyof typeof ColumnTypeEnum] {
  switch (fieldTypeId) {
    case pgTypes.builtins.INT2:
    case pgTypes.builtins.INT4:
      return ColumnTypeEnum.Int32;
    case pgTypes.builtins.INT8:
      return ColumnTypeEnum.Int64;
    case pgTypes.builtins.FLOAT4:
      return ColumnTypeEnum.Float;
    case pgTypes.builtins.FLOAT8:
      return ColumnTypeEnum.Double;
    case pgTypes.builtins.BOOL:
      return ColumnTypeEnum.Boolean;
    case pgTypes.builtins.DATE:
      return ColumnTypeEnum.Date;
    case pgTypes.builtins.TIME:
    case pgTypes.builtins.TIMETZ:
      return ColumnTypeEnum.Time;
    case pgTypes.builtins.TIMESTAMP:
    case pgTypes.builtins.TIMESTAMPTZ:
      return ColumnTypeEnum.DateTime;
    case pgTypes.builtins.NUMERIC:
    case pgTypes.builtins.MONEY:
      return ColumnTypeEnum.Numeric;
    case pgTypes.builtins.JSON:
    case pgTypes.builtins.JSONB:
      return ColumnTypeEnum.Json;
    case pgTypes.builtins.UUID:
      return ColumnTypeEnum.Uuid;
    case pgTypes.builtins.OID:
      return ColumnTypeEnum.Int64;
    case pgTypes.builtins.BPCHAR:
    case pgTypes.builtins.TEXT:
    case pgTypes.builtins.VARCHAR:
    case pgTypes.builtins.BIT:
    case pgTypes.builtins.VARBIT:
    case pgTypes.builtins.INET:
    case pgTypes.builtins.CIDR:
    case pgTypes.builtins.XML:
      return ColumnTypeEnum.Text;
    case pgTypes.builtins.BYTEA:
      return ColumnTypeEnum.Bytes;
    case ArrayColumnType.INT2_ARRAY:
    case ArrayColumnType.INT4_ARRAY:
      return ColumnTypeEnum.Int32Array;
    case ArrayColumnType.FLOAT4_ARRAY:
      return ColumnTypeEnum.FloatArray;
    case ArrayColumnType.FLOAT8_ARRAY:
      return ColumnTypeEnum.DoubleArray;
    case ArrayColumnType.NUMERIC_ARRAY:
    case ArrayColumnType.MONEY_ARRAY:
      return ColumnTypeEnum.NumericArray;
    case ArrayColumnType.BOOL_ARRAY:
      return ColumnTypeEnum.BooleanArray;
    case ArrayColumnType.CHAR_ARRAY:
    case ArrayColumnType.TEXT_ARRAY:
    case ArrayColumnType.VARCHAR_ARRAY:
    case ArrayColumnType.VARBIT_ARRAY:
    case ArrayColumnType.BIT_ARRAY:
    case ArrayColumnType.INET_ARRAY:
    case ArrayColumnType.CIDR_ARRAY:
    case ArrayColumnType.XML_ARRAY:
      return ColumnTypeEnum.TextArray;
    case ArrayColumnType.DATE_ARRAY:
      return ColumnTypeEnum.DateArray;
    case ArrayColumnType.TIME_ARRAY:
      return ColumnTypeEnum.TimeArray;
    case ArrayColumnType.TIMESTAMP_ARRAY:
    case ArrayColumnType.TIMESTAMPTZ_ARRAY:
      return ColumnTypeEnum.DateTimeArray;
    case ArrayColumnType.JSON_ARRAY:
    case ArrayColumnType.JSONB_ARRAY:
      return ColumnTypeEnum.JsonArray;
    case ArrayColumnType.BYTEA_ARRAY:
      return ColumnTypeEnum.BytesArray;
    case ArrayColumnType.UUID_ARRAY:
      return ColumnTypeEnum.UuidArray;
    case ArrayColumnType.INT8_ARRAY:
    case ArrayColumnType.OID_ARRAY:
      return ColumnTypeEnum.Int64Array;
    default:
      if (fieldTypeId >= FIRST_NORMAL_OBJECT_ID) {
        return ColumnTypeEnum.Text;
      }
      throw new UnsupportedNativeDataType(fieldTypeId);
  }
}

function normalizeArray(elementNormalizer: (v: string) => unknown): (str: string) => unknown {
  return (str: string) => parsePgArray(str, elementNormalizer);
}

const normalizeNumeric = (n: string) => n;
const normalizeDate = (d: string) => d;
const normalizeTimestamp = (t: string) => `${t.replace(' ', 'T')}+00:00`;
const normalizeTimestamptz = (t: string) =>
  t.replace(' ', 'T').replace(/[+-]\d{2}(:\d{2})?$/, '+00:00');
const normalizeTime = (t: string) => t;
const normalizeTimez = (t: string) => t.replace(/[+-]\d{2}(:\d{2})?$/, '');
const normalizeMoney = (m: string) => m.slice(1);
const toJson = (j: string) => j;

const parsePgBytes = pgTypes.getTypeParser(pgTypes.builtins.BYTEA);
const parseBytesArray = pgTypes.getTypeParser(ArrayColumnType.BYTEA_ARRAY);

function encodeBuffer(buffer: Buffer): number[] {
  return Array.from(new Uint8Array(buffer));
}

function normalizeByteaArray(serialized: string): (number[] | null)[] {
  return parseBytesArray(serialized).map((buf: Buffer | null) => (buf ? encodeBuffer(buf) : null));
}

function convertBytes(serialized: string): number[] {
  return encodeBuffer(parsePgBytes(serialized));
}

const normalizeBit = (b: string) => b;

const customParsers: Record<number, (value: string) => unknown> = {
  [pgTypes.builtins.NUMERIC]: normalizeNumeric,
  [ArrayColumnType.NUMERIC_ARRAY]: normalizeArray(normalizeNumeric),
  [pgTypes.builtins.TIME]: normalizeTime,
  [ArrayColumnType.TIME_ARRAY]: normalizeArray(normalizeTime),
  [pgTypes.builtins.TIMETZ]: normalizeTimez,
  [ArrayColumnType.DATE]: normalizeDate,
  [ArrayColumnType.DATE_ARRAY]: normalizeArray(normalizeDate),
  [pgTypes.builtins.TIMESTAMP]: normalizeTimestamp,
  [ArrayColumnType.TIMESTAMP_ARRAY]: normalizeArray(normalizeTimestamp),
  [pgTypes.builtins.TIMESTAMPTZ]: normalizeTimestamptz,
  [ArrayColumnType.TIMESTAMPTZ_ARRAY]: normalizeArray(normalizeTimestamptz),
  [pgTypes.builtins.MONEY]: normalizeMoney,
  [ArrayColumnType.MONEY_ARRAY]: normalizeArray(normalizeMoney),
  [pgTypes.builtins.JSON]: toJson,
  [ArrayColumnType.JSON_ARRAY]: normalizeArray(toJson),
  [pgTypes.builtins.JSONB]: toJson,
  [ArrayColumnType.JSONB_ARRAY]: normalizeArray(toJson),
  [pgTypes.builtins.BYTEA]: convertBytes,
  [ArrayColumnType.BYTEA_ARRAY]: normalizeByteaArray,
  [ArrayColumnType.BIT_ARRAY]: normalizeArray(normalizeBit),
  [ArrayColumnType.VARBIT_ARRAY]: normalizeArray(normalizeBit),
  [ArrayColumnType.XML_ARRAY]: normalizeArray((v: string) => v),
};

function formatDateTime(date: Date): string {
  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  const ms = date.getUTCMilliseconds();
  return (
    `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ` +
    `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}` +
    (ms ? `.${String(ms).padStart(3, '0')}` : '')
  );
}

function formatDate(date: Date): string {
  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function formatTime(date: Date): string {
  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  const ms = date.getUTCMilliseconds();
  return (
    `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}` +
    (ms ? `.${String(ms).padStart(3, '0')}` : '')
  );
}

function mapArg(arg: unknown, argType: SqlQuery['argTypes'][number]): unknown {
  if (arg === null) {
    return null;
  }
  if (Array.isArray(arg) && argType.arity === 'list') {
    return arg.map((value) => mapArg(value, argType));
  }
  if (typeof arg === 'string' && argType.scalarType === 'datetime') {
    arg = new Date(arg);
  }
  if (arg instanceof Date) {
    switch (argType.dbType) {
      case 'TIME':
      case 'TIMETZ':
        return formatTime(arg);
      case 'DATE':
        return formatDate(arg);
      default:
        return formatDateTime(arg);
    }
  }
  if (typeof arg === 'string' && argType.scalarType === 'bytes') {
    return Buffer.from(arg, 'base64');
  }
  if (Array.isArray(arg) && argType.scalarType === 'bytes') {
    return Buffer.from(arg);
  }
  if (ArrayBuffer.isView(arg)) {
    return Buffer.from(arg.buffer, arg.byteOffset, arg.byteLength);
  }
  return arg;
}

const TLS_ERRORS = new Set([
  'UNABLE_TO_GET_ISSUER_CERT',
  'UNABLE_TO_GET_CRL',
  'UNABLE_TO_DECRYPT_CERT_SIGNATURE',
  'UNABLE_TO_DECRYPT_CRL_SIGNATURE',
  'UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY',
  'CERT_SIGNATURE_FAILURE',
  'CRL_SIGNATURE_FAILURE',
  'CERT_NOT_YET_VALID',
  'CERT_HAS_EXPIRED',
  'CRL_NOT_YET_VALID',
  'CRL_HAS_EXPIRED',
  'ERROR_IN_CERT_NOT_BEFORE_FIELD',
  'ERROR_IN_CERT_NOT_AFTER_FIELD',
  'ERROR_IN_CRL_LAST_UPDATE_FIELD',
  'ERROR_IN_CRL_NEXT_UPDATE_FIELD',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'CERT_CHAIN_TOO_LONG',
  'CERT_REVOKED',
  'INVALID_CA',
  'INVALID_PURPOSE',
  'CERT_UNTRUSTED',
  'CERT_REJECTED',
  'HOSTNAME_MISMATCH',
  'ERR_TLS_CERT_ALTNAME_FORMAT',
  'ERR_TLS_CERT_ALTNAME_INVALID',
]);

const SOCKET_ERRORS = new Set(['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT']);

function isDriverError(error: any): boolean {
  return (
    typeof error?.code === 'string' &&
    typeof error?.message === 'string' &&
    typeof error?.severity === 'string' &&
    (typeof error?.detail === 'string' || error?.detail === undefined) &&
    (typeof error?.column === 'string' || error?.column === undefined) &&
    (typeof error?.hint === 'string' || error?.hint === undefined)
  );
}

function isSocketError(error: any): boolean {
  return (
    typeof error?.code === 'string' &&
    typeof error?.syscall === 'string' &&
    typeof error?.errno === 'number' &&
    SOCKET_ERRORS.has(error.code)
  );
}

function isTlsError(error: any): boolean {
  if (typeof error?.code === 'string') {
    return TLS_ERRORS.has(error.code);
  }
  switch (error?.message) {
    case 'The server does not support SSL connections':
    case 'There was an error establishing an SSL connection':
      return true;
  }
  return false;
}

function mapDriverError(error: any): any {
  switch (error.code) {
    case '22001':
      return { kind: 'LengthMismatch', column: error.column };
    case '22003':
      return { kind: 'ValueOutOfRange', cause: error.message };
    case '23505': {
      const fields = error.detail
        ?.match(/Key \(([^)]+)\)/)
        ?.at(1)
        ?.split(', ');
      return {
        kind: 'UniqueConstraintViolation',
        constraint: fields !== undefined ? { fields } : undefined,
      };
    }
    case '23502': {
      const fields = error.detail
        ?.match(/Key \(([^)]+)\)/)
        ?.at(1)
        ?.split(', ');
      return {
        kind: 'NullConstraintViolation',
        constraint: fields !== undefined ? { fields } : undefined,
      };
    }
    case '23503': {
      let constraint: any;
      if (error.column) {
        constraint = { fields: [error.column] };
      } else if (error.constraint) {
        constraint = { index: error.constraint };
      }
      return { kind: 'ForeignKeyConstraintViolation', constraint };
    }
    case '3D000':
      return { kind: 'DatabaseDoesNotExist', db: error.message.split(' ').at(1)?.split('"').at(1) };
    case '28000':
      return {
        kind: 'DatabaseAccessDenied',
        db: error.message
          .split(',')
          .find((s: string) => s.startsWith(' database'))
          ?.split('"')
          .at(1),
      };
    case '28P01':
      return {
        kind: 'AuthenticationFailed',
        user: error.message.split(' ').pop()?.split('"').at(1),
      };
    case '40001':
      return { kind: 'TransactionWriteConflict' };
    case '42P01':
      return { kind: 'TableDoesNotExist', table: error.message.split(' ').at(1)?.split('"').at(1) };
    case '42703':
      return { kind: 'ColumnNotFound', column: error.message.split(' ').at(1)?.split('"').at(1) };
    case '42P04':
      return {
        kind: 'DatabaseAlreadyExists',
        db: error.message.split(' ').at(1)?.split('"').at(1),
      };
    case '53300':
      return { kind: 'TooManyConnections', cause: error.message };
    default:
      return {
        kind: 'postgres',
        code: error.code ?? 'N/A',
        severity: error.severity ?? 'N/A',
        message: error.message,
        detail: error.detail,
        column: error.column,
        hint: error.hint,
      };
  }
}

function convertDriverError(error: any): any {
  if (isSocketError(error)) {
    switch (error.code) {
      case 'ENOTFOUND':
      case 'ECONNREFUSED':
        return {
          kind: 'DatabaseNotReachable',
          host: error.address ?? error.hostname,
          port: error.port,
        };
      case 'ECONNRESET':
        return { kind: 'ConnectionClosed' };
      case 'ETIMEDOUT':
        return { kind: 'SocketTimeout' };
    }
  }
  if (isTlsError(error)) {
    return { kind: 'TlsConnectionError', reason: error.message };
  }
  if (isDriverError(error)) {
    return {
      originalCode: error.code,
      originalMessage: error.message,
      ...mapDriverError(error),
    };
  }
  throw error;
}

const CONNECTION_ERROR_PATTERNS = [
  'timeout exceeded when trying to connect',
  'Connection terminated unexpectedly',
  'Client has encountered a connection error',
  'The client has encountered a connection error',
  'Connection terminated',
  'Query read timeout',
  'read ECONNRESET',
  'write ECONNRESET',
];

function isConnectionError(error: any): boolean {
  if (!error) return false;
  if (typeof error.code === 'string' && SOCKET_ERRORS.has(error.code)) return true;
  if (typeof error.message === 'string') {
    return CONNECTION_ERROR_PATTERNS.some((p) => error.message.includes(p));
  }
  return false;
}

export interface RobustPgConfig {
  connectionString: string;
  ssl?: Record<string, unknown>;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  query_timeout?: number;
  keepAlive?: boolean;
}

class RobustPgQueryable {
  protected pool: Pool;
  protected readonly poolConfig: RobustPgConfig;
  protected readonly canRecreatePool: boolean;

  constructor(pool: Pool, poolConfig: RobustPgConfig, canRecreatePool = true) {
    this.pool = pool;
    this.poolConfig = poolConfig;
    this.canRecreatePool = canRecreatePool;
  }

  provider = 'postgres' as const;
  adapterName = 'robust-pg' as const;

  protected async runWithRetry(execute: (pool: Pool) => Promise<any>): Promise<any> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await execute(this.pool);
      } catch (error: any) {
        if (this.canRecreatePool && isConnectionError(error) && attempt < 10) {
          await this.recreatePool();
          await new Promise((r) => setTimeout(r, 3000));
          continue;
        }
        throw error;
      }
    }
  }

  protected async recreatePool(): Promise<void> {
    const old = this.pool;
    this.pool = new Pool(this.poolConfig as any);
    this.pool.on('error', () => {});
    if (old) {
      old.end().catch(() => {});
    }
  }

  protected static getTypeParsers() {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getTypeParser: (oid: number, format?: any) => {
        if (format === 'text' && customParsers[oid]) {
          return customParsers[oid];
        }
        return pgTypes.getTypeParser(oid, format);
      },
    } as any;
  }

  async queryRaw(query: SqlQuery): Promise<SqlResultSet> {
    const { sql, args } = query;
    const values = args.map((arg, i) => mapArg(arg, query.argTypes[i]));

    const result = await this.runWithRetry((pool) =>
      pool.query(
        { text: sql, values, rowMode: 'array', types: RobustPgQueryable.getTypeParsers() } as any,
        values,
      ),
    );

    const { fields, rows } = result;
    const columnNames = fields.map((field: any) => field.name);
    let columnTypes: (typeof ColumnTypeEnum)[keyof typeof ColumnTypeEnum][] = [];
    try {
      columnTypes = fields.map((field: any) => fieldToColumnType(field.dataTypeID));
    } catch (e) {
      if (e instanceof UnsupportedNativeDataType) {
        throw new DriverAdapterError({ kind: 'UnsupportedNativeDataType', type: e.type });
      }
      throw e;
    }
    return { columnNames, columnTypes, rows };
  }

  async executeRaw(query: SqlQuery): Promise<number> {
    const { sql, args } = query;
    const values = args.map((arg, i) => mapArg(arg, query.argTypes[i]));

    const result = await this.runWithRetry((pool) =>
      pool.query(
        { text: sql, values, rowMode: 'array', types: RobustPgQueryable.getTypeParsers() } as any,
        values,
      ),
    );

    return result.rowCount ?? 0;
  }

  onError(error: unknown): never {
    throw new DriverAdapterError(convertDriverError(error));
  }
}

class RobustPgTransactionAdapter extends RobustPgQueryable implements Transaction {
  readonly options: Transaction['options'] = { usePhantomQuery: false };

  constructor(client: PoolClient, poolConfig: RobustPgConfig) {
    super(client as any, poolConfig, false);
  }

  private get client(): PoolClient {
    return this.pool as unknown as PoolClient;
  }

  async commit(): Promise<void> {
    try {
      await this.client.query('COMMIT');
    } finally {
      this.client.release();
    }
  }

  async rollback(): Promise<void> {
    try {
      await this.client.query('ROLLBACK');
    } finally {
      this.client.release();
    }
  }
}

export class RobustPgAdapter extends RobustPgQueryable implements SqlDriverAdapter {
  constructor(pool: Pool, poolConfig: RobustPgConfig) {
    super(pool, poolConfig);
  }

  async startTransaction(isolationLevel?: IsolationLevel): Promise<Transaction> {
    let client: PoolClient;
    for (let attempt = 0; ; attempt++) {
      try {
        client = await this.pool.connect();
        await client.query('BEGIN');
        if (isolationLevel) {
          await client.query(`SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`);
        }
        break;
      } catch (error: any) {
        if (attempt < 3 && isConnectionError(error)) {
          await this.recreatePool();
          continue;
        }
        throw new DriverAdapterError(convertDriverError(error));
      }
    }
    return new RobustPgTransactionAdapter(client!, this.poolConfig);
  }

  async executeScript(script: string): Promise<void> {
    const statements = script
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);
    for (const stmt of statements) {
      try {
        await this.pool.query(stmt);
      } catch (error: any) {
        if (isConnectionError(error)) {
          await this.recreatePool();
          await this.pool.query(stmt);
        } else {
          this.onError(error);
        }
      }
    }
  }

  getConnectionInfo() {
    return {
      supportsRelationJoins: true,
    };
  }

  async dispose(): Promise<void> {
    await this.pool.end();
  }

  underlyingDriver(): Pool {
    return this.pool;
  }
}

export class RobustPg {
  private pool: Pool | null = null;
  private readonly config: RobustPgConfig;

  constructor(config: RobustPgConfig) {
    this.config = config;
  }

  provider = 'postgres' as const;
  adapterName = 'robust-pg' as const;

  async connect(): Promise<SqlDriverAdapter> {
    this.pool = new Pool(this.config as any);
    this.pool.on('error', () => {});
    return new RobustPgAdapter(this.pool, this.config);
  }
}
