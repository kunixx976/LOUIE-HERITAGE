create table public.customer_shop_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  cart jsonb not null default '[]'::jsonb,
  wishlist text[] not null default '{}',
  addresses jsonb not null default '[]'::jsonb,
  coupon_code text,
  updated_at timestamptz not null default now()
);

alter table public.customer_shop_data enable row level security;

create policy "Users can read their own shop data"
  on public.customer_shop_data for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own shop data"
  on public.customer_shop_data for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own shop data"
  on public.customer_shop_data for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on public.customer_shop_data from anon, authenticated;
grant select, insert, update on public.customer_shop_data to authenticated;
