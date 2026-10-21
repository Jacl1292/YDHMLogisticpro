import React from "react"
import Navbar1 from "../componets/navbar1";
import Footer from "../componets/footer";

export const Transportation = () => {

    return (
        <>

            <Navbar1 />
            <div className="site-section" id="section-trasnportation">
                <div className="container">

                    <div className="row justify-content-center mb-5">
                        <div className="col-md-7 text-center border-primary">
                            <h2 className="mb-0 text-custom" data-aos="fade" data-aos-delay="100">Transport Services</h2>
                            <p className="color-black-opacity-5" data-aos="fade" data-aos-delay="100"><b>LTL, FTL, Distribution, Box Trucks</b></p>
                        </div>
                    </div>
                    <div className="row justify-content-center mb-5">

                        <div className="col-sm-6 col-md-6 ml-auto mb-5 order-md-2" data-aos="fade-up" data-aos-delay="100">
                            <img src={new URL("../images/transporteYDHMLogistics.jpeg", import.meta.url).href} alt="" className="img-fluid rounded" />
                        </div>
                        <div className=" col-sm-6 col-md-6 order-md-1" data-aos="fade-up">

                            <p>Are you seeking efficient and dependable transport services to streamline your logistics needs? Look no
                                further! Our transport solutions are designed to exceed your expectations.</p>
                            <p>&quot;Whether you require a one-time delivery or seek professional and commercial trucking services for
                                ongoing transportation needs, rest assured, we offer top-notch solutions at competitive rates. With
                                years of industry expertise, our company has built a robust network spanning the country, enabling us to
                                deliver safe, reliable, and customized logistics solutions to our valued clients and partners.</p>
                            <p>Our cutting-edge fleet of trucks, regularly maintained for optimal performance, ensures efficient
                                delivery of high-value and oversized goods. Count on us for unparalleled service at competitive pricing.
                                Our dedicated logistics consultants are readily available to address any inquiries or provide detailed
                                information about our trucking services.&quot;</p>
                        </div>

                    </div>
                    <div className="row justify-content-center mb-5">
                        <div className="accordion accordion-flush" data-aos="fade-up" data-aos-delay="100" id="accordionFlushExample">
                            <div className="accordion-item">
                                <h2 className="accordion-header">
                                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
                                        Swift and Secure Delivery:
                                    </button>
                                </h2>
                                <div id="flush-collapseOne" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                                    <div className="accordion-body">From point A to point B, we ensure prompt and safe transportation of your goods.</div>
                                </div>
                            </div>
                            <div className="accordion-item">
                                <h2 className="accordion-header">
                                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseTwo" aria-expanded="false" aria-controls="flush-collapseTwo">
                                        Flexible Options:
                                    </button>
                                </h2>
                                <div id="flush-collapseTwo" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                                    <div className="accordion-body">Whether it&#39;s small packages or large cargo, we offer a range of transport modes to suit your requirements.</div>
                                </div>
                            </div>
                            <div className="accordion-item">
                                <h2 className="accordion-header">
                                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseThree" aria-expanded="false" aria-controls="flush-collapseThree">
                                        24/7 Tracking:
                                    </button>
                                </h2>
                                <div id="flush-collapseThree" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                                    <div className="accordion-body">Stay informed at every step. Our advanced tracking systems provide real-time updates on your shipments.</div>
                                </div>
                            </div>
                            <div className="accordion-item">
                                <h2 className="accordion-header">
                                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseFour" aria-expanded="false" aria-controls="flush-collapseFour">
                                        Expertise and Reliability:
                                    </button>
                                </h2>
                                <div id="flush-collapseFour" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                                    <div className="accordion-body">Backed by years of experience and a dedicated team, we guarantee reliable service every time.</div>
                                </div>
                            </div>
                            <div className="accordion-item">
                                <h2 className="accordion-header">
                                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseFive" aria-expanded="false" aria-controls="flush-collapseFive">
                                        Customized Solutions:
                                    </button>
                                </h2>
                                <div id="flush-collapseFive" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                                    <div className="accordion-body">Tailored services to fit your specific needs, ensuring a personalized experience.</div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="row justify-content-center mb-5">
                      <div className="col-10 text-center">

                        <h5 data-aos="fade" data-aos-delay="100">Contact us today to experience hassle-free transport services! Let us take the wheel while you focus on
                            your business. Reach out for a free quote or consultation.</h5>
                      </div>
                    </div>
                </div>
            </div>


            <Footer />

        </>

    )

}
export default Transportation;