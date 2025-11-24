do $$ begin
  create type geo_location as (
    lon decimal(9, 6),
    lat decimal(9, 6)
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type delivery_status as enum ('pending', 'delivering', 'delivered', 'received', 'cancelled');
exception
  when duplicate_object then null;
end $$;

create table if not exists orders (
  key serial primary key,

  id varchar(12) unique not null,
  name varchar(255) not null,
  price decimal(10, 2) not null,
  created_at timestamp,
  status delivery_status not null,
  origin geo_location,
  destination geo_location,
  receiver varchar(255)
);

create table if not exists delivery_paths (
  key serial primary key,

  order_id varchar(12) not null,
  time timestamp not null,
  location geo_location,
  action varchar(255),
  claim_code varchar(20),

  unique (order_id, time),
  foreign key (order_id) references orders(id) on delete cascade
);

create index if not exists idx_delivery_paths_order_index on delivery_paths(order_id, time);
