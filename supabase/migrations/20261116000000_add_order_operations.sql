create table public.admin_users (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant all on public.admin_users to service_role;

insert into public.admin_users (email)
values ('kunikac2025@gmail.com')
on conflict (email) do nothing;

alter table public.orders
  add column if not exists customer_request_type text
    check (customer_request_type in ('cancellation', 'return')),
  add column if not exists customer_request_note text,
  add column if not exists customer_request_status text
    check (customer_request_status in ('pending', 'approved', 'rejected')),
  add column if not exists customer_request_created_at timestamptz,
  add column if not exists customer_request_resolved_at timestamptz,
  add column if not exists customer_request_resolved_by text,
  add column if not exists refund_status text not null default 'none'
    check (refund_status in ('none', 'pending', 'processed')),
  add column if not exists refund_reference text,
  add column if not exists refunded_at timestamptz;

create index if not exists orders_customer_request_status_idx
  on public.orders (customer_request_status, created_at desc)
  where customer_request_status = 'pending';

create or replace function public.submit_order_service_request(
  p_order_number text,
  p_customer_email text,
  p_request_type text,
  p_note text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  submitted boolean;
begin
  if p_order_number is null
    or p_customer_email is null
    or p_request_type is null
    or p_note is null
    or p_request_type not in ('cancellation', 'return')
    or length(p_note) < 10
    or length(p_note) > 1000 then
    raise exception 'Invalid order service request.';
  end if;

  update public.orders
  set
    customer_request_type = p_request_type,
    customer_request_note = p_note,
    customer_request_status = 'pending',
    customer_request_created_at = now(),
    customer_request_resolved_at = null,
    customer_request_resolved_by = null
  where order_number = p_order_number
    and customer_email = lower(p_customer_email)
    and customer_request_status is distinct from 'pending'
    and (
      (p_request_type = 'cancellation' and status in ('Awaiting payment', 'Processing', 'Preparing'))
      or (p_request_type = 'return' and status = 'Delivered')
    )
  returning true into submitted;

  return coalesce(submitted, false);
end;
$$;

revoke all on function public.submit_order_service_request(text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.submit_order_service_request(text, text, text, text)
  to service_role;
