import React from 'react';
import Playground from '~/components/pages/Playground';
import NotFoundPage from "~/components/pages/NotFoundPage";
import './App.css';
import {Routes, BrowserRouter, Route} from 'react-router-dom';
import { createBrowserHistory } from 'history'
import {loadConfig} from "~/state";

const history = createBrowserHistory();


const App = () => {
    loadConfig()
    return (
<BrowserRouter>
            <Routes>

                <Route path="/" Component={Playground}/>
                <Route path="/snippet/:snippetID" Component={Playground}/>
                <Route path="*" Component={NotFoundPage}/>
            </Routes>
</BrowserRouter>
    );
}

export default App;
