-- Prevent authenticated users from escalating marketplace profile roles.
-- Safe for staging. Production remains NO-GO.

revoke update on public.marketplace_profiles from authenticated;
grant update (
  full_name,
  phone,
  avatar_url,
  country,
  city,
  preferred_currency,
  marketing_opt_in,
  onboarding_completed,
  updated_at
) on public.marketplace_profiles to authenticated;

revoke update on public.user_settings from authenticated;
grant update (
  theme,
  language,
  email_notifications,
  product_recommendations,
  autopilot_suggestions,
  updated_at
) on public.user_settings to authenticated;

create or replace function private.prevent_marketplace_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role and auth.role() <> 'service_role' then
    raise exception 'marketplace profile role changes require service role';
  end if;
  return new;
end;
$$;

revoke all on function private.prevent_marketplace_profile_role_change() from public;

drop trigger if exists prevent_marketplace_profile_role_change on public.marketplace_profiles;
create trigger prevent_marketplace_profile_role_change
  before update of role on public.marketplace_profiles
  for each row execute procedure private.prevent_marketplace_profile_role_change();
