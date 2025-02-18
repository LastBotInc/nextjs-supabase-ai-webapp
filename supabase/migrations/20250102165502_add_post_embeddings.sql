-- Enable vector extension
create extension if not exists vector;

-- Add embedding column to posts table
alter table posts 
add column if not exists embedding vector(768);

-- Create a function to match similar posts
create or replace function match_posts(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  min_content_length int default 50
)
returns table (
  id uuid,
  title text,
  slug text,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    posts.id,
    posts.title,
    posts.slug,
    posts.content,
    1 - (posts.embedding <=> query_embedding) as similarity
  from posts
  where length(posts.content) >= min_content_length
    and posts.published = true
    and (1 - (posts.embedding <=> query_embedding)) > match_threshold
  order by posts.embedding <=> query_embedding
  limit match_count;
end;
$$; 