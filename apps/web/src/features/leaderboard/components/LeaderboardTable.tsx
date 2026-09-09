import LeaderboardRow from "./LeaderboardRow";

export default function LeaderboardTable() {

  const users = [
    {
      rank:1,
      name:"Daniel",
      tasks:124,
      points:1240,
    },
    {
      rank:2,
      name:"Sarah",
      tasks:118,
      points:1180,
    },
    {
      rank:3,
      name:"David",
      tasks:110,
      points:1100,
    },
    {
      rank:4,
      name:"Mary",
      tasks:101,
      points:980,
    },
    {
      rank:5,
      name:"John",
      tasks:96,
      points:930,
    },
  ];

  return (

    <div className="rounded-2xl border border-gray-200 bg-white p-6">

      <h2 className="mb-5 text-lg font-bold">
        Full Ranking
      </h2>

      <div className="space-y-3">

        {users.map(user=>(
          <LeaderboardRow
            key={user.rank}
            {...user}
          />
        ))}

      </div>

    </div>
  );
}