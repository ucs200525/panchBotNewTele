import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className="navbar">
      <Link to="/">Home</Link>
      <Link to="/panchaka">Panchaka Rahita</Link>
      <Link to="/combine">Good Timings</Link>
      {/* <Link to="/DownloadImage">DownloadImage </Link>
      <Link to="/bhargav-table-image">DownloadImage </Link>
      <Link to="/drik-table-image">DownloadImage </Link> */}
    </div>
  );
};

export default Navbar;
