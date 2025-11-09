import React, { useEffect, useState } from 'react';

// Helper function to save access token
const saveAccessToken = (token) => {
    localStorage.setItem('google_access_token', token);
    localStorage.setItem('google_token_expiry', Date.now() + 3600 * 1000); // 1 hour
};

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive';

function GoogleSignIn() {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    useEffect(() => {
        // Check if already signed in
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            initializeGoogleSignIn();
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const initializeGoogleSignIn = () => {
        if (!CLIENT_ID) {
            console.log('Google Sign-In not configured');
            return;
        }
        
        if (!window.google) {
            console.log('Google API not loaded yet');
            return;
        }

        try {
            window.google.accounts.id.initialize({
                client_id: CLIENT_ID,
                callback: handleCredentialResponse,
            });

            // Also initialize OAuth for Drive access
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: (tokenResponse) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        saveAccessToken(tokenResponse.access_token);
                        setIsSignedIn(true);
                        console.log('✅ Signed in to Google Drive');
                    }
                },
            });

            // Store client for later use
            window.googleOAuthClient = client;
        } catch (error) {
            console.error('Error initializing Google Sign-In:', error);
        }
    };

    const handleCredentialResponse = (response) => {
        // Decode JWT to get user info
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        setUserEmail(payload.email);
        
        // Request OAuth token for Drive access
        if (window.googleOAuthClient) {
            window.googleOAuthClient.requestAccessToken();
        }
    };

    const handleSignIn = () => {
        if (window.googleOAuthClient) {
            window.googleOAuthClient.requestAccessToken();
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_token_expiry');
        setIsSignedIn(false);
        setUserEmail('');
        console.log('👋 Signed out from Google Drive');
    };

    if (!CLIENT_ID) {
        return null; // Don't show if not configured
    }

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            background: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            fontSize: '14px'
        }}>
            {isSignedIn ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#4CAF50' }}>☁️ Synced</span>
                    {userEmail && <span style={{ color: '#666', fontSize: '12px' }}>{userEmail}</span>}
                    <button
                        onClick={handleSignOut}
                        style={{
                            background: 'none',
                            border: '1px solid #ddd',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleSignIn}
                    style={{
                        background: '#4285f4',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                        <path fill="#fff" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                        <path fill="#fff" d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.438 15.983 5.482 18 9.003 18z"/>
                        <path fill="#fff" d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                        <path fill="#fff" d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0 5.482 0 2.438 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z"/>
                    </svg>
                    Sign in with Google
                </button>
            )}
        </div>
    );
}

export default GoogleSignIn;
