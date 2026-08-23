-- Fixes a real access gap found by comparing V2 against V1's production
drop policy if exists "call_feedback_select" on public.call_feedback;
create policy "call_feedback_select" on public.call_feedback for select
  using (
    public.current_role() in ('admin', 'experienceadmin', 'expteam')
    or exists (select 1 from public.call_assignments a where a.first_timer_id = call_feedback.first_timer_id and a.assigned_to = auth.uid())
  );
