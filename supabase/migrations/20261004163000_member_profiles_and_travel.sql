create table if not exists public.family_groups (
  id integer primary key,
  name text not null unique,
  home_base text not null,
  color text not null
);

insert into public.family_groups (id, name, home_base, color)
values
  (1, 'The Hambelton Homestead', 'Boise, ID', '#ff7a59'),
  (2, 'The Badger Borough', 'Boise, ID', '#1f9e9a'),
  (3, 'The Treasure Valley Hunts', 'Boise, ID', '#f2b544'),
  (4, 'The Marevelous McBrides', 'Richmond, VA', '#3d6fb6'),
  (5, 'The Wortham Wing', 'Charlotte, NC', '#903db6')
on conflict (id) do update
set name = excluded.name,
    home_base = excluded.home_base,
    color = excluded.color;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 1 and 100),
  avatar_url text,
  family_group_id integer not null references public.family_groups (id) on delete restrict,
  updated_at timestamptz not null default now()
);

create table if not exists public.travel_details (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('confirmed', 'pending', 'not_booked')),
  travel_mode text not null default '',
  flight_info text not null default '',
  arrival text not null default '',
  lodging_name text not null default '',
  lodging_address text not null default '',
  notes text not null default '',
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists travel_details_set_updated_at on public.travel_details;
create trigger travel_details_set_updated_at
before update on public.travel_details
for each row execute function public.set_updated_at();

alter table public.family_groups enable row level security;
alter table public.profiles enable row level security;
alter table public.travel_details enable row level security;

drop policy if exists "Authenticated users can read family groups" on public.family_groups;
create policy "Authenticated users can read family groups"
on public.family_groups for select
to authenticated
using (true);

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can read their own travel details" on public.travel_details;
create policy "Users can read their own travel details"
on public.travel_details for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own travel details" on public.travel_details;
create policy "Users can create their own travel details"
on public.travel_details for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own travel details" on public.travel_details;
create policy "Users can update their own travel details"
on public.travel_details for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant select on public.family_groups to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.travel_details to authenticated;
