import { useState } from "react";
const technicians = [
  {
    id: 1,
    name: "John Smith",
    service: "AC Repair",
    experience: 5,
    location: "Kathmandu",
  },
  {
    id: 2,
    name: "Michael Lee",
    service: "TV Repair",
    experience: 3,
    location: "Pokhara",
  },
  {
    id: 3,
    name: "David Wilson",
    service: "Refrigerator Repair",
    experience: 7,
    location: "Kathmandu",
  },
  {
    id: 4,
    name: "Robert Brown",
    service: "Washing Machine Repair",
    experience: 4,
    location: "Butwal",
  },
];

function TechnicianSearchFilter() {
  const [search, setSearch] = useState("");
  const [service, setService] = useState("");

  const filteredTechnicians = technicians.filter(
    (tech) =>
      tech.name.toLowerCase().includes(search.toLowerCase()) &&
      (service === "" || tech.service === service)
  );

  return (
    <div className="container">
      <h2>Find a Technician</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Search technician..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
        >
          <option value="">All Services</option>
          <option value="AC Repair">AC Repair</option>
          <option value="TV Repair">TV Repair</option>
          <option value="Refrigerator Repair">Refrigerator Repair</option>
          <option value="Washing Machine Repair">
            Washing Machine Repair
          </option>
        </select>
      </div>

      <div className="technician-list">
        {filteredTechnicians.map((tech) => (
          <div className="card" key={tech.id}>
            <h3>{tech.name}</h3>
            <p>Service: {tech.service}</p>
            <p>Experience: {tech.experience} Years</p>
            <p>Location: {tech.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TechnicianSearchFilter;
