import { useState, useEffect } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";

export default function App() {
    const [authToken, setAuthToken] = useState(null);

    // Check if you are already logged in
    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (token) {
            setAuthToken(token);
        }
    }, []);

    return (
        <>
            {!authToken ? (
                <Login setAuthToken={setAuthToken} />
            ) : (
                <Dashboard token={authToken} setAuthToken={setAuthToken} />
            )}
        </>
    );
}
