-- Admin reports: allow admins to read all progress/profile rows and speed up report queries.

create index if not exists lesson_progress_lesson_id_last_seen_at_idx
  on public.lesson_progress (lesson_id, last_seen_at);

create index if not exists lesson_progress_user_id_lesson_id_idx
  on public.lesson_progress (user_id, lesson_id);

drop policy if exists admin_can_read_all_progress on public.lesson_progress;
create policy admin_can_read_all_progress
  on public.lesson_progress
  for select
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

drop policy if exists admin_can_read_all_profiles on public.profiles;
create policy admin_can_read_all_profiles
  on public.profiles
  for select
  using (
    exists (
      select 1
      from public.profiles as p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );
