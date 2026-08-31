type Props={
    rank:number;
    name:string;
    tasks:number;
    points:number;
}

export default function LeaderboardRow({
    rank,
    name,
    tasks,
    points
}:Props){

    return(

        <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">

            <div className="flex items-center gap-4">

                <span className="text-xl font-bold">
                    #{rank}
                </span>

                <img
                src={`https://ui-avatars.com/api/?name=${name}`}
                className="h-12 w-12 rounded-full"
                />

                <div>

                    <h3 className="font-semibold">
                        {name}
                    </h3>

                    <p className="text-sm text-slate-500">
                        {tasks} Tasks
                    </p>

                </div>

            </div>

            <div className="font-bold text-blue-600">
                {points} pts
            </div>

        </div>

    )

}