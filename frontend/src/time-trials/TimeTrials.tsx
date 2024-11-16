import React from "react";
import { decodeListTimeTrialsResponse, TimeTrialListItem } from "../compiled";
import { arrayBuffer } from "stream/consumers";

const apiUrl = process.env.REACT_APP_API_ADDRESS;


function LinkTD(props: { trialId: string | undefined, children: string | JSX.Element }) {
    return <td><a href={`/time-trials/${props.trialId}`}>{props.children}</a></td>
}

export function TimeTrials() {
    const [trials, setTrials] = React.useState<TimeTrialListItem[] | undefined>(undefined);

    React.useEffect(() => {
        fetch(apiUrl + "/api/list-time-trials")
            .then((response) => response.arrayBuffer())
            .then((arrayBuffer) => new Uint8Array(arrayBuffer))
            .then((data) => {
                setTrials(decodeListTimeTrialsResponse(data).time_trials);
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