import React from 'react';

interface SocialLoginButtonProps {
  provider: 'google' | 'college-id';
  onClick: () => void;
}

export const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({ provider, onClick }) => {
  const content =
    provider === 'google' ? (
      <>
        <i className="fa-brands fa-google" style={{ color: '#ea4335' }}></i>
        Continue with Google
      </>
    ) : (
      <>
        <i className="fa-solid fa-id-card-clip" style={{ color: '#7c5cff' }}></i>
        Continue with College ID
      </>
    );

  return (
    <button type="button" className="btn-sso" onClick={onClick}>
      {content}
    </button>
  );
};
