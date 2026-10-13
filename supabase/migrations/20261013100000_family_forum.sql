create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null default 'Family member',
  kind text not null check (kind in ('question', 'feedback')),
  title text not null check (char_length(trim(title)) between 5 and 160),
  body text not null check (char_length(trim(body)) between 10 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null default 'Family member',
  body text not null check (char_length(trim(body)) between 2 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists forum_posts_created_at_idx
  on public.forum_posts (created_at desc);
create index if not exists forum_replies_post_created_at_idx
  on public.forum_replies (post_id, created_at);

create or replace function public.set_forum_author_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.author_name := coalesce(
    (
      select nullif(trim(profiles.full_name), '')
      from public.profiles
      where profiles.id = new.user_id
    ),
    'Family member'
  );
  return new;
end;
$$;

drop trigger if exists forum_posts_set_author_name on public.forum_posts;
create trigger forum_posts_set_author_name
before insert on public.forum_posts
for each row execute function public.set_forum_author_name();

drop trigger if exists forum_replies_set_author_name on public.forum_replies;
create trigger forum_replies_set_author_name
before insert on public.forum_replies
for each row execute function public.set_forum_author_name();

drop trigger if exists forum_posts_set_updated_at on public.forum_posts;
create trigger forum_posts_set_updated_at
before update on public.forum_posts
for each row execute function public.set_updated_at();

alter table public.forum_posts enable row level security;
alter table public.forum_replies enable row level security;

drop policy if exists "Authenticated members can read forum posts" on public.forum_posts;
create policy "Authenticated members can read forum posts"
on public.forum_posts for select
to authenticated
using (true);

drop policy if exists "Members can create their own forum posts" on public.forum_posts;
create policy "Members can create their own forum posts"
on public.forum_posts for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Authenticated members can read forum replies" on public.forum_replies;
create policy "Authenticated members can read forum replies"
on public.forum_replies for select
to authenticated
using (true);

drop policy if exists "Members can reply as themselves" on public.forum_replies;
create policy "Members can reply as themselves"
on public.forum_replies for insert
to authenticated
with check ((select auth.uid()) = user_id);

grant select, insert on public.forum_posts to authenticated;
grant select, insert on public.forum_replies to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'forum_posts'
    ) then
      execute 'alter publication supabase_realtime add table public.forum_posts';
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'forum_replies'
    ) then
      execute 'alter publication supabase_realtime add table public.forum_replies';
    end if;
  end if;
end;
$$;
