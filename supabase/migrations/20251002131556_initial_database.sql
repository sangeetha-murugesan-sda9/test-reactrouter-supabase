-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- =============================================
-- STEP 1: Create all tables
-- =============================================

-- User Profiles Table
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Teams Table
create table public.teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  creator_user_id uuid references public.user_profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Team Members Table
create table public.team_members (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(team_id, user_id)
);

-- Templates Table
create table public.templates (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  team_id uuid not null references public.teams(id) on delete cascade,
  creator_user_id uuid references public.user_profiles(id) on delete set null,
  duration integer,
  thumbnail_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Template Locales Table
create table public.template_locales (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid not null references public.templates(id) on delete cascade,
  locale text not null,
  last_render_url text,
  thumbnail_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(template_id, locale)
);

-- =============================================
-- STEP 2: Create indexes
-- =============================================

-- Teams indexes
create index teams_slug_idx on public.teams(slug);

-- Team Members indexes
create index team_members_team_id_idx on public.team_members(team_id);
create index team_members_user_id_idx on public.team_members(user_id);

-- Templates indexes
create index templates_team_id_idx on public.templates(team_id);
create index templates_creator_user_id_idx on public.templates(creator_user_id);

-- Template Locales indexes
create index template_locales_template_id_idx on public.template_locales(template_id);
create index template_locales_locale_idx on public.template_locales(locale);

-- =============================================
-- STEP 3: Enable Row Level Security
-- =============================================

alter table public.user_profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.templates enable row level security;
alter table public.template_locales enable row level security;

-- =============================================
-- STEP 4: Create RLS Policies
-- =============================================

-- User Profiles Policies
create policy "Users can view all profiles"
  on public.user_profiles for select
  using (true);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

-- Teams Policies
create policy "Users can view teams they are members of"
  on public.teams for select
  using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = teams.id
      and team_members.user_id = auth.uid()
    )
  );

create policy "Team creators can insert teams"
  on public.teams for insert
  with check (auth.uid() = creator_user_id);

create policy "Team members can update their team"
  on public.teams for update
  using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = teams.id
      and team_members.user_id = auth.uid()
    )
  );

-- Team Members Policies
-- Simplified: All authenticated users can view team_members (needed for other policies)
create policy "Authenticated users can view team members"
  on public.team_members for select
  to authenticated
  using (true);

-- Only authenticated users can insert team members (further restricted by app logic)
create policy "Authenticated users can insert team members"
  on public.team_members for insert
  to authenticated
  with check (true);

-- Only authenticated users can delete team members (further restricted by app logic)
create policy "Authenticated users can delete team members"
  on public.team_members for delete
  to authenticated
  using (true);

-- Templates Policies
create policy "Users can view templates of their teams"
  on public.templates for select
  using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = templates.team_id
      and team_members.user_id = auth.uid()
    )
  );

create policy "Team members can insert templates"
  on public.templates for insert
  with check (
    exists (
      select 1 from public.team_members
      where team_members.team_id = templates.team_id
      and team_members.user_id = auth.uid()
    )
  );

create policy "Team members can update templates"
  on public.templates for update
  using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = templates.team_id
      and team_members.user_id = auth.uid()
    )
  );

create policy "Team members can delete templates"
  on public.templates for delete
  using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = templates.team_id
      and team_members.user_id = auth.uid()
    )
  );

-- Template Locales Policies
create policy "Users can view template locales of their team templates"
  on public.template_locales for select
  using (
    exists (
      select 1 from public.templates
      join public.team_members on team_members.team_id = templates.team_id
      where templates.id = template_locales.template_id
      and team_members.user_id = auth.uid()
    )
  );

create policy "Team members can insert template locales"
  on public.template_locales for insert
  with check (
    exists (
      select 1 from public.templates
      join public.team_members on team_members.team_id = templates.team_id
      where templates.id = template_locales.template_id
      and team_members.user_id = auth.uid()
    )
  );

create policy "Team members can update template locales"
  on public.template_locales for update
  using (
    exists (
      select 1 from public.templates
      join public.team_members on team_members.team_id = templates.team_id
      where templates.id = template_locales.template_id
      and team_members.user_id = auth.uid()
    )
  );

create policy "Team members can delete template locales"
  on public.template_locales for delete
  using (
    exists (
      select 1 from public.templates
      join public.team_members on team_members.team_id = templates.team_id
      where templates.id = template_locales.template_id
      and team_members.user_id = auth.uid()
    )
  );

-- =============================================
-- STEP 5: Create functions and triggers
-- =============================================

-- Function for automatic updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger set_updated_at
  before update on public.user_profiles
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.teams
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.templates
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.template_locales
  for each row
  execute function public.handle_updated_at();
