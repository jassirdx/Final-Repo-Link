import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer 
      className="page_footer__F3MD0"
      style={{
        display: 'block',
        position: 'fixed',
        left: 0,
        bottom: 0,
        width: '100%',
        height: '40px',
        margin: '0px',
        padding: '12px 16px',
        backgroundColor: 'transparent',
        color: '#6b6b6b', // From computed styles: rgb(107, 107, 107)
        fontSize: '12px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
        textAlign: 'center',
        zIndex: 50,
      }}
    >
      For any issues or feedback, reach out to{' '}
      <a 
        href="mailto:contacttheheartcraft@gmail.com" 
        className="page_footerLink__ntXAe"
        style={{
          display: 'inline',
          position: 'static',
          width: 'auto',
          height: 'auto',
          margin: '0px',
          padding: '0px',
          backgroundColor: 'transparent',
          color: '#e8456b', // From computed styles: rgb(232, 69, 107)
          fontSize: '12px',
          fontFamily: 'inherit',
          borderRadius: '0px',
          boxShadow: 'none',
          textDecoration: 'none',
        }}
      >
        contacttheheartcraft@gmail.com
      </a>
    </footer>
  );
};

export default Footer;