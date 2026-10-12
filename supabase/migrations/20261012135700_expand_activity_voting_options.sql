alter table public.activity_votes
drop constraint if exists activity_votes_activity_id_check;

alter table public.activity_votes
add constraint activity_votes_activity_id_check
check (activity_id between 1 and 16);
