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
  created_at timestamp not null,
  status delivery_status not null,
  origin geo_location not null,
  destination geo_location not null,
  current geo_location not null,
  receiver varchar(255)
);

create table if not exists delivery_paths (
  key serial primary key,

  order_id varchar(12) not null,
  time timestamp not null,
  location geo_location not null,
  action varchar(255) not null,
  claim_code varchar(20),

  unique (order_id, time),
  foreign key (order_id) references orders(id) on delete cascade
);

create index if not exists idx_delivery_paths_order_index on delivery_paths(order_id, time);

create table if not exists route_points (
  key serial primary key,
  
  order_id varchar(12) not null,
  sequence_number integer not null,
  location geo_location not null,
  
  unique (order_id, sequence_number),
  foreign key (order_id) references orders(id) on delete cascade
);

create index if not exists idx_route_points_order_id on route_points(order_id);
