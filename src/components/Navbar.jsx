// 导航栏组件
function Navbar({ isLoggedIn, setIsLoggedIn, setShowAuthModal }) {
  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <div className="logo">
          <span className="logo-icon">☁️</span>
          <span>深信服云存储</span>
        </div>
        <div className="nav-links">
          {isLoggedIn ? (
            <button onClick={() => setIsLoggedIn(false)}>退出登录</button>
          ) : (
            <button onClick={() => setShowAuthModal(true)}>登录 / 注册</button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;