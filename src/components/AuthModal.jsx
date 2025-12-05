import '../css/AuthModal.css';

// 登录表单组件
function LoginForm({ onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label>用户名或邮箱</label>
        <input type="text" required />
      </div>
      <div className="form-group">
        <label>密码</label>
        <input type="password" required />
      </div>
      <button type="submit" className="submit-btn">登录</button>
    </form>
  );
}

// 注册表单组件
function RegisterForm({ onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label>用户名</label>
        <input type="text" required />
      </div>
      <div className="form-group">
        <label>邮箱</label>
        <input type="email" required />
      </div>
      <div className="form-group">
        <label>密码</label>
        <input type="password" required />
      </div>
      <div className="form-group">
        <label>确认密码</label>
        <input type="password" required />
      </div>
      <button type="submit" className="submit-btn">注册</button>
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