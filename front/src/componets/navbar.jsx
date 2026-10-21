/*import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import fondoPrincipal from '../images/fondo-principal.jpg';
export const Navbar = () => {

    const [scrolled, setScrolled] = useState(false);

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
    return (
        <>
            {/* <div className="site-mobile-menu site-navbar-target">
        <div className="site-mobile-menu-header">
          <div className="site-mobile-menu-close mt-3">
           <span className="icon-close2 js-menu-toggle"></span>
          </div>
        </div>
        <div className="site-mobile-menu-body"></div>
  </div>}

            <header className={`site-navbar py-3 js-site-navbar site-navbar-target ${scrolled ? "navbar-scroll" : ""}`} role="banner" id="site-navbar" style={{ position: "fixed", top: 0, zIndex: 100 }}>

                <div className="container">
                    <div className="row align-items-center">

                        <div className="col-5 col-xl-2 site-logo">
                            <a href="index.html" className="logo col-sm-4 col-12 mb-0"><img src={new URL("../images/YDHMlogo-removebg-preview.png", import.meta.url).href} alt="" className="img-fluid" /></a>
                        </div>
                        <div className="col-12 col-sm-2 col-md-10 d-none d-xl-block">
                            <nav className="site-navigation position-relative text-right" role="navigation">

                                <ul className="site-menu js-clone-nav mx-auto d-none d-lg-block "  >
                                    <li><Link to="/" className="nav-link">Home</Link></li>
                                    <li className="has-children">

                                        <a href="#section-about" className="nav-link">About Us </a>

                                        <ul className="dropdown">
                                            <li><a href="#section-how-it-works" className="nav-link">How It Works</a></li>
                                            <li><a href="#section-our-team" className="nav-link">Our Team</a></li>
                                        </ul>

                                    </li>


                                    <li><a href="#section-services" className="nav-link">Services</a></li>
                                    <li><a href="#section-industries" className="nav-link">Industries</a></li>
                                    <li><Link to="/Blog" className="nav-link">Blog</Link></li>
                                    <li><Link to="/Contact"  className="nav-link">Contact</Link></li>
                                </ul>
                            </nav>
                        </div>


                        <div className="d-inline-block d-xl-none col-7 ml-md-0 mr-auto align-items-right text-white text-right py-3" style={{ position: "relative", top: "3px", }}><a href="#" className="navbar-toggler float-right" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">

                            <span className="icon-menu h2"></span></a>
                        </div>

                    </div>

                </div>

                <div className="collapse " id="navbarSupportedContent">
                    <ul className="navbar-nav  ml-auto">
                        <li className="nav-item ">
                          <Link to="/" className="nav-link" href="#">Home</Link>
                        </li>
                        <li className="has-children">

                            <a href="#section-about" className="nav-link">About Us </a>

                            <ul className="dropdown">
                                <li><a href="#section-how-it-works" className="nav-link">How It Works</a></li>
                                <li><a href="#section-our-team" className="nav-link">Our Team</a></li>
                            </ul>

                        </li>
                        <li className="nav-item "><a href="#section-services" className="nav-link">Services</a></li>
                        <li className="nav-item "><a href="#section-industries" className="nav-link">Industries</a></li>
                        <li className="nav-item "><Link to="/Blog" className="nav-link">Blog</Link></li>
                        <li className="nav-item "><Link to="/Contact"  className="nav-link">Contact</Link></li>
                    </ul>
                </div>

            </header >











            <div className="site-blocks-cover overlay animated-background" style={{ backgroundImage: `url(${fondoPrincipal})`}} data-aos="fade" data-stellar-background-ratio="0.5" id="section-home">
                {/* <img src={new URL("./images/hero_bg_2.jpg", import.meta.url).href} alt="" className="img-fluid" />

 <div style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "100%" }}>
  <img src={new URL("./images/hero_bg_2.jpg", import.meta.url).href} alt="" className="img-fluid" style={{ filter: "brightness(0.7)" }}/>
  </div>*//*}     
                <div className="container">
                    <div className="row align-items-center justify-content-center text-center">

                        <div className="col-md-8" data-aos="fade-up" data-aos-delay="400">


                            <h1 className="text-white font-weight-light text-uppercase font-weight-bold" data-aos="fade-up">We Make Shipping</h1>
                            <p className="mb-5" data-aos="fade-up" data-aos-delay="100">A Logistics Company</p>
                            <p data-aos="fade-up" data-aos-delay="200"><a href="https://free-template.co" className="btn btn-primary py-3 px-5 text-white">Get Started!</a></p>

                        </div>
                    </div>
                </div>
            </div>
        </>
    )



}
export default Navbar;*/