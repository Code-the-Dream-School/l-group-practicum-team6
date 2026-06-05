import { useState } from 'react';
import { Link } from 'react-router-dom';

import Footer from '../components/Footer';
import NavBar from '../components/NavBar';
import { Routes } from '../routes/paths';

const bars = [
  'h-6',
  'h-10',
  'h-16',
  'h-8',
  'h-20',
  'h-12',
  'h-24',
  'h-14',
  'h-8',
  'h-18',
  'h-28',
  'h-12',
  'h-20',
  'h-10',
  'h-6',
  'h-14',
  'h-24',
  'h-10',
  'h-16',
  'h-8',
];

export default function NotFoundPage() {
  const [showTeam, setShowTeam] = useState(false);

  return (
    <div className="flex min-h-screen flex-col justify-between bg-void text-text-primary">
      <NavBar />

      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.28),transparent_60%)] blur-3xl" />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-40">
          <div className="flex w-full items-center justify-between px-8 md:px-16">
            {bars.map((height, index) => (
              <span
                key={`${height}-${index}`}
                className={`${height} w-1 rounded-full bg-purple-400/80 animate-sound-wave`}
                style={{
                  animationDelay: `${index * 0.08}s`,
                  animationDirection: index % 2 === 0 ? 'alternate' : 'alternate-reverse',
                }}
              />
            ))}
          </div>
        </div>

        <section className="relative z-10 max-w-xl text-center">
          <p
            onClick={() => setShowTeam(!showTeam)}
            className="animate-heartbeat cursor-pointer bg-linear-to-r from-[#f5ecff] via-[#d8b4fe] to-[#7dd3fc] bg-clip-text text-8xl font-extrabold tracking-tight text-transparent drop-shadow-[0_0_35px_rgba(192,132,252,0.35)] transition-transform hover:scale-105 md:text-9xl"
          >
            404
          </p>

          <h1 className="mt-8 text-2xl font-semibold md:text-3xl">
            The page you are looking for <br />
            doesn't exist
          </h1>

          <p className="mt-4 text-sm leading-6 text-text-secondary">
            The sonic frequency you're searching for is out of range. <br />
            Check the URL or return to the main interface.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              className="btn-primary transition-all duration-300
                hover:from-cyan-400 hover:to-cyan-300
                hover:shadow-[0_0_25px_rgba(34,211,238,0.55)]
                hover:scale-105
                focus:outline-none
                focus:ring-2 focus:ring-cyan-300/60
              "
              to={Routes.HOME}
            >
              Go Home
            </Link>

            <Link
              className="btn-ghost transition-all duration-300
                hover:from-cyan-400 hover:to-cyan-300
                hover:shadow-[0_0_25px_rgba(34,211,238,0.55)]
                hover:scale-105
                focus:outline-none
                focus:ring-2 focus:ring-cyan-300/60
              "
              to={Routes.EXPLORE}
            >
              Explore Visuals
            </Link>
          </div>
        </section>
      </main>

      {showTeam && (
        <div className="relative z-10 animate-fadeIn px-6 py-4 text-center">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
            Team
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {[
              { name: 'Almira Koshkina', handle: 'AlmiraKoshkina' },
              { name: 'Dinar Ibragimov', handle: 'Alarlar' },
              { name: 'Joe Siburov', handle: 'shweps13' },
              { name: 'Lily Meyer', handle: 'Lili-Kiwi' },
              { name: 'Olesia Mironenko', handle: 'olesiamironenko' },
            ].map((member) => (
              <a
                key={member.handle}
                href={`https://github.com/${member.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors hover:underline"
              >
                {member.name}
              </a>
            ))}
          </div>

          <p className="mt-4 text-xs font-semibold text-text-secondary uppercase tracking-widest">
            Mentors
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {[
              { name: 'Sergey Sherstobitov', handle: 'in43sh' },
              { name: 'Serhii Smyk', handle: 'smykserhi' },
            ].map((member) => (
              <a
                key={member.handle}
                href={`https://github.com/${member.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors hover:underline"
              >
                {member.name}
              </a>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
