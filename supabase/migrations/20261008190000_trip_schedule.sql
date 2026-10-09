create table if not exists public.schedule_meals (
  id uuid primary key default gen_random_uuid(),
  day_number integer not null check (day_number between 1 and 4),
  meal_type text not null check (meal_type in ('Breakfast', 'Lunch', 'Dinner')),
  title text check (title is null or char_length(trim(title)) between 1 and 120),
  notes text not null default '',
  split_mode text not null default 'single' check (split_mode in ('single', 'components')),
  hosted_by_group_id integer references public.family_groups (id) on delete set null,
  components jsonb not null default '[]'::jsonb check (jsonb_typeof(components) = 'array'),
  updated_at timestamptz not null default now(),
  unique (day_number, meal_type)
);

create table if not exists public.schedule_activities (
  id uuid primary key default gen_random_uuid(),
  day_number integer not null check (day_number between 1 and 4),
  time_slot text not null default '',
  title text not null check (char_length(trim(title)) between 1 and 120),
  description text not null default '',
  location text not null default '',
  organized_by_group_id integer references public.family_groups (id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.schedule_meals (day_number, meal_type)
select day_number, meal_type
from generate_series(1, 4) as days(day_number)
cross join (values ('Breakfast'), ('Lunch'), ('Dinner')) as meal_types(meal_type)
on conflict (day_number, meal_type) do nothing;

drop trigger if exists schedule_meals_set_updated_at on public.schedule_meals;
create trigger schedule_meals_set_updated_at
before update on public.schedule_meals
for each row execute function public.set_updated_at();

drop trigger if exists schedule_activities_set_updated_at on public.schedule_activities;
create trigger schedule_activities_set_updated_at
before update on public.schedule_activities
for each row execute function public.set_updated_at();

alter table public.schedule_meals enable row level security;
alter table public.schedule_activities enable row level security;

drop policy if exists "Authenticated users can manage schedule meals" on public.schedule_meals;
create policy "Authenticated users can manage schedule meals"
on public.schedule_meals for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage schedule activities" on public.schedule_activities;
create policy "Authenticated users can manage schedule activities"
on public.schedule_activities for all
to authenticated
using (true)
with check (true);

grant select, insert, update, delete on public.schedule_meals to authenticated;
grant select, insert, update, delete on public.schedule_activities to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'schedule_meals'
    ) then
      execute 'alter publication supabase_realtime add table public.schedule_meals';
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'schedule_activities'
    ) then
      execute 'alter publication supabase_realtime add table public.schedule_activities';
    end if;
  end if;
end;
$$;
