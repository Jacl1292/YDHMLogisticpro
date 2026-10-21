import React from "react"

import Aboutus from "../componets/aboutus"

import Testimonial from "../componets/testimonial"
import Contact from "../componets/contact"
import Footer from "../componets/footer"
import Navbar1 from "../componets/navbar1"
import Howitw from "../componets/howitw"
import Cardservice from "../componets/cardservice"


export const Home = () => {

return (
      <>

      <Navbar1/>
      <Aboutus />
      <Howitw/>
      <Cardservice/>
      
      <Testimonial />
      <Contact/>      
      <Footer/>

      </>
    
)

}
