import React, {Component} from 'react';
import Login from './Login'
import {Row, Col} from 'antd'
import {Route, BrowserRouter, Routes} from "react-router-dom";
import Register from './Register';
import Main from "./Main";
import Explore from "./Explore";
import Search from "./Search";
import User from "./User";

import './App.css'
import ExploreWrapper from "./Wrapper";
import NewExplore from "./NewExplore";

class App extends Component
{
    render()
    {
        return (
            <div>
                <BrowserRouter>
                    <Routes>
                        <Route path={"/"} element={<Main/>}>
                            <Route index element={<NewExplore/>}></Route>
                            {/*<Route path={'/Explore'} element={<ExploreWrapper/>}></Route>*/}
                            <Route path={'/Explore'} element={<NewExplore/>}></Route>
                            <Route path={"Search"} element={<Search/>}></Route>
                            <Route path={"User"} element={<User/>}></Route>
                        </Route>
                        <Route path={'/Register'} element={<Register/>}/>
                        <Route path={'/Login'} element={<Login/>}/>
                    </Routes>
                </BrowserRouter>

            </div>
        );
    }
}

export default App;