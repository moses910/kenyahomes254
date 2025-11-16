-- Enable extensions
create extension if not exists "pgcrypto";

-- Profiles table (linked to auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null check (role in ('seeker','agent','admin')),
  name text,
  phone text,
  verified boolean default false,
  created_at timestamptz default now()
);

-- Properties table
create table properties (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  price numeric check (price >= 0),
  currency text default 'KES',
  for_rent boolean default false,
  beds int default 0,
  baths int default 0,
  area_sqft int,
  address text,
  city text,
  region text,
  latitude numeric,
  longitude numeric,
  status text default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz default now()
);

create index idx_properties_agent on properties(agent_id);
create index idx_properties_price on properties(price);
create index idx_properties_city on properties(city);

-- Property photos table
create table property_photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  storage_path text not null,
  thumb_path text,
  med_path text,
  ordering int default 0,
  created_at timestamptz default now()
);

create index idx_property_photos_property on property_photos(property_id);

-- Saved properties (favorites)
create table saved_properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, property_id)
);

create index idx_saved_user on saved_properties(user_id);
create index idx_saved_property on saved_properties(property_id);

-- Messages/inquiries table
create table messages (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  seeker_id uuid not null references profiles(id) on delete cascade,
  agent_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  email text,
  phone text,
  status text default 'unread' check (status in ('unread','read','responded')),
  created_at timestamptz default now()
);

create index idx_messages_property on messages(property_id);
create index idx_messages_agent on messages(agent_id);
create index idx_messages_seeker on messages(seeker_id);

-- Processing logs for image processing
create table processing_logs (
  id uuid primary key default gen_random_uuid(),
  photo_storage_path text not null,
  error_message text,
  status text not null,
  created_at timestamptz default now()
);

-- Market data table for analytics
create table market_data (
  id uuid primary key default gen_random_uuid(),
  region text not null,
  period date not null,
  avg_price numeric,
  count_listings int default 0,
  created_at timestamptz default now()
);

-- Row Level Security Policies

-- Profiles: Users can read all profiles, but only update their own
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Properties: Published properties viewable by all, agents manage their own
alter table properties enable row level security;

create policy "Published properties are viewable by everyone"
  on properties for select
  using (status = 'published' or agent_id = auth.uid());

create policy "Agents can insert their own properties"
  on properties for insert
  with check (auth.uid() = agent_id);

create policy "Agents can update their own properties"
  on properties for update
  using (auth.uid() = agent_id);

create policy "Agents can delete their own properties"
  on properties for delete
  using (auth.uid() = agent_id);

-- Property photos: Follow property permissions
alter table property_photos enable row level security;

create policy "Photos viewable if property is viewable"
  on property_photos for select
  using (
    exists (
      select 1 from properties
      where properties.id = property_photos.property_id
      and (properties.status = 'published' or properties.agent_id = auth.uid())
    )
  );

create policy "Agents can insert photos for their properties"
  on property_photos for insert
  with check (
    exists (
      select 1 from properties
      where properties.id = property_photos.property_id
      and properties.agent_id = auth.uid()
    )
  );

create policy "Agents can update photos for their properties"
  on property_photos for update
  using (
    exists (
      select 1 from properties
      where properties.id = property_photos.property_id
      and properties.agent_id = auth.uid()
    )
  );

create policy "Agents can delete photos for their properties"
  on property_photos for delete
  using (
    exists (
      select 1 from properties
      where properties.id = property_photos.property_id
      and properties.agent_id = auth.uid()
    )
  );

-- Saved properties: Users manage their own
alter table saved_properties enable row level security;

create policy "Users can view their own saved properties"
  on saved_properties for select
  using (auth.uid() = user_id);

create policy "Users can save properties"
  on saved_properties for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave properties"
  on saved_properties for delete
  using (auth.uid() = user_id);

-- Messages: Agents see messages for their properties, seekers see their own
alter table messages enable row level security;

create policy "Agents can view messages for their properties"
  on messages for select
  using (auth.uid() = agent_id);

create policy "Seekers can view their own messages"
  on messages for select
  using (auth.uid() = seeker_id);

create policy "Authenticated users can send messages"
  on messages for insert
  with check (auth.uid() = seeker_id);

create policy "Agents can update message status"
  on messages for update
  using (auth.uid() = agent_id);

-- Processing logs: Service role only (no RLS needed for MVP)
alter table processing_logs enable row level security;

create policy "Service role can manage processing logs"
  on processing_logs for all
  using (auth.role() = 'service_role');

-- Market data: Read-only for everyone
alter table market_data enable row level security;

create policy "Market data viewable by everyone"
  on market_data for select
  using (true);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'seeker'),
    new.raw_user_meta_data->>'name'
  );
  return new;
end;
$$;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();