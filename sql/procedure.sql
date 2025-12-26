create or replace procedure new_user(
  name varchar(100),
  email varchar(150)
) language plpgsql as $$
  declare uid int;
begin
  insert into users (name, email) values (name, email) returning id into uid;
  raise notice 'User % added with ID: %', name, uid;
exception
  when unique_violation then
    raise exception 'User with name % or email % already exists.', name, email;
  when others then
    raise exception 'An error occurred: %', sqlerrm;
end;
$$;

create or replace procedure new_team(
name varchar(100),
  leader int,
  description text default null
) language plpgsql as $$
  declare id int; begin
insert into team (name, leader, description) values (name, leader_id, description) returning id into id;
  raise notice 'Team % added with ID: %', name, id;
exception
  when foreign_key_violation then
    raise exception 'Leader with ID % does not exist.', leader;
  when unique_violation then
    raise exception 'Team with name % already exists.', name;
  when others then
    raise exception 'An error occurred: %', sqlerrm;
end;
$$;

create or replace procedure add_user_to_team(
  uid int,
  team int
) language plpgsql as $$
begin
  insert into user_team (users, team) values (uid, team);
  raise notice 'User % added to team %', uid, team;
exception
  when foreign_key_violation then
    if not exists (select 1 from users where id = uid) then
      raise exception 'User with ID % does not exist.', uid;
    else
      raise exception 'Team with ID % does not exist.', team;
    end if;
  when unique_violation then
    raise exception 'User % is already in team %.', uid, team;
  when others then
    raise exception 'An error occurred: %', sqlerrm;
end;
$$;

create or replace procedure remove_user_from_team(
  uid int,
  tid int
) language plpgsql as $$
begin
  delete from user_team where users = uid and team = tid;
  if not found then
    raise exception 'User % is not in team %.', uid, tid;
  else
    raise notice 'User % removed from team %', uid, tid;
  end if;
exception
  when others then
    raise exception 'An error occurred: %', sqlerrm;
end;
$$
