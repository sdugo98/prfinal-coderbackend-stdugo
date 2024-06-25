const socket = io();
const divRegister = document.getElementById("registerMessage");
const inputMessage = document.getElementById("message");
const containerMessages = document.getElementById("messages-container");

Swal.fire({
  title: "Ingrese su correo electronico",
  input: "email",
  inputPlaceholder: "Ingrese su email aqui",
}).then((res) => {
  try {
    if (!res.value) {
      return null;
    }

    Swal.fire(`Entered email: ${res.value}`);
    socket.emit("correoDelUsuario", res.value);

    socket.on("conectUser", (newUser) => {
      Toastify({
        text: `Se conecto un nuevo usuario: ${newUser}`,
        duration: 3000,
      }).showToast();
    });

    divRegister.addEventListener("submit", (e) => {
      e.preventDefault();
      let message = inputMessage.value;

      if (message.trim().length === 0) {
        alert("Escriba un mensaje");
        return null;
      }
      socket.emit("message", { user: res.value, message: message });
      inputMessage.value = "";
    });

    socket.on("newMessage", (datos) => {
      let newMessage = document.createElement("p");
      newMessage.classList.add("alert", "alert-info", "message");
      newMessage.innerHTML = `<strong>${datos.user}:</strong>
      <p>${datos.message}</p><br>`;
      containerMessages.append(newMessage);
      containerMessages.scrollTop = containerMessages.scrollHeight;
    });
  } catch (error) {
    return res.status(500).json({ error: error.message});
  }
});
