alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on tables from authenticated;
alter default privileges in schema public revoke all on functions from anon;
alter default privileges in schema public revoke all on functions from authenticated;

revoke select on all tables in schema public from anon;
revoke select on all tables in schema public from authenticated;
revoke usage on all sequences in schema public from anon;
revoke usage on all sequences in schema public from authenticated;
revoke execute on all functions in schema public from anon;
revoke execute on all functions in schema public from authenticated;

create table profiles (
  user_id uuid not null primary key references auth.users,
  username citext unique check (length(username) between 3 and 60),
  avatar_url text check (avatar_url ~ '^https?://\S+$'),
);
alter table profiles enable row level security;
grant
  select,
  insert (username, avatar_url, website),
  update (username, avatar_url, website),
  delete
on profiles to authenticated;
create policy select_own on profiles
  for select using (true);
create policy insert_own on profiles
  for insert with check (user_id = auth.uid());
create policy update_own on profiles
  for update using (user_id = auth.uid());
create policy delete_own on profiles
  for delete using (user_id = auth.uid());

grant select on profiles to anon;
grant select on profiles to authenticated;

create function public.create_profile() returns trigger as $$
begin
  insert into public.profiles (user_id, username, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'preferred_username',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger
  create_profile_on_signup
  after insert on auth.users
  for each row
  execute procedure public.create_profile();

create table comments (
  comment_id integer primary key generated always as identity,
  user_id uuid default auth.uid() references profiles,
  parent_id integer references comments,
  slug text not null,
  body text not null check (length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
alter table comments enable row level security;
grant
  select,
  insert (slug, body, parent_id),
  update (body),
  delete
on comments to authenticated;
create policy select_own on comments
  for select using (true);
create policy insert_own on comments
  for insert with check (user_id = auth.uid());
create policy update_own on comments
  for update using (user_id = auth.uid());
create policy delete_own on comments
  for delete using (user_id = auth.uid());

grant select on comments to anon;
grant select on comments to authenticated;

drop function if exists comment_tree;
create function comment_tree(
  comment_id int
) returns json as $$
  select json_build_object(
    'comment_id', c.comment_id,
    'user', json_build_object(
      'username', u.username,
      'avatar_url', u.avatar_url,
      'user_id', u.user_id
    ),
    'body', body,
    'created_at', c.created_at,
    'children', children
  )
  from comments c
    left join profiles u using(user_id),
    lateral (
      select
        coalesce(json_agg(
          comment_tree(comments.comment_id)
          order by created_at asc
        ), '[]') as children
      from comments
      where parent_id = c.comment_id
    ) as get_children
  where
    c.comment_id = comment_tree.comment_id
$$ language sql stable;

create function threaded_comments(
  slug text
) returns json as $$
  select
    coalesce(json_agg(
      comment_tree(comment_id)
      order by c.created_at desc
    ), '[]') as comments
  from comments c
  where c.parent_id is null
    and c.slug = threaded_comments.slug
$$ language sql stable;

create function comments_stats() returns json as $$
  select
    coalesce(json_object(
      array_agg(slug),
      array_agg(count)
    ), '{}')
  from (
    select
      slug,
      count(slug)
    from comments
    group by slug
  ) as get_counts
$$ language sql stable;
grant execute on function comments_stats to anon;
grant execute on function comments_stats to authenticated;

create schema if not exists hidden;
grant all privileges on schema hidden to anon;

create table hidden.likes (
  id text not null default current_setting('request.headers', true)::json->>'cf-connecting-ip',
  slug text not null,
  votes int not null,
  primary key (id, slug)
);

grant select, insert, update on hidden.likes to anon;

create or replace function get_likes(post text) returns json as $$
  select json_build_object(
    'total', coalesce(sum(votes), 0),
    'available', 15 - coalesce((
      select votes
      from hidden.likes
      where slug = post
        and id = current_setting('request.headers', true)::json->>'cf-connecting-ip'
    ), 0)
  )
  from
    hidden.likes
  where likes.slug = post
$$ language sql stable;

drop function if exists like_post;
create or replace function like_post(post text, requested_votes int default 1) returns json as $$
declare
  score int;
  ip text;
  likes json;
begin
  if (requested_votes not between 1 and 15) then
    raise exception 'Votes must be between 1 and 15';
  end if;

  select current_setting('request.headers', true)::json->>'cf-connecting-ip' into ip;

  select sum(votes) into score
  from hidden.likes
  where slug = post and id = ip;

  if score >= 15 then
    raise exception 'Maximum likes reached';
  end if;

  insert into hidden.likes (id, slug, votes)
  values (ip, post, requested_votes)
  on conflict (id, slug) do update set votes = requested_votes;

  select get_likes(post) into likes;
  return likes;
end;
$$ language plpgsql volatile;

grant execute on function like_post to anon;
grant execute on function get_likes to anon;

drop function if exists top_likes();
create or replace function top_likes() returns table(slug text, total_votes int, avg float) as $$
  select
    slug,
    sum(votes) as total_votes,
    sum(votes) / count(id) as avg
  from hidden.likes
  group by slug
  order by total_votes desc
$$ language sql stable;
grant execute on function top_likes to anon;
