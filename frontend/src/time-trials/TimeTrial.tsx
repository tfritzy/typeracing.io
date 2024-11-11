import React from "react";
import { useParams } from "react-router-dom";
import type { TimeTrial } from '../types/TimeTrial'
import { TimeTrialTypeBox } from "./TimeTrialTypeBox";

const apiUrl = process.env.REACT_APP_API_ADDRESS;

export function TimeTrial() {
    const params = useParams();
    const [trial, setTrial] = React.useState<TimeTrial | undefined>(undefined);
    const timeRef = React.useRef<number>(0);

    React.useEffect(() => {
        if (!params.id) {
            return;
        }

        fetch(apiUrl + `/api/time-trial?id=${params.id}`)
            .then((response) => response.json())
            .then((data) => {
                setTrial(data);
            })
            .catch((error) => {
                console.error("Error finding host:", error);
            });
    }, [params.id]);

    if (!trial) {
        return <div>Loading</div>;
    }

    return <div>
        <TimeTrialTypeBox trial={trial} />
    </div>
}