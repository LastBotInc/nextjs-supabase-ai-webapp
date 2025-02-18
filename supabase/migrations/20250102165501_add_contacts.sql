-- Create contacts table
create table contacts (
  id uuid default uuid_generate_v4() primary key not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  company text,
  email text not null,
  description text not null,
  status text default 'new' not null,
  constraint name_length check (char_length(name) >= 2),
  constraint email_format check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  constraint description_length check (char_length(description) >= 10)
);

-- Enable RLS
alter table contacts enable row level security;

-- Create updated_at trigger
create trigger handle_contacts_updated_at
  before update on contacts
  for each row execute procedure public.handle_updated_at(); 