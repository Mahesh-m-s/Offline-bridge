# Database

PostgreSQL 16 is the default persistence layer. Startup applies sorted SQL files from `server/src/migrations` exactly once, recording each filename in `schema_migrations`. Each migration runs in its own transaction. Startup then executes idempotent seeds.

Run `npm run db:migrate`, `npm run db:seed`, or, for a development database only, `NODE_ENV=development npm run db:reset` from `server/`. Tests and explicit `USE_MOCK_DB=true` may use the in-memory adapter. Normal development and production require PostgreSQL.

```mermaid
erDiagram
  USERS ||--o{ SUBMISSIONS : creates
  USERS ||--o{ GRIEVANCES : files
  SERVICE_FORMS ||--o{ SUBMISSIONS : describes
  SUBMISSIONS ||--o{ STATUS_HISTORY : tracks
  GRIEVANCES ||--o{ STATUS_HISTORY : tracks
  USERS { uuid id PK string name string phone UK string role }
  SERVICE_FORMS { uuid id PK string service_key UK string title string title_kn string category jsonb schema_json int version boolean is_active timestamptz updated_at }
  SCHEMES { uuid id PK string scheme_key UK string name string name_kn string description jsonb eligibility_rules_json string benefit boolean is_active }
  SUBMISSIONS { uuid id PK uuid client_uuid UK uuid user_id FK uuid form_id FK jsonb data_json string status string sync_status string reference_no UK timestamptz created_at timestamptz updated_at timestamptz synced_at }
  GRIEVANCES { uuid id PK uuid client_uuid UK uuid user_id FK string category string description string status string reference_no UK timestamptz created_at timestamptz updated_at timestamptz synced_at }
  STATUS_HISTORY { uuid id PK string entity_type uuid entity_id string old_status string new_status timestamptz changed_at }
```

Submission and grievance sync use `client_uuid` as the idempotency key. Duplicate sync updates `synced_at` and returns the existing row, while the original content remains authoritative. Status transitions can be recorded in `status_history`.
