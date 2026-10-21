import React, { useState, useRef } from "react";
import emailjs from '@emailjs/browser';
import { Link } from "react-router-dom";


export const Contact = () => {
    const form = useRef();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        telef: "",
        message: "",
    });

    const [formErrors, setFormErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        const serviceID = import.meta.env.VITE_serviceID;
        const templateID = import.meta.env.VITE_templateID;
        const apiKey = import.meta.env.VITE_apiKey;


        // Validar los campos del formulario
        const errors = {};

        const nameRegex = /^[a-zA-Z\s]+$/;
        const phoneRegex = /^[0-9+]+$/;

        if (!formData.firstName) {
            errors.firstName = "First Name is required";
        } else if (!nameRegex.test(formData.firstName)) {
            errors.firstName = "Invalid First Name";
        }

        if (!formData.lastName) {
            errors.lastName = "Last Name is required";
        } else if (!nameRegex.test(formData.lastName)) {
            errors.lastName = "Invalid Last Name";
        }

        if (!formData.email) {
            errors.email = "Email is required";
        }
        if (!formData.telef) {
            errors.telef = "Phone is required";
        } else if (!phoneRegex.test(formData.telef)) {
            errors.telef = "Invalid Phone Number";
        }


        // Agrega más validaciones según tus necesidades

        // Actualizar el estado de los errores
        setFormErrors(errors);

        // Si no hay errores, puedes realizar otras acciones, como enviar los datos a un servidor
        if (Object.keys(errors).length === 0) {
            // Realizar acciones adicionales, como enviar los datos a un servidor
            

            emailjs.sendForm(serviceID, templateID, form.current, apiKey)
      .then((result) => {
          console.log(result.text);
      }, (error) => {
          console.log(error.text);
      });




      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        telef: "",
        message: "",
    });
    setFormErrors({});
    console.log("Form submitted!");

        }
    };


    return (
        <div className="site-section bg-light" id="section-contact">
            <div className="container contact">
                <div className="row justify-content-center mb-5">
                    <div className="col-md-7 text-center border-primary">
                        <h2 className="font-weight-light text-custom">Contact Us</h2>
                        <p className="color-black-opacity-5">See Our Daily News &amp; Updates</p>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-7 mb-5">



                        <form action="#" ref={form} className="p-5 bg-white" onSubmit={handleSubmit}>


                            <div className="row form-group">
                                <div className="col-md-6 mb-3 mb-md-0">
                                    <label className="text-black" htmlFor="fname">First Name</label>
                                    <input type="text" id="fname" name="firstName"
                                        className="form-control"
                                        value={formData.firstName}
                                        onChange={handleInputChange} />


                                </div>
                                <div className="col-md-6">
                                    <label className="text-black" htmlFor="lname">Last Name</label>
                                    <input type="text" id="lname" name="lastName"
                                        className="form-control"
                                        value={formData.lastName}
                                        onChange={handleInputChange} />
                                </div>
                                {formErrors.firstName && (
                                    <div className="text-danger">{formErrors.firstName}</div>
                                )}
                                {formErrors.lastName && (
                                    <div className="text-danger">{formErrors.lastName}</div>
                                )}

                            </div>

                            <div className="row form-group">

                                <div className="col-md-12">
                                    <label className="text-black" htmlFor="email">Email</label>
                                    <input type="email" id="email" name="email"
                                        className="form-control"
                                        value={formData.email}
                                        onChange={handleInputChange} />
                                </div>
                                {formErrors.email && (
                                    <div className="text-danger">{formErrors.email}</div>
                                )}

                            </div>

                            <div className="row form-group">

                                <div className="col-md-12">
                                    <label className="text-black" htmlFor="subject">Phone</label>
                                    <input type="tel" id="telef" name="telef"
                                        className="form-control"
                                        value={formData.telef}
                                        onChange={handleInputChange} />
                                </div>
                                {formErrors.telef && (
                                    <div className="text-danger">{formErrors.telef}</div>
                                )}
                            </div>

                            <div className="row form-group">
                                <div className="col-md-12">
                                    <label className="text-black" htmlFor="message">Message</label>
                                    <textarea name="message" id="message" cols="30" rows="7" className="form-control" value={formData.message}
                                        onChange={handleInputChange} ></textarea>
                                </div>
                            </div>

                            <div className="row form-group">
                                <div className="col-md-12">
                                    <input type="submit" value="Send Message" className="btn btn-primary py-2 px-4 text-white" />
                                </div>
                            </div>


                        </form>
                    </div>
                    <div className="col-md-5">

                        <div className="p-4 mb-3 bg-white">
                            <p className="mb-0 font-weight-bold">Address</p>
                            <p className="mb-4">877 West 33 St, Hialeah Fl 33012, USA</p>

                            <p className="mb-0 font-weight-bold ">Phone</p>
                            <p className="mb-4"><Link to="#" className="text-custom">7864147790</Link></p>

                            <p className="mb-0 font-weight-bold">Email Address</p>
                            <p className="mb-0"><Link to="#" className="text-custom">info@ydhmlogistics.com</Link></p>

                        </div>

                       <div className="p-4 mb-3 bg-white">
                            {/* <h3 className="h5 text-black mb-3">More Info</h3>
                            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsa ad iure porro mollitia architecto hic consequuntur. Distinctio nisi perferendis dolore, ipsa consectetur? Fugiat quaerat eos qui, libero neque sed nulla.</p>
                            <p><a href="#" className="btn btn-primary px-4 py-2 text-white" >Learn More</a></p>
                                */}
                                <img src={new URL("../images/YDHMlogo-removebg-preview.png", import.meta.url).href} alt="" className="img-fluid" />
                                
                         </div>
                         <div className="p-4 mb-3 bg-white">
                            <h4>Join Us on the Journey:</h4>
                            <p>Partnering with YDHM Logistic Corp. means embarking on a journey of reliability, innovation, and success. Explore the possibilities with a logistics partner that not only understands the industry but redefines it.</p>
                            <p>Contact us today to discover how YDHM Logistic Corp. can elevate your logistics experience. Welcome to precision, welcome to excellence.</p>
                         </div>

                    </div>
                </div>
            </div>
        </div>
    )

}
export default Contact;
