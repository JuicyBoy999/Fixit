import TechnicianCard from "../components/TechnicianCard";
import technicians from "../data/technicians";

function Technician(){

return(

<div>

<h1>Technician Directory</h1>

{
technicians.map((tech)=>(
<TechnicianCard key={tech.id} tech={tech}/>
))
}

</div>

)

}

export default Technician