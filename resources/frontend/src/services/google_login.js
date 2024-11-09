import React, { useEffect } from 'react';

const GoogleSignIn = () => {
  useEffect(() => {
    // Dynamically add the Google script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = initializeGoogleSignIn;
    document.body.appendChild(script);

    return () => {
      // Clean up the script when the component unmounts
      document.body.removeChild(script);
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: '102897822622-j0m36vpo56fqetqb0sbf2k9rtv6tp9m7.apps.googleusercontent.com', // Replace with your Google client ID
        callback: handleCredentialResponse,
      });

      // Render the Google Sign-In button
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'outline', size: 'large' } // Button customization
      );

      // Optionally enable One Tap
      window.google.accounts.id.prompt();
    }
  };

  const handleCredentialResponse = (response) => {
    console.log('Encoded JWT ID token: ' + response.credential);
    // You can send the token to your backend for verification
  };

  return (
    <div>
      {/* Placeholder for the Google Sign-In button */}
      <div id="google-signin-button"></div>
    </div>
  );
};

export default GoogleSignIn;