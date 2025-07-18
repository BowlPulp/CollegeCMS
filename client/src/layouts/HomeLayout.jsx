import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function HomeLayout() {
  return (
    <div>
        <Navbar/>
        {/* Render the nested routes for the User role */}
        <Outlet />
       <Footer/>
      </div>
  );
}

export default HomeLayout;
