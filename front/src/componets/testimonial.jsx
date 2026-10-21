import React from "react";

export const Testimonial = () => {
   return(

    <div className="site-section border-bottom">
    <div className="container">

      <div className="row justify-content-center mb-5">
        <div className="col-md-7 text-center border-primary">
          <h2 className="font-weight-light text-custom " data-aos="zoom-in">Testimonials</h2>
        </div>
      </div>

      <div id="testimonialCarousel" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#testimonialCarousel" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Testimonial 1"></button>
          <button type="button" data-bs-target="#testimonialCarousel" data-bs-slide-to="1" aria-label="Testimonial 2"></button>
          <button type="button" data-bs-target="#testimonialCarousel" data-bs-slide-to="2" aria-label="Testimonial 3"></button>
        </div>

        <div className="carousel-inner pb-5">
          <div className="carousel-item active" data-aos="zoom-in-down">
            <div className="testimonial">
              <figure className="mb-4">
                <img src={new URL("../images/Jorgecasañas.jpeg", import.meta.url).href} alt="" className="img-fluid mb-3" />
              </figure>
              <blockquote>
                <p>&ldquo;Partnering with YDHM Logistic Corp. was a game-changer for our business. Their attention to detail in inventory management and seamless order fulfillment have significantly improved our operational efficiency. We value their commitment to excellence and look forward to a continued successful partnership.&rdquo;</p>
                <p className="author"> &mdash; Jorge Luis Casañas</p>
              </blockquote>
            </div>
          </div>

          <div className="carousel-item" data-aos="zoom-in-down">
            <div className="testimonial">
              <figure className="mb-4">
                <img src={new URL("../images/Carloscuadra.jpeg", import.meta.url).href} alt="" className="img-fluid mb-3" />
              </figure>
              <blockquote>
                <p>&ldquo;YDHM Logistic Corp. goes above and beyond in delivering top-notch logistics services. Their dedication to customer satisfaction is evident in every interaction. The value-added services, including quality control and customized packaging, have set them apart as a trusted and reliable partner for our supply chain needs.&rdquo;</p>
                <p className="author"> &mdash; Carlos Cuadra</p>
              </blockquote>
            </div>
          </div>

          <div className="carousel-item" data-aos="zoom-in-down">
            <div className="testimonial">
              <figure className="mb-4">
                <img src={new URL("../images/person_4.jpg", import.meta.url).href} alt="" className="img-fluid mb-3" />
              </figure>
              <blockquote>
                <p>&ldquo;Efficiency, accuracy, and a true understanding of our industry - that's what YDHM Logistic Corp. brings to the table. Their use of advanced technology, such as Warehouse Management Systems, has revolutionized the way we manage our inventory. We are impressed with their commitment to innovation and the seamless experience they provide.&rdquo;</p>
                <p className="author"> &mdash; Ben Carson</p>
              </blockquote>
            </div>
          </div>
        </div>

        <button className="carousel-control-prev" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>


    </div>
  </div>
   )

}
export default Testimonial;
