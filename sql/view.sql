create or replace view user_bucket_permission as select u.users, p.bucket, permission
from user_team u
join bucket_permission p on u.team = p.team;

create or replace view user_object_permission as select u.users, p.object, permission
from user_team u
join object_permission p on u.team = p.team

