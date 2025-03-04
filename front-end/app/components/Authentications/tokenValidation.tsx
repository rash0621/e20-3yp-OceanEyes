export const isTokenValid = (): boolean => {
    if (typeof window === "undefined") return false; 

    const token = localStorage.getItem("jwtToken");
    if (!token) return false; // No token = Not authenticated

    try {
        const base64Url = token.split(".")[1]; // Get payload
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decodedToken = JSON.parse(atob(base64));

        const currentTime = Date.now() / 1000; // Convert to seconds
        return decodedToken.exp > currentTime; // Token is valid if not expired
    } catch (error) {
        return false; // Invalid token
    }
};
