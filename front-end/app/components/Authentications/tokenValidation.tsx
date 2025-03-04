export const isTokenValid = (): boolean => {
    if (typeof window === "undefined") return false; // Prevents SSR issues

    const token = localStorage.getItem("jwtToken");
    if (!token) return false; // No token = Not authenticated

    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decodedToken = JSON.parse(atob(base64));

        const currentTime = Date.now() / 1000;
        return decodedToken.exp > currentTime; // Token is still valid
    } catch (error) {
        return false; // Invalid token
    }
};
