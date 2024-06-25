document.addEventListener('DOMContentLoaded', function () {
    const resFetch = document.getElementById("resFetch");
    const adjuntarBtn = document.getElementById('adjuntarBtn');
    const identificacionInput = document.getElementById('identificacion');
    const domicilioInput = document.getElementById('domicilio');
    const statusCountInput = document.getElementById('statusCount');
    const uploadForm = document.getElementById('uploadForm');

    adjuntarBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (!identificacionInput.files.length || !domicilioInput.files.length || !statusCountInput.files.length) {
            let errorDiv = document.createElement('div');
            errorDiv.classList.add('alert', 'alert-danger');
            errorDiv.innerHTML = `COMPLETE TODOS LOS CAMPOS`;

            resFetch.innerHTML = '';
            resFetch.appendChild(errorDiv);
        } else {
            let userId = e.target.dataset.userId

            const formData = new FormData(uploadForm);

            fetch(`http://localhost:8080/api/users/${userId}/documents`, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {

            })
            .catch(error => {
                resFetch.innerHTML = 'Error al enviar la solicitud al servidor';
            });
        }
    });
});
