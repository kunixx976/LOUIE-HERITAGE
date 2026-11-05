create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_email text not null,
  customer_name text not null,
  shipping_address jsonb not null,
  items jsonb not null,
  subtotal integer not null check (subtotal >= 0),
  discount integer not null default 0 check (discount >= 0),
  shipping_fee integer not null check (shipping_fee >= 0),
  total integer not null check (total >= 0),
  currency text not null default 'INR',
  payment_method text not null check (payment_method in ('razorpay', 'cod')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'cod_due', 'failed', 'refunded')),
  status text not null default 'Processing',
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  confirmation_email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
revoke all on public.orders from anon, authenticated;
