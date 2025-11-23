import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { ConnectionPool, IProcedureResult, config as MSSqlConfig, VarChar } from "mssql";
import { databaseConfig } from "../../config/configuration";

export type StoredProcedureParam = [string, unknown];
export type StoredProcedureParamList = StoredProcedureParam[];

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private pool: ConnectionPool | null = null;

  constructor(
    @Inject(databaseConfig.KEY)
    private readonly dbConfig: ConfigType<typeof databaseConfig>
  ) {}

  private async getPool(): Promise<ConnectionPool> {
    if (this.pool?.connected) {
      return this.pool;
    }

    const config: MSSqlConfig = {
      user: this.dbConfig.user,
      password: this.dbConfig.password,
      server: this.dbConfig.server,
      database: this.dbConfig.database,
      port: this.dbConfig.port,
      options: {
        encrypt: this.dbConfig.encrypt,
        trustServerCertificate: true, // Required for local SQL Server with self-signed certificate
        enableArithAbort: true,
      },
      pool: this.dbConfig.pool,
      connectionTimeout: this.dbConfig.connectionTimeout,
      requestTimeout: this.dbConfig.requestTimeout,
    };

    this.pool = await new ConnectionPool(config).connect();
    return this.pool;
  }

  async createData<T = unknown>(
    typeNumber: 11 | 12,
    storedProcedure: string,
    parameters: StoredProcedureParamList = []
  ): Promise<T extends boolean ? boolean : unknown> {
    const pool = await this.getPool();
    const request = pool.request();

    parameters.forEach(([name, value]) => {
      if (!name) {
        return;
      }
      if (value === null || value === undefined) {
        request.input(name, value as null);
      } else if (typeof value === "number") {
        request.input(name, value);
      } else if (typeof value === "boolean") {
        request.input(name, value ? 1 : 0);
      } else if (value instanceof Date) {
        request.input(name, value);
      } else {
        request.input(name, VarChar, String(value));
      }
    });

    const result: IProcedureResult<unknown> = await request.execute(storedProcedure);

    if (typeNumber === 11) {
      const recordset = result.recordset ?? [];
      return recordset as never;
    }

    if (typeNumber === 12) {
      const rowsAffected = result.rowsAffected?.[0] ?? 0;
      const returnStatus = result.returnValue ?? 0;
      return (rowsAffected > 0 || returnStatus === 0) as never;
    }

    throw new Error(`Unsupported type number ${typeNumber}`);
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
  }
}

