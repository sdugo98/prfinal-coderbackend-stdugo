const socket = io();
const resFetch = document.getElementById("resFetch");
const formAdd = document.getElementById("addProductForm");
const errorAdmin = document.getElementById('resError')

formAdd.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dataForm = new FormData(formAdd);

  try {
    const response = await fetch("http://localhost:8080/api/products", {
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

      resFetch.innerHTML = `Producto Agregado`;
      formAdd.reset();
    }
  } catch (error) {

    resFetch.classList.remove('alert-danger', 'alert-success');

    let errorDiv = document.createElement('div');
    errorDiv.classList.add('alert', 'alert-danger');
    errorDiv.innerHTML = 'NO TIENES PRIVILEGIOS';

    resFetch.innerHTML = '';
    resFetch.appendChild(errorDiv);
  }
});

socket.on("listProduct", (products) => {
  let containerProd = document.getElementById("container-products");
  containerProd.innerHTML = "";

  products.docs.forEach((product) => {
    const listMod = `
    <div class="card">
      <div class="card-body">
        <h4 class="card-title">${product.title}</h4>
        <p class="card-text">code: ${product.code} ID: ${product.id}</p>
        <p class="card-title">Precio: ${product.price} </p>
      </div>
      <a href="/api/products/${product._id}" class="btn btn-detail">Ver detalle</a>
      <button class="btn btn-success mt-2 btnAddToCart" data-product-id="${product._id}">Agregar Al carrito</button>
    </div>
  `;
    containerProd.innerHTML += listMod;
  });
});

const deleteForm = document.getElementById("deleteProductForm");

deleteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let deleteID = document.getElementById("deleteID").value;

  try {
    fetch(`http://localhost:8080/api/products/${deleteID}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {

        resFetch.classList.remove('alert-danger', 'alert-success');

        if (data.error) {
          let errorDiv = document.createElement('div');
          errorDiv.classList.add('alert', 'alert-danger');
          errorDiv.innerHTML = `${data.error}`;

          resFetch.innerHTML = ''
          resFetch.appendChild(errorDiv);
        } else {
          resFetch.classList.add('alert', 'alert-success');

          resFetch.innerHTML = `<p>Producto Eliminado</p>`;
        }
      })
      .catch((error) => {

        resFetch.classList.remove('alert-danger', 'alert-success');

        let errorDiv = document.createElement('div');
        errorDiv.classList.add('alert', 'alert-danger');
        errorDiv.innerHTML = `${error}`;

        resFetch.innerHTML = '';
        resFetch.appendChild(errorDiv);
      });
  } catch (error) {

    resFetch.classList.remove('alert-danger', 'alert-success');

    let errorDiv = document.createElement('div');
    errorDiv.classList.add('alert', 'alert-danger');
    errorDiv.innerHTML = `${error}`;

    resFetch.innerHTML = '';
    resFetch.appendChild(errorDiv);
  }
});

document.addEventListener('DOMContentLoaded', function () {

  const btnsAddToCart = document.querySelectorAll(".btnAddToCart");

  [...btnsAddToCart].forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault()
      let productId = e.target.dataset.productId;
      const elementCart = document.querySelector('#cartUser');
      const cid = elementCart.getAttribute('cart');
      if (cid) {
        try {
          const response = await fetch(`http://localhost:8080/api/carts/${cid}/product/${productId}`, {
            method: "POST",
          });
      
          const data = await response.json();
      
          resFetch.classList.remove('alert-danger', 'alert-success');
      
          if (data.error) {
            let errorDiv = document.createElement('div');
            errorDiv.classList.add('alert', 'alert-danger');
            errorDiv.innerHTML = `${data.error}`;
      
            errorAdmin.innerHTML = '';
            errorAdmin.appendChild(errorDiv);
          } else {
            Toastify({
              text: `SE AGREGO UN PRODUCTO AL CARRITO CON ID: ${cid}`,
              duration: 3000,
            }).showToast();
          }
        } catch (error) {
          let errorDiv = document.createElement('div');
          errorDiv.classList.add('alert', 'alert-danger');
          errorDiv.innerHTML = `Error: ${error}`;
          errorAdmin.innerHTML = '';
          errorAdmin.appendChild(errorDiv);        
        }
      } else {
        let errorDiv = document.createElement('div');
        errorDiv.classList.add('alert', 'alert-danger');
        errorDiv.innerHTML = `NO PUEDES AGREGAR. ERES ADMINISTRADOR`;
  
        errorAdmin.innerHTML = '';
        errorAdmin.appendChild(errorDiv);
      }
      
  });
});})
