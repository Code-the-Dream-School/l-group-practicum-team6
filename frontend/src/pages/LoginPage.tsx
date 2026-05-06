import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function LoginPage() {
    return (
        <div className="flex flex-col h-screen justify-between">
            <NavBar />
            <div className="flex items-center justify-center bg-void h-[calc(100%-64px-48px)]">
                <h1 className="text-xl text-text-primary">Login Page</h1>
            </div>
            <Footer />
        </div>
    );
}