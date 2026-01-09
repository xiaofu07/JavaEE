import { useState, useMemo } from 'react';
import '../css/AuthModal.css';

// 简单邮箱格式校验
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// 密码强度规则校验：长度>=8，包含大小写字母、数字、特殊字符
const getPasswordRuleErrors = (password) => {
  const errors = [];
  if (!password || password.length < 8) errors.push('至少 8 位');
  if (!/[A-Z]/.test(password)) errors.push('至少 1 个大写字母');
  if (!/[a-z]/.test(password)) errors.push('至少 1 个小写字母');
  if (!/\d/.test(password)) errors.push('至少 1 个数字');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('至少 1 个特殊符号');
  return errors;
};

// 登录表单组件
function LoginForm({ onSubmit }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleSubmit = (e) => {
    // 前端校验邮箱格式（仅当输入看起来像邮箱时）
    const looksLikeEmail = identifier.includes('@');
    const valid = !looksLikeEmail || isValidEmail(identifier);
    if (!valid) {
      e.preventDefault();
      setEmailError('邮箱格式不正确');
      return;
    }
    setEmailError('');
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={`form-group ${emailError ? 'error' : ''}`}>
        <label>用户名或邮箱</label>
        <input
          type="text"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        {emailError && <span className="error-message">{emailError}</span>}
      </div>
      <div className="form-group">
        <label>密码</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit" className="submit-btn">登录</button>
    </form>
  );
}

// 注册表单组件
function RegisterForm({ onSubmit }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const emailError = useMemo(() => {
    if (!email) return '';
    return isValidEmail(email) ? '' : '邮箱格式不正确';
  }, [email]);

  const passwordErrors = useMemo(() => getPasswordRuleErrors(password), [password]);
  const confirmError = useMemo(() => {
    if (!confirm) return '';
    return confirm === password ? '' : '两次输入的密码不一致';
  }, [confirm, password]);

  const canSubmit = username && email && password && confirm && !emailError && passwordErrors.length === 0 && !confirmError;

  const handleSubmit = (e) => {
    // 阻止直接提交，只有在全部校验通过时才调用上层提交
    if (!canSubmit) {
      e.preventDefault();
      return;
    }
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>用户名</label>
        <input
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className={`form-group ${emailError ? 'error' : ''}`}>
        <label>邮箱</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {emailError && <span className="error-message">{emailError}</span>}
      </div>
      <div className={`form-group ${passwordErrors.length ? 'error' : 'success'}`}>
        <label>密码</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={passwordErrors.length ? 'true' : 'false'}
        />
        {passwordErrors.length > 0 ? (
          <span className="error-message">
            密码需满足：{passwordErrors.join('、')}
          </span>
        ) : (
          password && <span className="error-message" style={{ color: '#2ed573' }}>密码强度合格</span>
        )}
      </div>
      <div className={`form-group ${confirmError ? 'error' : ''}`}>
        <label>确认密码</label>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {confirmError && <span className="error-message">{confirmError}</span>}
      </div>
      <button type="submit" className="submit-btn" disabled={!canSubmit}>注册</button>
    </form>
  );
}

// 认证模态框组件
function AuthModal({ activeTab, setActiveTab, onLogin, onRegister, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{activeTab === 'login' ? '用户登录' : '用户注册'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            登录
          </button>
          <button 
            className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            注册
          </button>
        </div>
        
        <div className="modal-body">
          {activeTab === 'login' ? (
            <LoginForm onSubmit={onLogin} />
          ) : (
            <RegisterForm onSubmit={onRegister} />
          )}
        </div>
        
        <div className="modal-footer">
          {activeTab === 'login' ? (
            <p>还没有账号？<a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('register'); }}>立即注册</a></p>
          ) : (
            <p>已有账号？<a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('login'); }}>立即登录</a></p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;