import { useState, useEffect } from 'react';
import { userApi } from '../api';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const result = await userApi.getAll();
                if (result.status === 'success') {
                    setUsers(result.data);
                } else {
                    throw new Error(result.message || 'Failed to fetch users');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) return <div className="loading">Loading users...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="user-list-container">
            <h2>Users List</h2>
            <div className="user-grid">
                {users.length === 0 ? (
                    <p>No users found.</p>
                ) : (
                    users.map(user => (
                        <div key={user.id} className="user-card">
                            <div className="user-info">
                                <h3>{user.name || 'Anonymous'}</h3>
                                <p className="email">{user.email}</p>
                                <p className="role">Role: {user.role}</p>
                                <p className="status">Status: <span className={`status-${user.status}`}>{user.status}</span></p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UserList;
