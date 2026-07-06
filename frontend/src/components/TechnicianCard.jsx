function TechnicianCard({tech}){

return(

<div className="card">

<h2>{tech.name}</h2>

<p><b>Service:</b> {tech.service}</p>

<p><b>Location:</b> {tech.location}</p>

<p><b>Phone:</b> {tech.phone}</p>

<button>Book Now</button>

</div>

)

}

export default TechnicianCard