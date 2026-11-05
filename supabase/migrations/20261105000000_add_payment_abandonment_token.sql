alter table public.orders
  add column if not exists abandonment_token_hash text,
  add column if not exists tracking_carrier text,
  add column if not exists tracking_number text,
  add column if not exists tracking_url text;
