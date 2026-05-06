import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function LandingPage() {
    return (
        <div className="flex h-screen flex-col justify-between">
            <NavBar />
            <div className="flex items-center justify-center bg-void flex-1">
                <h1 className="text-xl text-text-primary">Landing Page</h1>
            </div>
            <Footer />
        </div>
    );
}