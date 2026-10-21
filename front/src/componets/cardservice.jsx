import React from "react";
import { Link } from 'react-router-dom'

export const Cardservice = () => {

    return (
        <div className="site-section-card" id="section-service">
            <div className="container">
                <div className="row justify-content-center mb-5">
                    <div className="col-md-7 text-center border-primary">
                        <h2 className="font-weight-light text-custom" data-aos="fade-up">Services</h2>

                    </div>
                </div>
                <div className="row mb-5 align-items-stretch">
                    <div className="col-md-6 col-lg-6 mb-3 mb-lg-3" data-aos="fade-up">
                        <div className="h-entry">
                            <img src={new URL("../images/camionamarillo.jpeg", import.meta.url).href} alt="" className="img-fluid" />
                            <h2 className="font-size-regular"><Link to="/Services/transportation">Transport Services</Link></h2>
                            <div className="meta mb-4">LTL, FTL, Distribution, Box Trucks</div>
                            <p>Are you seeking efficient and dependable transport services to streamline your logistics needs? Look no
                                further! Our transport solutions are designed to exceed your expectations.</p>
                            <div className="col-12 text-center" data-aos="fade-up" data-aos-delay="100">
                                <p className="mb-0"><Link to="/Services/transportation" className="btn btn-primary py-3 px-5 text-white">Learn More</Link></p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-6 mb-3 mb-lg-3" data-aos="fade-up" data-aos-delay="100">
                        <div className="h-entry">
                            <img src={new URL("../images/warehousingprincipal.jpeg", import.meta.url).href} alt="" className="img-fluid" />
                            <h2 className="font-size-regular"><Link to="/Services/Warehousing">Warehousing Services</Link></h2>
                            <div className="meta mb-4">Inventory Management, Order Fulfillment, Distribution Services, Customer Service.</div>
                            <p>At YDHM Logistics Corp. we offer more than just storage – we provide comprehensive warehousing
                                solutions tailored to meet your diverse needs. Our state-of-the-art facilities and expert handling ensure
                                the safety, security, and efficiency of your inventory.</p>
                            <div className="col-12 text-center" data-aos="fade-up" data-aos-delay="100">
                                <p className="mb-0"><Link to="/Services/Warehousing" className="btn btn-primary py-3 px-5 text-white" >Learn More</Link></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}
export default Cardservice;