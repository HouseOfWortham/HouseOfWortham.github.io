create table if not exists public.activity_votes (
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_id integer not null check (activity_id in (1, 2, 3, 4, 5, 6)),
  rating smallint not null check (rating between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (user_id, activity_id)
);

create or replace function public.set_activity_vote_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists activity_votes_set_updated_at on public.activity_votes;
create trigger activity_votes_set_updated_at
before update on public.activity_votes
for each row execute function public.set_activity_vote_updated_at();

alter table public.activity_votes enable row level security;

drop policy if exists "Users can read their own activity votes" on public.activity_votes;
create policy "Users can read their own activity votes"
on public.activity_votes for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own activity votes" on public.activity_votes;
create policy "Users can create their own activity votes"
on public.activity_votes for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own activity votes" on public.activity_votes;
create policy "Users can update their own activity votes"
on public.activity_votes for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.get_activity_vote_counts()
returns table (activity_id integer, rating smallint, vote_count bigint)
language sql
security definer
set search_path = ''
as $$
  select votes.activity_id, votes.rating, count(*)::bigint
  from public.activity_votes as votes
  group by votes.activity_id, votes.rating;
$$;

revoke all on function public.get_activity_vote_counts() from public;
grant execute on function public.get_activity_vote_counts() to anon, authenticated;
grant select, insert, update on public.activity_votes to authenticated;
