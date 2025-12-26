create table users (
  id serial primary key,
  name varchar(100) not null unique,
  email varchar(150) unique
);

create type role as enum ('User', 'Admin');
create table account (
  owner int references users(id) not null,
  role role not null,
  username varchar(50) unique primary key not null,
  password varchar(255) not null
);

create table team (
  id serial primary key,
  name varchar(100) not null,
  leader int references users(id) not null,
  description text,

  unique(name, leader)
);

create table user_team (
  users int references users(id) on delete cascade not null,
  team int references team(id) on delete cascade not null,

  primary key(users, team)
);

create table bucket (
  id serial primary key,
  name varchar(100) not null,
  owner int references users(id) on delete cascade not null,
  description text,
  current_size int not null default 0 check (current_size < size_limit),
  size_limit int,

  unique(name, owner)
);

create type permission_level as enum ('read', 'write', 'delete', 'operator');

create table bucket_permission (
  bucket int references bucket(id) on delete cascade not null,
  team int references team(id) on delete cascade not null,
  permission permission_level not null default 'read',

  primary key(bucket, team)
);

create table file (
  id serial primary key,
  name varchar(100),
  bucket int references bucket(id) not null,
  mime_type varchar(100),
  description text,

  unique(name, bucket)
  deferrable initially deferred
);

create table object (
  id bigserial primary key,
  hash char(32) not null,
  parent bigint references object(id) on delete set null ,
  file int references file(id) on delete cascade not null,
  who int references users(id) on delete cascade not null,
  time timestamp without time zone default current_timestamp not null,
  description text
);

create table object_permission (
  object int references object(id) on delete cascade,
  team int references team(id) on delete cascade,
  permission permission_level not null check (permission != 'operator'),

  primary key(object, team)
);

create table backup (
  id serial primary key,
  name varchar(100),
  bucket integer references bucket(id) not null,
  backup_time timestamp without time zone default current_timestamp not null,
  comment text
);

create type log_level as enum ('DEBUG', 'INFO', 'WARN', 'ERROR');

create table system_log (
  id bigserial primary key,
  time timestamp without time zone default current_timestamp,
  level log_level,
  message text
);

ALTER TABLE file ADD COLUMN current bigint references object(id);

