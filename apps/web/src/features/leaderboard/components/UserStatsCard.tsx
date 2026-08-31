export default function UserStatsCard(){

    return(

        <div className="rounded-2xl border border-gray-200 bg-white p-6">

            <h2 className="font-bold">
                Your Ranking
            </h2>

            <div className="mt-6 space-y-5">

                <div>
                    <p className="text-sm text-slate-500">
                        Rank
                    </p>

                    <h2 className="text-3xl font-bold">
                        #1
                    </h2>
                </div>

                <div>
                    <p className="text-sm text-slate-500">
                        Total Points
                    </p>

                    <h2 className="text-3xl font-bold">
                        1240
                    </h2>
                </div>

                <div>
                    <p className="text-sm text-slate-500">
                        Tasks Completed
                    </p>

                    <h2 className="text-3xl font-bold">
                        124
                    </h2>
                </div>

            </div>

        </div>

    )

}