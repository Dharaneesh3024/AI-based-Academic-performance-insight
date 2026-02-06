const DashboardPage = () => {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome to Dashboard 🎉</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default DashboardPage;
