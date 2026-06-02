-- Victoriosa email auth profiles and settings.
-- Safe for staging. Production remains NO-GO.

alter table public.marketplace_profiles
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists avatar_url text,
  add column if not exists country text,
  add column if not exists city text,
  add column if not exists preferred_currency text not null default 'UYU',
  add column if not exists marketing_opt_in boolean not null default false,
  add column if not exists onboarding_completed boolean not null default false;

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'system' check (theme in ('system','light','dark')),
  language text not null default 'es' check (language in ('es','en','pt')),
  email_notifications boolean not null default true,
  product_recommendations boolean not null default true,
  autopilot_suggestions boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

drop policy if exists "profiles own update safe" on public.marketplace_profiles;
create policy "profiles own update safe" on public.marketplace_profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "settings own read or admin" on public.user_settings;
create policy "settings own read or admin" on public.user_settings
  for select using (user_id = auth.uid() or private.is_marketplace_admin());

drop policy if exists "settings own update or admin" on public.user_settings;
create policy "settings own update or admin" on public.user_settings
  for update using (user_id = auth.uid() or private.is_marketplace_admin())
  with check (user_id = auth.uid() or private.is_marketplace_admin());

revoke all on public.marketplace_profiles from anon;
revoke all on public.user_settings from anon;
grant select on public.marketplace_profiles to authenticated;
grant update (full_name, phone, avatar_url, country, city, preferred_currency, marketing_opt_in, onboarding_completed, updated_at) on public.marketplace_profiles to authenticated;
grant select on public.user_settings to authenticated;
grant update (theme, language, email_notifications, product_recommendations, autopilot_suggestions, updated_at) on public.user_settings to authenticated;

create or replace function private.handle_new_marketplace_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.marketplace_profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do update set email = excluded.email;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_victoriosa on auth.users;
create trigger on_auth_user_created_victoriosa
  after insert on auth.users
  for each row execute procedure private.handle_new_marketplace_user();

insert into public.marketplace_profiles (id, email)
select id, email from auth.users
on conflict (id) do update set email = excluded.email;

insert into public.user_settings (user_id)
select id from auth.users
on conflict (user_id) do nothing;
