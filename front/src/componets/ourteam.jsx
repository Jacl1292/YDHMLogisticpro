import React from "react";


export const Ourteam = () => {

   return(
    <div className="site-section border-bottom" id="section-our-team">
    <div className="container">
      <div className="row justify-content-center mb-5">
        <div className="col-md-7 text-center border-primary">
          <h2 className="font-weight-light text-custom" data-aos="fade">Our Team</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6 col-lg-4 mb-5 mb-lg-0" data-aos="fade" data-aos-delay="100">
          <div className="person">
            <img src={new URL("../images/Yanzmanager.jpeg", import.meta.url).href} alt="" className="img-fluid rounded mb-5 w-75 rounded-circle" />
            <h3>Yanz Hinze</h3>
            <p className="position text-muted">Founder, President</p>
            <p className="mb-4">As the Founder and President of YDHM Logistic Corp., Yanz Hinze brings visionary leadership and strategic direction to our organization. With a wealth of experience in the logistics and transportation industry, he is the driving force behind our commitment to excellence. Yanz Hinze oversees the overall growth and development of the company, ensuring that our services align with the evolving needs of our clients and the dynamic landscape of the industry.</p>
           {/* <ul className="ul-social-circle">
              <li><a href="#"><span className="icon-facebook"></span></a></li>
              <li><a href="#"><span className="icon-twitter"></span></a></li>
              <li><a href="#"><span className="icon-linkedin"></span></a></li>
              <li><a href="#"><span className="icon-instagram"></span></a></li>
   </ul>*/}
          </div>
        </div>
        <div className="col-md-6 col-lg-4 mb-5 mb-lg-0" data-aos="fade" data-aos-delay="200">
          <div className="person">
            <img src={new URL("../images/Dayana1.jpeg", import.meta.url).href} alt="" className="img-fluid rounded mb-5 w-75 rounded-circle" />
            <h3>Dayana Martinez</h3>
            <p className="position text-muted">Co-Founder, COO</p>
            <p className="mb-4">In the role of Co-Founder and Chief Operating Officer, Dayana Martinez is the operational maestro behind the success of YDHM Logistic Corp.. Drawing upon extensive experience in supply chain management, she is responsible for the seamless execution of our logistics solutions. Dayana Martinez spearheads the implementation of cutting-edge technologies, oversees day-to-day operations, and ensures that our services consistently meet the highest standards of efficiency and reliability.</p>
           {/*} <ul className="ul-social-circle">
              <li><a href="#"><span className="icon-facebook"></span></a></li>
              <li><a href="#"><span className="icon-twitter"></span></a></li>
              <li><a href="#"><span className="icon-linkedin"></span></a></li>
              <li><a href="#"><span className="icon-instagram"></span></a></li>
   </ul>*/}
          </div>
        </div>
        <div className="col-md-6 col-lg-4 mb-5 mb-lg-0" data-aos="fade" data-aos-delay="300">
          <div className="person">
            <img src={new URL("../images/pepe office.png", import.meta.url).href} alt="" className="img-fluid rounded mb-5 w-75 rounded-circle" />
            <h3>Jose A. Carballo</h3>
            <p className="position text-muted">Developer & Marketing</p>
            <p className="mb-4">At YDHM Logistic Corp., we believe in the power of innovation and strategic communication. Our Developer & Marketing expert, Jose A. Carballo, embodies this philosophy with a unique blend of technical prowess and creative vision. With a background in both software development and marketing strategy, he plays a pivotal role in shaping our digital presence and driving our brand forward.</p>
            {/*<ul className="ul-social-circle">
              <li><a href="#"><span className="icon-facebook"></span></a></li>
              <li><a href="#"><span className="icon-twitter"></span></a></li>
              <li><a href="#"><span className="icon-linkedin"></span></a></li>
              <li><a href="#"><span className="icon-instagram"></span></a></li>
   </ul>*/}
          </div>
        </div>
      </div>
    </div>
  </div>

   )

}
export default Ourteam;  