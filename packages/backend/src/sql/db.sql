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
  destination geo_location
);

create table if not exists delivery_paths (
  key serial primary key,

  order_id varchar(12) not null,
  path_index integer, -- will be set by trigger later
  time timestamp not null,
  location geo_location,
  action varchar(255),
  claim_code varchar(20),
  
  check (path_index >= 0),
  unique (order_id, path_index),
  foreign key (order_id) references orders(id) on delete cascade
);

create index if not exists idx_delivery_paths_order_index on delivery_paths(order_id, path_index);

create or replace function set_path_index()
returns trigger as $$
begin
  if new.path_index is null then
    select coalesce(max(path_index) + 1, 0)
    into new.path_index
    from delivery_paths
    where order_id = new.order_id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_set_path_index on delivery_paths;
create trigger trigger_set_path_index
  before insert on delivery_paths
  for each row
  execute function set_path_index();
