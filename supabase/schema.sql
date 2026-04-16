create extension if not exists "pgcrypto";

DO $$
BEGIN
  CREATE TYPE public.app_role AS ENUM ('visitor', 'user', 'admin', 'organizer');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE public.registration_status AS ENUM ('registered', 'waitlist', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.app_role not null default 'user',
  organization_id uuid references public.organizations(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text not null,
  long_description text not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  location text not null,
  cover_image text,
  is_published boolean not null default false,
  is_main_event boolean not null default false,
  created_by uuid not null references public.profiles(id) on delete restrict,
  organization_id uuid references public.organizations(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint events_date_check check (end_date > start_date)
);

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  registration_status public.registration_status not null default 'registered',
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, event_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger set_organizations_updated_at
before update on public.organizations
for each row
execute procedure public.set_updated_at();

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at();

create trigger set_events_updated_at
before update on public.events
for each row
execute procedure public.set_updated_at();

create or replace function public.slugify_text(input text)
returns text
language sql
immutable
as $$
  select regexp_replace(lower(trim(input)), '[^a-z0-9]+', '-', 'g');
$$;

create or replace function public.apply_event_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or length(trim(new.slug)) = 0 then
    new.slug = public.slugify_text(new.title);
  else
    new.slug = public.slugify_text(new.slug);
  end if;

  return new;
end;
$$;

create trigger set_event_slug
before insert or update on public.events
for each row
execute procedure public.apply_event_slug();

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'visitor'::public.app_role);
$$;

create or replace function public.has_any_role(roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = any(roles);
$$;

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if public.has_any_role(array['admin']::public.app_role[]) then
    return new;
  end if;

  if old.role is distinct from new.role then
    raise exception 'You are not allowed to change your role';
  end if;

  return new;
end;
$$;

create trigger prevent_role_escalation_trigger
before update on public.profiles
for each row
execute procedure public.prevent_role_escalation();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'user'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;

drop policy if exists organizations_select_all on public.organizations;
create policy organizations_select_all
on public.organizations
for select
using (true);

drop policy if exists organizations_admin_manage on public.organizations;
create policy organizations_admin_manage
on public.organizations
for all
using (public.has_any_role(array['admin']::public.app_role[]))
with check (public.has_any_role(array['admin']::public.app_role[]));

drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin
on public.profiles
for select
using (id = auth.uid() or public.has_any_role(array['admin']::public.app_role[]));

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self
on public.profiles
for insert
with check (id = auth.uid());

drop policy if exists profiles_update_self_or_admin on public.profiles;
create policy profiles_update_self_or_admin
on public.profiles
for update
using (id = auth.uid() or public.has_any_role(array['admin']::public.app_role[]))
with check (id = auth.uid() or public.has_any_role(array['admin']::public.app_role[]));

drop policy if exists events_public_read_published on public.events;
create policy events_public_read_published
on public.events
for select
using (
  is_published = true
  or public.has_any_role(array['admin', 'organizer']::public.app_role[])
);

drop policy if exists events_admin_organizer_insert on public.events;
create policy events_admin_organizer_insert
on public.events
for insert
with check (
  public.has_any_role(array['admin', 'organizer']::public.app_role[])
  and created_by = auth.uid()
);

drop policy if exists events_admin_organizer_update on public.events;
create policy events_admin_organizer_update
on public.events
for update
using (public.has_any_role(array['admin', 'organizer']::public.app_role[]))
with check (public.has_any_role(array['admin', 'organizer']::public.app_role[]));

drop policy if exists events_admin_organizer_delete on public.events;
create policy events_admin_organizer_delete
on public.events
for delete
using (public.has_any_role(array['admin', 'organizer']::public.app_role[]));

drop policy if exists registrations_select_own_or_staff on public.event_registrations;
create policy registrations_select_own_or_staff
on public.event_registrations
for select
using (
  user_id = auth.uid()
  or public.has_any_role(array['admin', 'organizer']::public.app_role[])
);

drop policy if exists registrations_insert_own on public.event_registrations;
create policy registrations_insert_own
on public.event_registrations
for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.events e
    where e.id = event_id
      and e.is_published = true
  )
);

drop policy if exists registrations_update_own_or_staff on public.event_registrations;
create policy registrations_update_own_or_staff
on public.event_registrations
for update
using (
  user_id = auth.uid()
  or public.has_any_role(array['admin', 'organizer']::public.app_role[])
)
with check (
  user_id = auth.uid()
  or public.has_any_role(array['admin', 'organizer']::public.app_role[])
);

drop policy if exists registrations_delete_own_or_staff on public.event_registrations;
create policy registrations_delete_own_or_staff
on public.event_registrations
for delete
using (
  user_id = auth.uid()
  or public.has_any_role(array['admin', 'organizer']::public.app_role[])
);

grant usage on schema public to anon, authenticated;
grant select on public.organizations to anon, authenticated;
grant select on public.events to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.events to authenticated;
grant select, insert, update, delete on public.event_registrations to authenticated;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.has_any_role(public.app_role[]) to authenticated;

insert into public.organizations (name, slug, description)
values
  ('Up Sport!', 'up-sport', 'Association porteuse de Solimouv’.'),
  ('Sport en Partage', 'sport-en-partage', 'Association partenaire orientée jeunesse.'),
  ('Handi Mouvement Solidaire', 'handi-mouvement-solidaire', 'Association partenaire orientée handisport.'),
  ('Passerelles Réfugiés', 'passerelles-refugies', 'Association partenaire orientée inclusion des personnes réfugiées.')
on conflict (slug) do nothing;
