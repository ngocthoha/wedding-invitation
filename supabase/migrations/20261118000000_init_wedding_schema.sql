-- Supabase Schema for NgayChungDoi.com (Project: wedding-invitation / rwudhtiqamsdietodurx)

create table if not exists public.app_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.users (
  id text primary key,
  email text not null,
  name text,
  role text default 'user',
  credits integer default 10,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.templates (
  id text primary key,
  raw_id text not null,
  name text not null,
  kind text not null,
  category text,
  thumbnail text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.cards (
  id text primary key,
  slug text not null,
  template_id text not null,
  title text,
  groom_name text,
  bride_name text,
  wedding_date text,
  status text default 'PUBLISHED',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guests (
  id text primary key,
  card_id text not null,
  guest_slug text,
  guest_name text,
  attendance_status text default 'PENDING',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.rsvps (
  id text primary key,
  card_id text not null,
  name text not null,
  phone text,
  attending text default 'YES',
  guests_count integer default 1,
  message text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.guestbook (
  id text primary key,
  card_id text not null,
  author_name text not null,
  relationship text,
  message text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.app_state enable row level security;
alter table public.users enable row level security;
alter table public.templates enable row level security;
alter table public.cards enable row level security;
alter table public.guests enable row level security;
alter table public.rsvps enable row level security;
alter table public.guestbook enable row level security;

create policy "Allow public read/write on app_state" on public.app_state for all using (true) with check (true);
create policy "Allow public read/write on users" on public.users for all using (true) with check (true);
create policy "Allow public read/write on templates" on public.templates for all using (true) with check (true);
create policy "Allow public read/write on cards" on public.cards for all using (true) with check (true);
create policy "Allow public read/write on guests" on public.guests for all using (true) with check (true);
create policy "Allow public read/write on rsvps" on public.rsvps for all using (true) with check (true);
create policy "Allow public read/write on guestbook" on public.guestbook for all using (true) with check (true);
