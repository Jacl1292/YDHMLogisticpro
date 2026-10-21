import React from "react";
import { Link } from "react-router-dom";


export const Footer = () => {

    return (
        <footer className="site-footer">
            <div className="container">
                <div className="row">
                    <div className="col-md-9">
                        <div className="row">
                            <div className="col-md-5 mr-auto">
                                <h2 className="footer-heading mb-4">About Us</h2>
                                <p>With a legacy of excellence spanning several decades, YDHM Logistic Corp. stands at the forefront of the logistics and transportation industry. Our unwavering commitment to reliability, innovation, and client satisfaction has established us as the go-to partner for businesses seeking unparalleled supply chain management.</p>
                            </div>

                            <div className="col-md-3">
                                <h2 className="footer-heading mb-4">Quick Links</h2>
                                <ul className="list-unstyled">
                                    <li><Link to="/Aboutusv">About Us</Link></li>
                                    <li><Link to="/Services/transportation">Transportation Service</Link></li>
                                    <li><Link to="/Services/Warehousing">Warehousing Service</Link></li>
                                    <li><Link to="/Contact">Contact Us</Link></li>
                                </ul>
                            </div>
                            <div className="col-md-3">
                                <h2 className="footer-heading mb-4">Follow Us</h2>
                                <Link to="https://www.facebook.com/profile.php?id=61555168749631&mibextid=LQQJ4d" className="pl-0 pr-3"><span className="icon-facebook"></span></Link>
                                {/*<Link href="#" className="pl-3 pr-3"><span className="icon-twitter"></span></Link>*/}
                                <Link to="https://www.instagram.com/ydhm_logistics?igsh=MTBpdDlkeGhkcGJu&utm_source=qr" className="pl-3 pr-3"><span className="icon-instagram"></span></Link>
                               {/* <Link href="#" className="pl-3 pr-3"><span className="icon-linkedin"></span></Link>*/}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <h2 className="footer-heading mb-4">Contact us</h2>
                        <p data-aos="fade-up" data-aos-delay="200"><Link to="/Contact" className="btn btn-primary py-3 px-5 text-white">Get a Quote!</Link></p>
                    </div>
                </div>
                <div className="row pt-5 mt-5 text-center">
                    <div className="col-md-12">
                        <div className="border-top pt-5">
                            <p>
                                {/* <!-- Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. -->  */}
                                © 2024 YDHM Logistic Corp. All Rights Reserved
                                {/*} <!-- Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. -->  */}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </footer>
    )

}
export default Footer;