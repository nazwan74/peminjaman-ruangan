import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

// Usage: <PrivateRoute requiredRole="admin"><Dashboard/></PrivateRoute>
const PrivateRoute = ({ children, requiredRole = null }) => {
	const { user, role, loading } = useAuth();

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">Loading...</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (requiredRole && role !== requiredRole) {
		// if user is authenticated but doesn't have required role, redirect to home
		return <Navigate to="/" replace />;
	}

	return children;
};

export default PrivateRoute;
