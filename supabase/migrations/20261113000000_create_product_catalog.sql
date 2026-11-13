create table public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  price integer not null check (price >= 0),
  active boolean not null default true
);

create table public.product_variants (
  id text primary key,
  product_id text not null references public.products (id) on delete cascade,
  sku text not null unique,
  size text not null,
  color text not null,
  color_hex text not null,
  stock_count integer not null default 0 check (stock_count >= 0),
  unique (product_id, size, color)
);

alter table public.products enable row level security;
alter table public.product_variants enable row level security;

create policy "Public can read active products"
  on public.products for select to anon, authenticated
  using (active);

create policy "Public can read active product variants"
  on public.product_variants for select to anon, authenticated
  using (
    exists (
      select 1
      from public.products
      where products.id = product_variants.product_id
        and products.active
    )
  );

revoke all on public.products, public.product_variants from anon, authenticated;
grant select on public.products, public.product_variants to anon, authenticated;

insert into public.products (id, slug, name, price) values
  ('1', 'tirupur-classic-cotton-tee', 'Classic Cotton T-Shirt', 799),
  ('2', 'oversized-drop-shoulder-tee', 'Oversized Drop-Shoulder Tee', 1099),
  ('3', 'ahmedabad-straight-fit-jeans', 'Straight-Fit Jeans', 1899),
  ('4', 'bhilwara-high-rise-jeans', 'High-Rise Jeans', 2099),
  ('5', 'surat-georgette-saree', 'Georgette Saree', 2499),
  ('6', 'surat-anarkali-kurta-set', 'Anarkali Kurta Set', 2899),
  ('7', 'ludhiana-merino-crew-sweater', 'Merino Crew Sweater', 1799),
  ('8', 'ludhiana-long-cardigan', 'Long Cardigan', 2199),
  ('9', 'panipat-cotton-bedsheet-set', 'Cotton Bedsheet Set', 1499),
  ('10', 'panipat-handloom-throw', 'Cotton Throw', 1199),
  ('11', 'cotton-poplin-casual-shirt', 'Cotton Poplin Casual Shirt', 1299),
  ('12', 'handloom-cotton-stole', 'Cotton Stole', 649);

with variant_seed (product_id, color, color_hex, inventory) as (
  values
    ('1', 'Ecru', '#EFEAE1', '{"XS":12,"S":18,"M":20,"L":15,"XL":10}'::jsonb),
    ('1', 'Stone', '#C9C2B6', '{"XS":8,"S":14,"M":16,"L":12,"XL":7}'::jsonb),
    ('1', 'Black', '#111111', '{"XS":6,"S":10,"M":12,"L":8,"XL":4}'::jsonb),
    ('2', 'Off White', '#F2EFE9', '{"XS":7,"S":12,"M":15,"L":11,"XL":8}'::jsonb),
    ('2', 'Charcoal', '#3A3A3A', '{"XS":5,"S":11,"M":13,"L":10,"XL":6}'::jsonb),
    ('3', 'Mid Indigo', '#3C5878', '{"28":4,"30":8,"32":10,"34":8,"36":5,"38":3}'::jsonb),
    ('3', 'Jet Black', '#1A1A1A', '{"28":3,"30":7,"32":9,"34":7,"36":4,"38":2}'::jsonb),
    ('4', 'Light Wash', '#8FA6BE', '{"28":5,"30":7,"32":9,"34":6,"36":3,"38":2}'::jsonb),
    ('4', 'Deep Indigo', '#2E4463', '{"28":4,"30":7,"32":8,"34":7,"36":5,"38":2}'::jsonb),
    ('5', 'Deep Maroon', '#6E1F2A', '{"One size":6}'::jsonb),
    ('5', 'Ivory', '#EFE9DE', '{"One size":8}'::jsonb),
    ('6', 'Powder Blue', '#B7C7D6', '{"XS":6,"S":9,"M":8,"L":7,"XL":4}'::jsonb),
    ('6', 'Clay', '#C08A6E', '{"XS":5,"S":8,"M":7,"L":6,"XL":3}'::jsonb),
    ('7', 'Oatmeal', '#DCD3C3', '{"XS":5,"S":8,"M":10,"L":8,"XL":4}'::jsonb),
    ('7', 'Bottle Green', '#2F4A3C', '{"XS":4,"S":7,"M":9,"L":7,"XL":3}'::jsonb),
    ('8', 'Camel', '#B48450', '{"XS":3,"S":7,"M":9,"L":7,"XL":4}'::jsonb),
    ('8', 'Grey Melange', '#B9BDC1', '{"XS":2,"S":6,"M":8,"L":6,"XL":3}'::jsonb),
    ('9', 'Ivory', '#EFE9DE', '{"Single":8,"Double":11,"King":6}'::jsonb),
    ('9', 'Sage', '#A8B3A0', '{"Single":7,"Double":10,"King":5}'::jsonb),
    ('10', 'Taupe', '#B39C86', '{"One size":0}'::jsonb),
    ('10', 'Indigo', '#33445E', '{"One size":0}'::jsonb),
    ('11', 'White', '#F4F2ED', '{"XS":6,"S":9,"M":11,"L":10,"XL":6}'::jsonb),
    ('11', 'Slate', '#6E7176', '{"XS":4,"S":7,"M":9,"L":8,"XL":5}'::jsonb),
    ('12', 'Bone', '#EDE7DB', '{"One size":9}'::jsonb),
    ('12', 'Rust', '#A45A38', '{"One size":7}'::jsonb)
)
insert into public.product_variants (
  id, product_id, sku, size, color, color_hex, stock_count
)
select
  product_id || '-' || regexp_replace(lower(color), '\s+', '-', 'g') || '-' || lower(size),
  product_id,
  'LH-' || product_id || '-' || upper(left(color, 3)) || '-' || size,
  size,
  color,
  color_hex,
  stock_count::integer
from variant_seed
cross join lateral jsonb_each_text(inventory) as sizes(size, stock_count);
