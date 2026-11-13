create table public.api_rate_limits (
  bucket text primary key,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0)
);

create index api_rate_limits_window_started_at_idx
  on public.api_rate_limits (window_started_at);

alter table public.api_rate_limits enable row level security;
revoke all on public.api_rate_limits from anon, authenticated;
grant all on public.api_rate_limits to service_role;

create or replace function public.consume_api_rate_limit(
  p_bucket text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed boolean;
begin
  if p_limit < 1 or p_window_seconds < 1 or length(p_bucket) <> 64 then
    raise exception 'Invalid rate-limit parameters.';
  end if;

  insert into public.api_rate_limits (bucket, window_started_at, request_count)
  values (p_bucket, now(), 1)
  on conflict (bucket) do update
  set
    window_started_at = case
      when public.api_rate_limits.window_started_at <= now() - make_interval(secs => p_window_seconds)
        then now()
      else public.api_rate_limits.window_started_at
    end,
    request_count = case
      when public.api_rate_limits.window_started_at <= now() - make_interval(secs => p_window_seconds)
        then 1
      else public.api_rate_limits.request_count + 1
    end;

  select request_count <= p_limit
  into allowed
  from public.api_rate_limits
  where bucket = p_bucket;

  delete from public.api_rate_limits
  where window_started_at < now() - interval '1 day';

  return allowed;
end;
$$;

revoke all on function public.consume_api_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_api_rate_limit(text, integer, integer) to service_role;

create table public.newsletter_subscribers (
  email text primary key check (email = lower(email)),
  subscribed_at timestamptz not null default now(),
  welcome_claimed_at timestamptz,
  welcome_sent_at timestamptz
);

alter table public.newsletter_subscribers enable row level security;
revoke all on public.newsletter_subscribers from anon, authenticated;
grant all on public.newsletter_subscribers to service_role;

create or replace function public.claim_newsletter_welcome(p_email text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed boolean;
begin
  insert into public.newsletter_subscribers (email)
  values (lower(p_email))
  on conflict (email) do nothing;

  update public.newsletter_subscribers
  set welcome_claimed_at = now()
  where email = lower(p_email)
    and welcome_sent_at is null
    and (
      welcome_claimed_at is null
      or welcome_claimed_at < now() - interval '15 minutes'
    )
  returning true into claimed;

  return coalesce(claimed, false);
end;
$$;

revoke all on function public.claim_newsletter_welcome(text) from public, anon, authenticated;
grant execute on function public.claim_newsletter_welcome(text) to service_role;
