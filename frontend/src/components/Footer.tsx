import { useState } from 'react';

import TeamInfo from './TeamInfo';

const Footer = () => {
  const [showTeam, setShowTeam] = useState(false);

  return (
    <div className="flex flex-col">
      {showTeam && <TeamInfo />}

      <div className="bg-surface flex h-12 items-center justify-center">
        <button
          type="button"
          onClick={() => setShowTeam((prev) => !prev)}
          aria-expanded={showTeam}
          className="cursor-pointer text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          © 2026 Sonix.ai
        </button>
      </div>
    </div>
  );
};

export default Footer;
