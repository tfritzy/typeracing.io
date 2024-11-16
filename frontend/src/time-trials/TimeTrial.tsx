import React from "react";
import { useParams } from "react-router-dom";
import { TimeTrialTypeBox } from "./TimeTrialTypeBox";
import { decodeReportTimeTrialResponse, decodeTimeTrial, encodeReportTimeTrialRequest, KeyStroke, ReportTimeTrialResponse, TimeTrial as TimeTrialData } from "../compiled";
import { useAppSelector } from "../store/storeHooks";
import { PlayerState } from "../store/playerSlice";
import { RootState } from "../store/store";

const apiUrl = process.env.REACT_APP_API_ADDRESS;

export function TimeTrial() {
    const player: PlayerState = useAppSelector(
        (state: RootState) => state.player
    );
    const params = useParams();
    const [trial, setTrial] = React.useState<TimeTrialData | undefined>(undefined);
    const [results, setResults] = React.useState<ReportTimeTrialResponse | undefined>(undefined);
    const [error, setError] = React.useState<object | null>(null);

    React.useEffect(() => {
        if (!params.id) {
            return;
        }

        fetch(apiUrl + `/api/time-trial?id=${params.id}`)
            .then((response) => response.arrayBuffer())
            .then((arrayBuffer) => new Uint8Array(arrayBuffer))
            .then((data) => {
                setTrial(decodeTimeTrial(data));
            })
            .catch((error) => {
                console.log(error);
            });
    }, [params.id]);

    const postResult = React.useCallback((keystrokes: KeyStroke[]) => {
        const opts = {
            method: 'POST',
            headers: { "X-Player-Id": player.id, "X-Auth-Token": player.token },
            body: encodeReportTimeTrialRequest({ id: trial?.id, keystrokes: keystrokes })
        };
        fetch(apiUrl + '/api/time-trial-result', opts)
            .then((response) => response.arrayBuffer())
            .then((arrayBuffer) => new Uint8Array(arrayBuffer))
            .then((data) => {
                setResults(decodeReportTimeTrialResponse(data));
            })
            .catch((error) => {
                console.log(error);
            });
    }, [player.id, player.token, trial?.id]);

    if (!trial) {
        return <div>Loading</div>;
    }

    return <div>
        {JSON.stringify(error)}
        {JSON.stringify(results)}
        <TimeTrialTypeBox trial={trial} onPhraseComplete={postResult} />
    </div>
}