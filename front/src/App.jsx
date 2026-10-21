import React from "react";
import injectContext from "./store/appContext";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import './App.css';
import './css/style.css'
import './css/magnific-popup.css'




import './fonts/flaticon/font/flaticon.css'
import './fonts/icomoon/style.css'


import { Aboutusv } from "./view/aboutusv";
import { Home } from "./view/home1";
import { Services } from "./view/service";
import { Blog } from "./view/blog";
import { Contactus } from "./view/contactus1";
import ScrollToTop from "./componets/ScrollToTop";
import Transportation from "./view/transportation";
import Warehousing from "./view/warehousing";
import Dashboard from "./view/Dashboard";
import useAuth from "./hooks/useAuth";

const ProtectedRoute = ({ children }) => {
	const { user } = useAuth();

	if (!user) {
		return <Navigate to="/" replace />;
	}

	return children;
};


export const App = () => {

	return (
		<div>
			<BrowserRouter>
				<div>
					<ScrollToTop />
					<Routes>
						<Route path="/index.html" element={<Home />} />
						<Route path="/" element={<Home />} />
						<Route path="/Aboutusv" element={<Aboutusv />} />
						<Route path="/Services" element={<Services />} />
						<Route path="/Services/transportation" element={<Transportation />} />
						<Route path="/Services/Warehousing" element={<Warehousing />} />
						<Route path="/Blog" element={<Blog />} />
						<Route path="/Contact" element={<Contactus />} />
						<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
					</Routes>
				</div>
			</BrowserRouter>
		</div>
	);
};
export default injectContext(App);
