import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import BurguerButton from './burguerButton'
import fondoPrincipal from '../images/Fondoprincipal.jpeg';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const Navbar1 = () => {

    const location = useLocation();
    const { user, loading, authError, login, logout } = useAuth();
    const [clicked, setClicked] = useState(false)
    const [scrolled, setScrolled] = useState(false);
    const [authMode, setAuthMode] = useState(null);
    const [authForm, setAuthForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "customer",
        company: "",
    });

    useEffect(() => {
        const handleScroll = () => {
            if (window.pageYOffset > 0) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);


    const handleClick = () => {
        // Verificar el tamaño de la pantalla antes de cambiar el estado
        if (window.innerWidth > 768) {
            return;
        }

        // Cambiar el estado solo si el tamaño de la pantalla es menor o igual a 768px
        setClicked(!clicked);
    }

    const openAuthModal = (mode) => {
        setAuthMode(mode);
        setAuthForm({ name: "", email: "", password: "", role: "customer", company: "" });

        if (window.innerWidth <= 768) {
            setClicked(false);
        }
    };

    const closeAuthModal = () => {
        setAuthMode(null);
    };

    const handleAuthChange = (event) => {
        const { name, value } = event.target;
        setAuthForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    };

    const handleAuthSubmit = async (event) => {
        event.preventDefault();

        try {
            await login({ email: authForm.email, password: authForm.password });
            closeAuthModal();
        } catch {
            // AuthContext exposes the message in authError.
        }
    };

    const handleLogout = () => {
        logout();

        if (window.innerWidth <= 768) {
            setClicked(false);
        }
    };

    return (
        <>
            <header className={`site-navbar py-3 js-site-navbar site-navbar-target ${scrolled ? "navbar-scroll" : ""}`} role="banner" id="site-navbar" style={{ position: "fixed", top: 0, zIndex: 100 }}>
                <NavContainer>
                    <div className="col-4 col-lg-3 col-xl-3 site-logo">
                        <a href="index.html" className="logo col-sm-4 col-12 mb-0"><img src={new URL("../images/YDHMlogo-removebg-preview.png", import.meta.url).href} alt="" className="img-fluid" /></a>
                    </div>

                    <ul className={`links ${clicked ? 'active' : ''}`}>
                        <li className={location.pathname === '/' ? 'marca' : ''}><Link onClick={handleClick} to="/">Home</Link></li>
                        <li className={`has-children nav-item dropdown ${location.pathname === '/Services' ? 'marca' : ''} dropdown-hover`}>
                            <Link className="nav-link " to="#section-services" role="button"  aria-expanded="false">Services</Link>
                            <ul className="dropdown-menu">
                                <li><Link to="/Services/transportation" className="dropdown-item" onClick={handleClick}>Transport Services</Link></li>
                                <li><Link to="/Services/Warehousing" className="dropdown-item" onClick={handleClick}>Warehousing Services</Link></li>
                            </ul>
                        </li>
                        <li className={location.pathname === '/Aboutusv' ? 'marca' : ''}><Link onClick={handleClick} to="/Aboutusv">About Us</Link></li>
                        <li className={location.pathname === '/Contact' ? 'marca' : ''}><Link onClick={handleClick} to="/Contact">Contact</Link></li>
                        {user && (
                            <li className={location.pathname === '/dashboard' ? 'marca' : ''}>
                                <Link onClick={handleClick} to="/dashboard">Dashboard</Link>
                            </li>
                        )}
                        {/*<li className={location.pathname === '/Blog' ? 'marca' : ''}> <Link onClick={handleClick} to="/Blog">Blog</Link></li>*/}
                        {user ? (
                            <>
                                <li className="auth-status">
                                    <span className="auth-state">Signed in</span>
                                    <span className="auth-name">{user.name || user.email}</span>
                                </li>
                                <li>
                                    <button type="button" className="auth-link" onClick={handleLogout}>
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <button type="button" className="auth-link" onClick={() => openAuthModal("login")}>
                                        Login
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>

                    <div className='burguer'>
                        <BurguerButton clicked={clicked} handleClick={handleClick} />
                    </div>

                    <BgDiv className={`initial ${clicked ? ' active' : ''}`}></BgDiv>
                </NavContainer>
            </header>

            <div className="site-blocks-cover overlay animated-background" style={{ backgroundImage: `url(${fondoPrincipal})` }} data-aos="fade" data-stellar-background-ratio="0.5" id="section-home">

                <div className="container">
                    <div className="row align-items-center justify-content-center text-center">

                        <div className="col-md-8" data-aos="fade-up" data-aos-delay="400">


                            <div className="text-container" data-aos="fade-up">
                                <h1 className="text-white font-weight-light  font-weight-bold">
                                YDHM Logistic Corp.
                                </h1>
                            </div>
                            <p className="mb-5" data-aos="fade-up" data-aos-delay="100">A Logistics Company</p>
                            <p data-aos="fade-up" data-aos-delay="200">
                                <Link to="/Contact" className="btn btn-primary py-3 px-5 text-white">Get a Quote!</Link>
                                {user ? (
                                    <Link to="/dashboard" className="btn btn-outline-light py-3 px-5 ml-3">View Dashboard</Link>
                                ) : (
                                    <button type="button" className="btn btn-outline-light py-3 px-5 ml-3" onClick={() => openAuthModal("login")}>
                                        Login to Dashboard
                                    </button>
                                )}
                            </p>

                        </div>
                    </div>
                </div>
            </div>

            {authMode && (
                <AuthModalOverlay onClick={closeAuthModal}>
                    <AuthModalDialog onClick={(event) => event.stopPropagation()}>
                        <button type="button" className="modal-close" onClick={closeAuthModal} aria-label="Close">
                            x
                        </button>
                        <h3>Login</h3>
                        <form onSubmit={handleAuthSubmit}>
                            <label>
                                Email
                                <input
                                    type="email"
                                    name="email"
                                    value={authForm.email}
                                    onChange={handleAuthChange}
                                    required
                                />
                            </label>
                            <label>
                                Password
                                <input
                                    type="password"
                                    name="password"
                                    value={authForm.password}
                                    onChange={handleAuthChange}
                                    minLength="6"
                                    required
                                />
                            </label>
                            {authError && <p className="auth-error">{authError}</p>}
                            <button type="submit" className="submit-auth">
                                {loading ? "Please wait..." : "Login"}
                            </button>
                        </form>
                    </AuthModalDialog>
                </AuthModalOverlay>
            )}
        </>
    )
}

export default Navbar1;

const NavContainer = styled.nav`
  h2{
    color: white;
    font-weight: 400;
    span{
      font-weight: bold;
    }
  }
  padding: .4rem;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  a{
    color: white;
    text-decoration: none;
    margin-right: 1rem;
  }
  button{
    font: inherit;
  }
  .auth-link{
    background: transparent;
    border: 0;
    color: white;
    cursor: pointer;
    margin-right: 1rem;
    padding: 0;
  }
  .auth-status{
    line-height: 1.1;
    text-align: left;
    vertical-align: middle;
  }
  .auth-state{
    color: gold;
    display: block;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
  }
  .auth-name{
    color: white;
    display: block;
    font-size: 13px;
    margin-top: 2px;
  }
  .auth-link:hover{
    color: gold;
    opacity: .86;
  }
  .dropdown-hover:hover .dropdown-menu {
    display: block;
  }
  
  .links{
    position: absolute;
    top: -700px;
    left: -2000px;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
    transition: all .5s ease;
    li{
      color: white;
      font-size: 20px;
      display: inline-block;
      margin-right: 1rem;
      :hover{
        color: gold;
    }
    }
    li:hover{
        color: gold;
    }
    @media(min-width: 769px){
      position: initial;
      margin: 0;
      Link{
        font-size: 20px;
        color: white;
        display: inline;
      }
      display: block;
    }
  }
  .links li.marca a {
    color: gold;
  }
  


  .links .has-children {
    position: relative; }
    .links .has-children > a {
      position: relative;
      padding-right: 20px; }
      .links .has-children > a:before {
        position: absolute;
        
        font-size: 16px;
        top: 50%;
        right: 0;
        -webkit-transform: translateY(-50%);
        -ms-transform: translateY(-50%);
        transform: translateY(-50%);
        font-family: 'icomoon'; }
    .links .has-children .dropdown-menu {
      visibility: hidden;
      opacity: 0;
      top: 100%;
      position: absolute;
      text-align: left;
      border-top: 2px solid gold;
      -webkit-box-shadow: 0 2px 10px -2px rgba(0, 0, 0, 0.1);
      box-shadow: 0 2px 10px -2px rgba(0, 0, 0, 0.1);
      border-left: 1px solid #edf0f5;
      border-right: 1px solid #edf0f5;
      border-bottom: 1px solid #edf0f5;
      padding: 0px 0;
      margin-top: 20px;
      margin-left: 0px;
      background: #fff;
      -webkit-transition: 0.2s 0s;
      -o-transition: 0.2s 0s;
      transition: 0.2s 0s; }
      
      
      .links .has-children .dropdown-menu a {
        text-transform: none;
        letter-spacing: normal;
        -webkit-transition: 0s all;
        -o-transition: 0s all;
        transition: 0s all;
        color: #343a40; }
        .links .has-children .dropdown-menu a.active {
          color: gold; }
      .links .has-children .dropdown-menu .active > a {
        color: gold !important; }
      .links .has-children .dropdown-menu > li {
        list-style: none;
        padding: 0;
        margin: 0;
        min-width: 200px; }
        .links .has-children .dropdown-menu > li > a {
          padding: 9px 20px;
          display: block; }
          .links .has-children .dropdown-menu > li > a:hover {
            background: #f4f5f9;
            color: gold; }
        .links .has-children .dropdown-menu > li.has-children > a:before {
          
          right: 20px; }
        .links .has-children .dropdown-menu > li.has-children > .dropdown-menu, .links .has-children .dropdown-menu > li.has-children > ul {
          left: 100%;
          top: 0; }
        .links .has-children .dropdown-menu > li.has-children:hover > a, .links .has-children .dropdown-menu > li.has-children:active > a, .links .has-children .dropdown-menu > li.has-children:focus > a {
          background: #f4f5f9;
          color: #25262a; }
    .links .has-children:hover > a, .links .has-children:focus > a, .links .has-children:active > a {
      color: gold; }
    .links .has-children:hover, .links .has-children:focus, .links .has-children:active {
      cursor: pointer; }
      .links .has-children:hover > .dropdown-menu, .links .has-children:focus > .dropdown-menu, .links .has-children:active > .dropdown-menu {
        -webkit-transition-delay: 0s;
        -o-transition-delay: 0s;
        transition-delay: 0s;
        margin-top: 0px;
        visibility: visible;
        opacity: 1; }










  .links.active{
    width: 20%;
    display: block;
    position: absolute;
    margin-left: 20px;
    margin-right: auto;
    top: 100%;
    left: 0;
    right: 0; 
    text-align: center;
    li{
      font-size: 20px;
      margin-top: 1rem;
      color: #ffe;
      :hover{
        color: gold;
    }
    }
  }
  .burguer{
    @media(min-width: 769px){
      display: none;
    }
  }
`

const BgDiv = styled.div`
  background-color: #000;
  position: absolute;
  top: -1000px;
  left: -1000px;
  width: 100%;
  height: 80%;
  z-index: -1;
  transition: all .6s ease ;
  
  &.active{
    border-radius: 0 0 80% 0;
    top: 0;
    left: 0;
    width: 50%;
    height: 450%;
  }
  `

const AuthModalOverlay = styled.div`
  align-items: center;
  background: rgba(0, 0, 0, .62);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 20px;
  position: fixed;
  z-index: 2000;
`

const AuthModalDialog = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .3);
  max-width: 420px;
  padding: 28px;
  position: relative;
  width: 100%;

  h3{
    color: #222;
    font-size: 26px;
    margin: 0 0 20px;
  }

  label{
    color: #222;
    display: block;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 14px;
  }

  input,
  select{
    border: 1px solid #d8d8d8;
    border-radius: 4px;
    display: block;
    font-size: 16px;
    margin-top: 6px;
    padding: 10px 12px;
    width: 100%;
  }

  .auth-error{
    background: #ffe9e9;
    border-radius: 4px;
    color: #9d1f1f;
    font-size: 14px;
    margin: 0 0 12px;
    padding: 8px 10px;
  }

  .modal-close{
    background: transparent;
    border: 0;
    color: #555;
    cursor: pointer;
    font-size: 24px;
    line-height: 1;
    position: absolute;
    right: 18px;
    top: 16px;
  }

  .submit-auth{
    background: #0d6efd;
    border: 1px solid #0d6efd;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    padding: 11px 14px;
    width: 100%;
  }

  .switch-auth{
    background: transparent;
    border: 0;
    color: #0d6efd;
    cursor: pointer;
    display: block;
    margin: 16px auto 0;
    padding: 0;
  }
`
