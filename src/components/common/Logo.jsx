// Shared Logo component — "ESPRIT / LIVRE" stacked wordmark
// Used across Navbar, Auth page, and OnboardingCelebration.
const Logo = ({
  onClick,
  color = '#ffffff',
  textClassName = 'text-[15px] max-[767px]:text-[13px]',
  align = 'left',
  className = '',
}) => {
  const content = (
    <div
      className={`flex flex-col leading-[1.05] ${align === 'center' ? 'items-center' : 'items-start'}`}
      style={{ color, letterSpacing: '0.12em' }}
    >
      <span className={`${textClassName} font-light uppercase`}>Esprit</span>
      <span className={`${textClassName} font-semibold uppercase`}>Livre</span>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={`logo-btn ${className}`} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: align }}>
        {content}
      </button>
    );
  }

  return (
    <div className={className} style={{ textAlign: align }}>
      {content}
    </div>
  );
};

export default Logo;
