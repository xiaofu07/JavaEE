-- ==========================================================
-- 1. 清理环境 (可选)
-- ==========================================================
-- DROP TABLE IF EXISTS system_log, backup, object_permission, object, file,
-- bucket_permission, bucket, user_team, team, account, users CASCADE;
-- DROP TYPE IF EXISTS role, permission_level, log_level CASCADE;
begin
;

-- ==========================================================
-- 2. 插入基础用户与权限数据
-- ==========================================================
INSERT INTO users (name, email) VALUES 
('Alice', 'alice@maxio.com'),
('Bob', 'bob@maxio.com'),
('lingshin', 'lingshin@maxio.com'),
('System_Bot', 'bot@maxio.com');

-- 账户信息 (假设 Alice 是 Admin, Bob 是 User)
INSERT INTO account (owner, role, username, password) VALUES 
(1, 'Admin', 'alice_admin', '$2a$10$encoded_password_1'),
(2, 'User', 'bob_user', '$2a$10$encoded_password_2'),
(3, 'Admin', 'lingshin', '$2a$12$B12crCmgzi7DQ4ukYLxJmOEkx79R85ChEkbkCsgbub72BvIdnzOSy');

-- ==========================================================
-- 3. 组织架构 (团队)
-- ==========================================================
INSERT INTO team (name, leader, description) VALUES 
('Infrastructure', 1, 'Core system management'),
('Content Creators', 2, 'External content team');

-- 用户加入团队
INSERT INTO user_team (users, team) VALUES 
(3, 1), (1, 1), (2, 1), (2, 2);

-- ==========================================================
-- 4. 存储层 (Bucket)
-- ==========================================================
INSERT INTO bucket (name, owner, description, size_limit) VALUES 
('Private-Vault', 1, 'Alice''s private storage', 10485760), -- 10MB
('firefox', 3, 'lingshin''s private storage', 10485760), -- 10MB
('Public-Assets', 2, 'Shared media files', 52428800);  -- 50MB

-- 桶权限分配
INSERT INTO bucket_permission (bucket, team, permission) VALUES 
(1, 1, 'operator'),
(2, 2, 'write');

