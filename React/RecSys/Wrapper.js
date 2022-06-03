import React from 'react';
import {useParams, useSearchParams} from "react-router-dom";
import Explore from "./Explore";

function ExploreWrapper(props)
{
    const [param,setParam] = useSearchParams();

    return <Explore myMovieId={param.get('id')}/>;
}

export default ExploreWrapper;