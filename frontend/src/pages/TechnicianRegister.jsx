import { useState } from "react";
import axios from "axios";

const TechnicianRegister = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
  });

  const [credential, setCredential] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setCredential(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("specialization", formData.specialization);
    data.append("experience", formData.experience);
    data.append("credential", credential);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/technicians/register",
        data
      );

      alert(res.data.message);

    } catch (error) {
      console.log(error);
      alert("Registration Failed");
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2>Technician Registration</h2>

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="text"
          name="specialization"
          placeholder="Specialization"
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="text"
          name="experience"
          placeholder="Experience"
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="file"
          onChange={handleFileChange}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Register
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f4f4f4",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    width: "350px",
    padding: "20px",
    background: "white",
    borderRadius: "10px",
  },

  input: {
    marginBottom: "15px",
    padding: "10px",
  },

  button: {
    padding: "12px",
    background: "blue",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};

export default TechnicianRegister;