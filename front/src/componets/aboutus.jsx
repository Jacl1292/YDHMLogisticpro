import React from "react";


export const Aboutus = () => {

  return (
    <div className="site-section" id="section-about">
      <div className="container">
        <div className="row mb-5">

          <div className="col-sm-6 col-md-6 ml-auto mb-5 order-md-2" data-aos="fade-up" data-aos-delay="100">
            <img src={new URL("../images/camion.jpeg", import.meta.url).href} alt="" className="img-fluid rounded" />
          </div>
          <div className=" col-sm-6 col-md-6 order-md-1" data-aos="fade-up">
            <div className="text-left pb-1 border-primary mb-4">
              <h2 className="text-custom">About Us</h2>
            </div>
            <h4> Welcome to YDHM Logistic Corp. - Leaders in Precision Logistics Solutions</h4>
            <p>With a legacy of excellence spanning several decades, YDHM Logistic Corp. stands at the forefront of the logistics and transportation industry. Our unwavering commitment to reliability, innovation, and client satisfaction has established us as the go-to partner for businesses seeking unparalleled supply chain management.</p>
            <p className="mb-5">At YDHM Logistic Corp., we are not just logistics experts; we are architects of seamless supply chains. With a team of seasoned professionals boasting years of hands-on experience in the industry, we navigate the complexities of global logistics with finesse. Our comprehensive suite of services is designed to meet the unique needs of each client, ensuring that their goods move efficiently and effectively from origin to destination.</p> 

          </div>

        </div>
      </div>
    </div>
  )


}
export default Aboutus;