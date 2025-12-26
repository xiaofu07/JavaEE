# 介绍

上次报告之后，我们修改了一下数据库

原先的 Object 变成了 File + Object 两个表

```sql
create table file (
  id serial primary key,
  name varchar(100),
  bucket int references bucket(id) not null,
  mime_type varchar(100),
  current bigint references object(id),
  description text,

  unique(name, bucket)
);
```

file 表只用来记录文件名，文件的 mime 类型，和所在的 bucket
以及目前所指向的对象

```sql
create table object (
  id bigserial primary key,
  hash char(32) not null,
  parent bigint references object(id) on delete set null ,
  file int references file(id) on delete cascade not null,
  who int references users(id) on delete cascade not null,
  time timestamp without time zone default current_timestamp not null,
  description text
);
```

object 表则用来记录 hash 值，所属的文件，父对象（即修改前的对象），以及修改者和修改时间

上传时，使用的地址是 `blob/{owner}/{bucket}/{filename}`

这用起来很像那种 git 仓库托管平台，我觉得很好

但实际上文件会被保存在 hash/{hash} 里面

![软链接](./)
