import { Link } from "react-router-dom";

function Navbar(){

return(

<nav>

<Link to="/">Home</Link>

{" | "}

<Link to="/admin">Admin</Link>

{" | "}

<Link to="/user">User</Link>

{" | "}

<Link to="/technician">Technician</Link>

</nav>

)

}

export default Navbar