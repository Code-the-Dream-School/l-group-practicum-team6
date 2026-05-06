import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function SignUpPage() {
    return (
        <div className="flex flex-col h-screen justify-between">
            <NavBar />
            <div className="flex items-center justify-center bg-void flex-1">
                <h1 className="text-xl text-text-primary">Sign Up Page</h1>
            </div>
            <Footer />
        </div>
    );
}