import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { Pool } from "pg";

import { createDemoSnapshot, type LaunchpadSnapshot } from "@meme-launchpad/shared";

export interface SnapshotRepository {
  read(): Promise<LaunchpadSnapshot>;
  write(snapshot: LaunchpadSnapshot): Promise<void>;
}

export class FileSnapshotRepository implements SnapshotRepository {
  private cache?: LaunchpadSnapshot;

  public constructor(private readonly filePath: string) {}

  public async read(): Promise<LaunchpadSnapshot> {
    if (this.cache) {
      return structuredClone(this.cache);
    }

    await mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      const content = await readFile(this.filePath, "utf8");
      this.cache = JSON.parse(content) as LaunchpadSnapshot;
    } catch {
      this.cache = createDemoSnapshot();
      await this.write(this.cache);
    }

    return structuredClone(this.cache);
  }

  public async write(snapshot: LaunchpadSnapshot): Promise<void> {
    this.cache = structuredClone(snapshot);
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(snapshot, null, 2), "utf8");
  }
}

export class PostgresSnapshotRepository implements SnapshotRepository {
  private readonly pool: Pool;
  private initialized?: Promise<void>;
  private readonly singletonKey = "launchpad-default";

  public constructor(private readonly databaseUrl: string) {
    this.pool = new Pool({
      connectionString: databaseUrl
    });
  }

  public async read(): Promise<LaunchpadSnapshot> {
    await this.ensureTable();
    const result = await this.pool.query<{ payload: LaunchpadSnapshot }>(
      "select payload from launchpad_snapshots where snapshot_key = $1 limit 1",
      [this.singletonKey]
    );

    const row = result.rows[0];
    if (!row) {
      const snapshot = createDemoSnapshot();
      await this.write(snapshot);
      return snapshot;
    }

    return structuredClone(row.payload);
  }

  public async write(snapshot: LaunchpadSnapshot): Promise<void> {
    await this.ensureTable();
    await this.pool.query(
      `
        insert into launchpad_snapshots (snapshot_key, payload, updated_at)
        values ($1, $2::jsonb, now())
        on conflict (snapshot_key)
        do update set payload = excluded.payload, updated_at = now()
      `,
      [this.singletonKey, JSON.stringify(snapshot)]
    );
  }

  private async ensureTable(): Promise<void> {
    if (!this.initialized) {
      this.initialized = this.pool
        .query(`
          create table if not exists launchpad_snapshots (
            snapshot_key text primary key,
            payload jsonb not null,
            updated_at timestamptz not null default now()
          )
        `)
        .then(() => undefined);
    }

    await this.initialized;
  }
}

const resolveWorkspaceRoot = (): string =>
  process.cwd().includes(`${path.sep}apps${path.sep}api`)
    ? path.resolve(process.cwd(), "..", "..")
    : process.cwd();

export const createSnapshotRepository = (
  databaseUrl: string,
  dataFile: string
): SnapshotRepository =>
  databaseUrl
    ? new PostgresSnapshotRepository(databaseUrl)
    : new FileSnapshotRepository(path.resolve(resolveWorkspaceRoot(), dataFile));

export const resolveWorkspacePath = (...segments: string[]): string =>
  path.resolve(resolveWorkspaceRoot(), ...segments);
