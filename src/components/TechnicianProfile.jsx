import { useState } from "react"
import "./TechnicianProfile.css"

function TechnicianProfile() {

  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    email: "",
    skills: "",
    experience: "",
    area: "",
    about: "",
  })

  const [image, setImage] = useState(null)

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    })
  }

  const handleImage = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    console.log(profile)

    alert("Technician Profile Submitted")
  }

  return (
    <div className="container">

      <form className="profile-form" onSubmit={handleSubmit}>

        <h1>Technician Profile Setup</h1>

        <div className="image-section">
          {
            image && (
              <img src={image} alt="preview" className="preview-image" />
            )
          }

          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
          />
        </div>

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={profile.fullName}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={profile.phone}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={profile.email}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="skills"
          placeholder="Skills (TV Repair, AC Repair)"
          value={profile.skills}
          onChange={handleChange}
        />

        <input
          type="number"
          name="experience"
          placeholder="Years of Experience"
          value={profile.experience}
          onChange={handleChange}
        />

        <input
          type="text"
          name="area"
          placeholder="Service Area"
          value={profile.area}
          onChange={handleChange}
        />

        <textarea
          name="about"
          placeholder="About Technician"
          rows="5"
          value={profile.about}
          onChange={handleChange}
        ></textarea>

        <button type="submit">
          Save Profile
        </button>

      </form>

    </div>
  )
}

export default TechnicianProfile