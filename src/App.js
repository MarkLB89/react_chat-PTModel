import React, { useState } from 'react';
import Login from './components/Login';

const App = () => {
  const [user, setUser] = useState(null);
  const handleLogin = (username) => {
    setUser(username);
  };
  return (
    <div>
      {user ? (
        <div>
          <h2>Welcome, {user}!</h2>
          <button onClick={() => setUser(null)}>Logout</button>
        </div>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};
export default App;