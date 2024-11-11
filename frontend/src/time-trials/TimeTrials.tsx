import React from "react";

const apiUrl = process.env.REACT_APP_API_ADDRESS;

type Trial = {
    id: string | undefined;
    name: string | undefined;
    length: number | undefined;
    time: number | undefined;
    place: number | undefined;
}

function LinkTD(props: { trialId: string | undefined, children: string | JSX.Element }) {
    return <td><a href={`/time-trials/${props.trialId}`}>{props.children}</a></td>
}

export function TimeTrials() {
    const [trials, setTrials] = React.useState<Trial[] | undefined>(undefined);

    React.useEffect(() => {
        fetch(apiUrl + "/api/list-time-trials")
            .then((response) => response.json())
            .then((data) => {
                setTrials(data);
            })
            .catch((error) => {
                console.error("Error finding host:", error);
            });
    }, []);

    if (trials === undefined) {
        return <div>Loading</div>
    }

    return <div>
        <h1>Time trials</h1>
        <table className="w-full">
            <tr className="font-bold">
                <td className="w-max">Name</td>
                <td className="w-max">Length</td>
                <td className="w-max">Time</td>
                <td className="w-max">Place</td>
            </tr>
            {trials.map(t => (<tr>
                <LinkTD trialId={t.id}>{t.name || '-'}</LinkTD>
                <LinkTD trialId={t.id}>{t.length + " words"}</LinkTD>
                <LinkTD trialId={t.id}>{t.time?.toString() || '-'}</LinkTD>
                <LinkTD trialId={t.id}>{t.place?.toString() || '-'}</LinkTD>
            </tr>))}
        </table>
    </div >
}