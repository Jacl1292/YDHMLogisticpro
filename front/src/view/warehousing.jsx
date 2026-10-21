import React from "react"
import Navbar1 from "../componets/navbar1";
import Footer from "../componets/footer";

export const Warehousing = () => {

    return (
        <>

            <Navbar1 />
            <div className="site-section" id="section-trasnportation">
                <div className="container">

                    <div className="row justify-content-center mb-5">
                        <div className="col-md-7 text-center border-primary">
                            <h2 className="mb-0 text-custom" data-aos="fade" data-aos-delay="100">Warehousing Services</h2>
                            <p className="color-black-opacity-5" data-aos="fade" data-aos-delay="100"><b>Inventory Management, Order Fulfillment, Distribution Services, Customer Service.</b></p>
                        </div>
                    </div>
                    <div className="row justify-content-center mb-5">

                        <div className="col-sm-6 col-md-6 ml-auto mb-5 order-md-2" data-aos="fade-up" data-aos-delay="100">
                            <img src={new URL("../images/warehousingdescription.jpeg", import.meta.url).href} alt="" className="img-fluid rounded" />
                        </div>
                        <div className=" col-sm-6 col-md-6 order-md-1" data-aos="fade-up">

                            <p>At YDHM Logistics Corp. we offer more than just storage – we provide comprehensive warehousing
                                solutions tailored to meet your diverse needs. Our state-of-the-art facilities and expert handling ensure
                                the safety, security, and efficiency of your inventory.</p>
                            <p>&quot;With years of industry experience, we understand the nuances of
                                warehousing and logistics, providing reliable services consistently. We design solutions that align with your business goals, providing flexible storage
                                options that grow with your needs.Count on us for secure, efficient, and cost-effective warehousing solutions that
                                prioritize the integrity of your goods.&quot;</p>
                        </div>

                    </div>
                    <div className="row justify-content-center mb-5">
                        <div className="accordion accordion-flush" data-aos="fade-up" data-aos-delay="100" id="accordionFlushExample">
                            <div className="accordion-item">
                                <h2 className="accordion-header">
                                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
                                        Optimized Storage:
                                    </button>
                                </h2>
                                <div id="flush-collapseOne" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                                    <div className="accordion-body">Our facilities are equipped with cutting-edge racking systems and temperature-
                                        controlled areas to accommodate various types of goods.</div>
                                </div>
                            </div>
                            <div className="accordion-item">
                                <h2 className="accordion-header">
                                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseTwo" aria-expanded="false" aria-controls="flush-collapseTwo">
                                        Advanced Security Measures:
                                    </button>
                                </h2>
                                <div id="flush-collapseTwo" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                                    <div className="accordion-body">Your goods are in safe hands with our stringent security protocols,
                                        surveillance systems, and controlled access.</div>
                                </div>
                            </div>
                            <div className="accordion-item">
                                <h2 className="accordion-header">
                                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseThree" aria-expanded="false" aria-controls="flush-collapseThree">
                                        Inventory Management Excellence:
                                    </button>
                                </h2>
                                <div id="flush-collapseThree" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                                    <div className="accordion-body">From receiving to dispatch, our meticulous inventory management
                                        guarantees accuracy and timely processing of orders.</div>
                                </div>
                            </div>
                            <div className="accordion-item">
                                <h2 className="accordion-header">
                                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseFour" aria-expanded="false" aria-controls="flush-collapseFour">
                                        Customized Services:
                                    </button>
                                </h2>
                                <div id="flush-collapseFour" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                                    <div className="accordion-body">We adapt to your requirements, offering value-added services such as order
                                        fulfillment, kitting, and assembly.</div>
                                </div>
                            </div>
                            <div className="accordion-item">
                                <h2 className="accordion-header">
                                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseFive" aria-expanded="false" aria-controls="flush-collapseFive">
                                        Efficient Distribution:
                                    </button>
                                </h2>
                                <div id="flush-collapseFive" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                                    <div className="accordion-body">Our strategic location and streamlined processes ensure seamless distribution and
                                        last-mile delivery.</div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="row justify-content-center mb-5">
                        <div className="col-10 text-center">

                            <h5 data-aos="fade" data-aos-delay="100">Experience hassle-free warehousing! Partner with us today to optimize your inventory management and
                                streamline your distribution process. Contact our team for a personalized consultation and discover how
                                we can elevate your storage needs.</h5>
                        </div>
                    </div>
                </div>
            </div>


            <Footer />

        </>

    )

}
export default Warehousing;