document.getElementById("techForm").addEventListener("submit", function(e) {
  e.preventDefault();

  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let phone = document.getElementById("phone").value;
  let specialization = document.getElementById("specialization").value;
  let experience = document.getElementById("experience").value;
  let idProof = document.getElementById("idProof").files[0];
  let certificate = document.getElementById("certificate").files[0];

  // Basic validation
  if (!idProof || !certificate) {
    alert("Please upload required documents!");
    return;
  }

  if (experience < 0) {
    alert("Invalid experience!");
    return;
  }

  // Simulate upload (frontend only)
  console.log("Technician Registered:");
  console.log({
    name, email, phone, specialization, experience,
    idProof: idProof.name,
    certificate: certificate.name
  });

  document.getElementById("message").innerText = "Registration Successful!";
  
  // Reset form
  document.getElementById("techForm").reset();
});