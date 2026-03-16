// Production deployment config
// config file for API and Google auth
export const API_URL =
    process.env.REACT_APP_API_URL || 
    (window.location.hostname === "localhost" ? "http://localhost:5000/api" : `${window.location.origin}/api`);

export const GOOGLE_CLIENT_ID =
    process.env.REACT_APP_GOOGLE_CLIENT_ID || "565517695784-cvrrs1sd8jci61bdqjflah13kicnpj6t.apps.googleusercontent.com";