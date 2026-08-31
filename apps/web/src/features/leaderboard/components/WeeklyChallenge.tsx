export default function WeeklyChallenge(){

    return(

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">

            <h2 className="font-bold">
                Weekly Challenge
            </h2>

            <p className="mt-3 text-sm text-slate-600">
                Complete 20 tasks this week to earn an extra 500 points.
            </p>

            <div className="mt-5 h-3 rounded-full bg-blue-100">

                <div className="h-full w-2/3 rounded-full bg-blue-600"/>

            </div>

            <p className="mt-3 text-sm font-medium">
                14 / 20 Completed
            </p>

        </div>

    )

}