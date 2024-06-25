document.addEventListener('DOMContentLoaded', function () {

const btnAddToCart = document.getElementById("btnAddToCart");
btnAddToCart.addEventListener("click", async (e) => {
          let productId = e.target.dataset.productId;
          const elementCart = document.getElementById('cartUser');
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
          
                resFetch.innerHTML = '';
                resFetch.appendChild(errorDiv);
              } else {
                Toastify({
                  text: `SE AGREGO UN PRODUCTO AL CARRITO CON ID: ${cid}`,
                  duration: 3000,
                }).showToast();
              }
            } catch (error) {
            }
          } else {
            let errorDiv = document.createElement('div');
            errorDiv.classList.add('alert', 'alert-danger');
            errorDiv.innerHTML = `NO PUEDES AGREGAR. ERES ADMINISTRADOR`;
      
            resFetch.innerHTML = '';
            resFetch.appendChild(errorDiv);
          }
          
      });
    })