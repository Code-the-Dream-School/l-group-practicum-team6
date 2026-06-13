const TEAM = [
  { name: 'Almira Koshkina', handle: 'AlmiraKoshkina' },
  { name: 'Dinar Ibragimov', handle: 'Alarlar' },
  { name: 'Joe Siburov', handle: 'shweps13' },
  { name: 'Lily Meyer', handle: 'Lili-Kiwi' },
  { name: 'Olesia Mironenko', handle: 'olesiamironenko' },
];

const MENTORS = [
  { name: 'Sergey Sherstobitov', handle: 'in43sh' },
  { name: 'Serhii Smyk', handle: 'smykserhi' },
];

type Member = { name: string; handle: string };

const MemberLinks = ({ members }: { members: Member[] }) => (
  <div className="mt-2 flex flex-wrap justify-center gap-2">
    {members.map((member) => (
      <a
        key={member.handle}
        href={`https://github.com/${member.handle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-cyan-400 transition-colors hover:text-cyan-300 hover:underline"
      >
        {member.name}
      </a>
    ))}
  </div>
);

const TeamInfo = () => {
  return (
    <div className="animate-fadeIn relative z-10 px-6 py-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Team</p>
      <MemberLinks members={TEAM} />

      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-text-secondary">
        Mentors
      </p>
      <MemberLinks members={MENTORS} />
    </div>
  );
};

export default TeamInfo;
