const changeRolForm = document.getElementById('changeRolForm')
const resFetch = document.getElementById("resFetch");

changeRolForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const dataForm = new FormData(changeRolForm);
  
    try {
      const response = await fetch("http://localhost:8080/api/users/premiun", {
        method: "POST",
        body: dataForm,
      });
  
      const data = await response.json();

  
      resFetch.classList.remove('alert-danger', 'alert-success');
  
      if (data.error) {
        let errorDiv = document.createElement('div');
        errorDiv.classList.add('alert', 'alert-danger');
        errorDiv.innerHTML = `${data.error}`;
  
        resFetch.innerHTML = '';
        resFetch.appendChild(errorDiv);
      } else {
  
        resFetch.classList.add('alert', 'alert-success');
  
        resFetch.innerHTML = `CAMBIO DE ROL EXITOSO`;
        changeRolForm.reset();
        setTimeout(() => {
          window.location.href = 'http://localhost:8080/api/sessions/logout'
        }, "1000");
      }
    } catch (error) {
  
      resFetch.classList.remove('alert-danger', 'alert-success');
  
      let errorDiv = document.createElement('div');
      errorDiv.classList.add('alert', 'alert-danger');
      errorDiv.innerHTML = 'ERROR AL CAMBIAR ROL';
  
      resFetch.innerHTML = '';
      resFetch.appendChild(errorDiv);
    }
  });
  