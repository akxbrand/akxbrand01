import React, { useEffect, useState } from 'react';

const ConnectionStatus: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const updateOnlineStatus = () => setIsOnline(navigator.onLine);

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    return (
        <div>
            {!isOnline ? (
                <h2 style={{ color: 'red' }}>You are currently offline. Please check your internet connection.</h2>
            ) : (
                <h2 style={{ color: 'green' }}>You are online!</h2>
            )}
        </div>
    );
};

export default ConnectionStatus;
