import { Link, useNavigate } from "react-router-dom"
import logo from "../resources/images/greenlandCafe.png"
import search from "../resources/images/search-512.png";
import styles from "./header.module.css";
import { ChangeEvent, FormEvent, useRef } from "react";

interface HeaderProps
{
    setQuery: React.Dispatch<React.SetStateAction<string>>;
}
const Header: React.FC<HeaderProps> = ({setQuery}) =>
{
    const navigate = useNavigate()
    const inputRef = useRef<HTMLInputElement>(null);
    const handleSearch = (e: FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();
        navigate("")
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) =>
    {
        setQuery(e.target.value)
    }
    
    const clearSearch = () =>
    {
        setQuery('')
        inputRef.current.value = '';
    }

    return (
        <header>
            <div id={styles.logoWrap}>
                <Link to={"/"}>
                    <img src={logo} alt=""/>
                </Link>
            </div>        
            <div id={styles.searchWrap}>
                <form onSubmit={handleSearch}>
                    <input type="text" placeholder="Search for Customer" onChange={handleInputChange} ref={inputRef}/>
                    
                </form>
                
                <button id={window.location.hash.includes("customer") ? styles.searchButton : styles.searchClear}type="submit" onClick={() => navigate("")}>
                    <img src={search}/>
                    {
                        window.location.hash === "#/" &&
                        (
                            <div id={styles.clearSearch} onClick={clearSearch}> &#10006; </div>
                        )
                    }
                    
                </button>
                
            </div>
        </header>
    )
}

export default Header;