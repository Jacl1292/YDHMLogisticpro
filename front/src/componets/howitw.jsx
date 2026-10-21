import React from "react";


export const Howitw = () => {

   return(
    <div className="site-section bg-image overlay mb-4" id="section-how-it-works">
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-md-7 text-center border-primary">
              <h2 className="font-weight-light text-custom" data-aos="fade">What Sets Us Apart</h2>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 col-lg-4 mb-5 mb-lg-0" data-aos="fade" data-aos-delay="100">
              <div className="how-it-work-item">
                <span className="number">1</span>
                <div className="how-it-work-body">
                  <h2>Precision and Accuracy:</h2>
                  <p className="mb-5">Our meticulous approach to inventory management, order fulfillment, and distribution sets us apart. We leverage cutting-edge technology, including advanced Warehouse Management Systems (WMS) and automation, to deliver precise logistics solutions.</p>
                  
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 mb-5 mb-lg-0" data-aos="fade" data-aos-delay="200">
              <div className="how-it-work-item">
                <span className="number">2</span>
                <div className="how-it-work-body">
                  <h2>Customized Solutions:</h2>
                  <p className="mb-5">Recognizing that every business is unique, we tailor our services to fit your specific requirements. Whether you're a small e-commerce startup or a multinational corporation, our solutions scale to meet your demands.</p>
                  
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 mb-5 mb-lg-0" data-aos="fade" data-aos-delay="300">
              <div className="how-it-work-item">
                <span className="number">3</span>
                <div className="how-it-work-body">
                  <h2>Global Reach, Local Expertise:</h2>
                  <p className="mb-5">With a global network and a deep understanding of local markets, we seamlessly connect your products to customers worldwide. Our expertise in cross-border logistics and compliance ensures a smooth international shipping experience.</p>
                  
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

   )

}   
export default Howitw;