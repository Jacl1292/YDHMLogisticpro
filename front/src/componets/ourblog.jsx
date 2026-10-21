import React from "react";
import { Link } from "react-router-dom";

export const Ourblog = () => {

   return(
    <div className="site-section" id="section-blog">
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-md-7 text-center border-primary">
              <h2 className="font-weight-light text-custom" data-aos="fade-up">Our Blog</h2>
              <p className="color-black-opacity-5" data-aos="fade-up">See Our Daily News &amp; Updates</p>
            </div>
          </div>
          <div className="row mb-5 align-items-stretch">
            <div className="col-md-6 col-lg-4 mb-4 mb-lg-4" data-aos="fade-up">
              <div className="h-entry">
                <Link to="single.html"><img src={new URL("../images/blog_1.jpg", import.meta.url).href} alt="" className="img-fluid" /></Link>
                <h2 className="font-size-regular"><Link to="single.html">How Logistics Company Improve Spendings</Link></h2>
                <div className="meta mb-4">by Jed Wilson <span className="mx-2">&bullet;</span> Jan 18, 2019 <span className="mx-2">&bullet;</span> <Link to="#">News</Link></div>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus eligendi nobis ea maiores sapiente veritatis reprehenderit suscipit quaerat rerum voluptatibus a eius.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4 mb-4 mb-lg-4" data-aos="fade-up" data-aos-delay="100">
              <div className="h-entry">
                <Link to="single.html"><img src={new URL("../images/blog_2.jpg", import.meta.url).href} alt="" className="img-fluid" /></Link>
                <h2 className="font-size-regular"><Link to="single.html">How Logistics Company Improve Spendings</Link></h2>
                <div className="meta mb-4">by Jed Wilson <span className="mx-2">&bullet;</span> Jan 18, 2019 <span className="mx-2">&bullet;</span> <Link to="#">News</Link></div>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus eligendi nobis ea maiores sapiente veritatis reprehenderit suscipit quaerat rerum voluptatibus a eius.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4 mb-4 mb-lg-4" data-aos="fade-up" data-aos-delay="200">
              <div className="h-entry">
                <Link to="single.html"><img src={new URL("../images/blog_3.jpg", import.meta.url).href} alt="" className="img-fluid" /></Link>
                <h2 className="font-size-regular"><Link to="single.html">How Logistics Company Improve Spendings</Link></h2>
                <div className="meta mb-4">by Jed Wilson <span className="mx-2">&bullet;</span> Jan 18, 2019 <span className="mx-2">&bullet;</span> <Link to="#">News</Link></div>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus eligendi nobis ea maiores sapiente veritatis reprehenderit suscipit quaerat rerum voluptatibus a eius.</p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12 text-center" data-aos="fade-up" data-aos-delay="300">
              <p className="mb-0"><Link to="https://free-template.co" className="btn btn-primary py-3 px-5 text-white">View All Blog Posts</Link></p>
            </div>
          </div>
        </div>
      </div>
   )

}
export default Ourblog;