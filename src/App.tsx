import { createRoot } from 'react-dom/client';
import { Route, HashRouter, Routes } from 'react-router-dom';
import Home from './components/Home';
import Customer from './components/Customer';
import "./index.module.css";
import Header from './components/Header';
import { useEffect, useState } from 'react';

const App = () => 
{
    const handleKeyDown = (e: KeyboardEvent) => 
    {
        if (e.key === "Tab") 
        {
            e.preventDefault();
        }
    };

    useEffect(() => 
    {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const [query, setQuery] = useState("");
    return (
        <HashRouter>
            <Header setQuery={setQuery}/>
            <Routes>
                <Route path='/' element={<Home query={query}/>}/>
                <Route path='/customer/:id' element={<Customer/>}/>
            </Routes>
        </HashRouter>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<App/>);
