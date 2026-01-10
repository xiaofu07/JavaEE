// 导航栏组件
function Navbar({ isLoggedIn, setIsLoggedIn, setShowAuthModal, viewingUser, viewingBucket, onBackToMyBuckets }) {
  const isViewingOther = !!viewingUser;

  return (
    <nav className={`navbar ${isViewingOther ? 'viewing-other' : ''}`}>
      <div className="container navbar-content">
        <div className="logo">
          <span className="logo-icon">☁️</span>
          {isViewingOther ? (
            <span>正在查看 <strong>{viewingUser?.name}</strong> 的桶: <strong>{viewingBucket?.name}</strong></span>
          ) : (
            <span>深信服云存储</span>
          )}
        </div>
        <div className="nav-links">
          {isViewingOther ? (
            <button onClick={onBackToMyBuckets}>返回我的桶</button>
          ) : isLoggedIn ? (
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