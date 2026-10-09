alter table public.schedule_meals
add column if not exists time_slot text not null default '';

update public.schedule_meals
set time_slot = case meal_type
  when 'Breakfast' then '08:00'
  when 'Lunch' then '12:30'
  when 'Dinner' then '18:30'
end
where time_slot = '';
