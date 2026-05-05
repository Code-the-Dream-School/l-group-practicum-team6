import logoFull from '../assets/logo-full.svg';

const NavBar = () => {
    return (
        <div className="bg-surface pl-80px pr-80px h-64px">
            <div className="flex items-center justify-between">
                <img src={logoFull} alt="Sonix" className="" />
                <div className="flex flex-inline items-center gap-4">
                    <button className="btn-ghost">Log In</button>
                    <button className="btn-primary">Sign Up</button>
                </div>
            </div>
        </div>
    )
};

export default NavBar;