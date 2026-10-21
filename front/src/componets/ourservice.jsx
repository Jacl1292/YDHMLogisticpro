import React from "react";
import { Link } from "react-router-dom";

export const Ourservice = () => {

   return(

    <div className="site-section bg-light" id="section-services">
        <div className="container">
          <div className="row justify-content-center mb-5" data-aos="fade-up">
            <div className="col-md-7 text-center border-primary">
              <h2 className="mb-0 text-custom">Our Services</h2>
              <p className="color-black-opacity-5">Lorem ipsum dolor sit amet.</p>
            </div>
          </div>
          <div className="row align-items-stretch">
            <div className="col-md-6 col-lg-4 mb-4 mb-lg-4" data-aos="fade-up">
              <div className="unit-4 d-flex">
                <div className="unit-4-icon mr-4"><span className="text-primary flaticon-plane"></span></div>
                <div>
                  <h3>Air Freight</h3>
                  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis quis molestiae vitae eligendi at.</p>
                  <p><Link to="#">Learn More</Link></p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4 mb-4 mb-lg-4" data-aos="fade-up" data-aos-delay="100">
              <div className="unit-4 d-flex">
                <div className="unit-4-icon mr-4"><span className="text-primary flaticon-boat-ship"></span></div>
                <div>
                  <h3>Ocean Freight</h3>
                  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis quis molestiae vitae eligendi at.</p>
                  <p><Link to="#">Learn More</Link></p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4 mb-4 mb-lg-4" data-aos="fade-up" data-aos-delay="200">
              <div className="unit-4 d-flex">
                <div className="unit-4-icon mr-4"><span className="text-primary flaticon-truck"></span></div>
                <div>
                  <h3>Land Transportation</h3>
                  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis quis molestiae vitae eligendi at.</p>
                  <p><Link to="#">Learn More</Link></p>
                </div>
              </div>
            </div>


            <div className="col-md-6 col-lg-4 mb-4 mb-lg-4" data-aos="fade-up" data-aos-delay="300">
              <div className="unit-4 d-flex">
                <div className="unit-4-icon mr-4"><span className="text-primary flaticon-warehouse"></span></div>
                <div>
                  <h3>Warehousing</h3>
                  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis quis molestiae vitae eligendi at.</p>
                  <p><Link to="#">Learn More</Link></p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4 mb-4 mb-lg-4" data-aos="fade-up" data-aos-delay="400">
              <div className="unit-4 d-flex">
                <div className="unit-4-icon mr-4"><span className="text-primary flaticon-wooden"></span></div>
                <div>
                  <h3>Storage</h3>
                  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis quis molestiae vitae eligendi at.</p>
                  <p><Link to="#">Learn More</Link></p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4 mb-4 mb-lg-4" data-aos="fade-up" data-aos-delay="500">
              <div className="unit-4 d-flex">
                <div className="unit-4-icon mr-4"><span className="text-primary flaticon-worldwide"></span></div>
                <div>
                  <h3>Worldwide Delivery</h3>
                  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis quis molestiae vitae eligendi at.</p>
                  <p><Link to="#">Learn More</Link></p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

   )

}
export default Ourservice;