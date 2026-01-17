-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Table: tokens
create table if not exists tokens (
  id uuid primary key default uuid_generate_v4(),
  coin_type text unique not null,
  created_at timestamptz default now()
);

-- Table: token_snapshots
create table if not exists token_snapshots (
  id uuid primary key default uuid_generate_v4(),
  token_id uuid references tokens(id) on delete cascade not null,
  holder_count int not null,
  new_token_name text,
  old_token_name text,
  created_at timestamptz default now()
);

-- Table: token_holders (Optional, for detailed storage)
create table if not exists token_holders (
  id uuid primary key default uuid_generate_v4(),
  snapshot_id uuid references token_snapshots(id) on delete cascade not null,
  owner_address text not null,
  balance numeric not null,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_tokens_coin_type on tokens(coin_type);
create index if not exists idx_token_snapshots_token_id on token_snapshots(token_id);
create index if not exists idx_token_holders_snapshot_id on token_holders(snapshot_id);
