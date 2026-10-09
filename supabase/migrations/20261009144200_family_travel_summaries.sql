create or replace function public.get_family_travel_summaries()
returns table (
  family_group_id integer,
  travel_mode text,
  status text,
  member_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    profiles.family_group_id,
    coalesce(nullif(trim(travel_details.travel_mode), ''), 'Not shared yet'),
    coalesce(travel_details.status, 'not_submitted'),
    count(*)::bigint
  from public.profiles
  left join public.travel_details
    on travel_details.user_id = profiles.id
  group by
    profiles.family_group_id,
    coalesce(nullif(trim(travel_details.travel_mode), ''), 'Not shared yet'),
    coalesce(travel_details.status, 'not_submitted');
$$;

revoke all on function public.get_family_travel_summaries() from public;
grant execute on function public.get_family_travel_summaries() to authenticated;
