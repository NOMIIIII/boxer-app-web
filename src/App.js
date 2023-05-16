import React, { useState, useRef, useEffect } from "react";
import logo from './logo.svg';
import './App.css';
import Home from './screens/home';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FightList from './screens/fightList';
import NewFight from './screens/newFight';

function App() {

  

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route index element={<Home />} />
          <Route path="list" element={<FightList />} />
          <Route path="/fight/:_id" element={<NewFight />} />
        </Routes>
      </BrowserRouter>



    </div>
  );
}

export default App;
