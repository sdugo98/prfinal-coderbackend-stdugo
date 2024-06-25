
const resFetch = document.getElementById("resFetch");
const stripe=Stripe("pk_test_51P32hmBY9ZWDmWHr6tz4CAhWaIxQEuw6ZC1uuhjT0B9IcN3AbZzWdV6wZKnq1fW91fUaMAqsIHJed9RPvqyYsKNu00UER7FhZD")
let elements
let ticketId
const cargarMediosPago=async()=>{
    importe=parseFloat(document.getElementById("importe").value)
    if(isNaN(importe || importe < 1)){
        resFetch.classList.remove('alert-danger', 'alert-success');
    
        let errorDiv = document.createElement('div');
        errorDiv.classList.add('alert', 'alert-danger');
        errorDiv.innerHTML = `COLOQUE UN IMPORTE CORRECTO`;
    
        resFetch.innerHTML = '';
        resFetch.appendChild(errorDiv);
        return
}
    importe=importe*100

    const respuesta=await fetch(`http://localhost:8080/pagos`, {
        method:"post",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({importe})
    })
    const datos=await respuesta.json()
    if(!datos.client_secret){
            resFetch.classList.remove('alert-danger', 'alert-success');
        
            let errorDiv = document.createElement('div');
            errorDiv.classList.add('alert', 'alert-danger');
            errorDiv.innerHTML = `VERIFIQUE EL IMPORTE COLOCADO - ANTE LA DUDA CONTACTE A UN ADMINISTRADOR`;
        
            resFetch.innerHTML = '';
            resFetch.appendChild(errorDiv);
            return
    }
    ticketId = datos.metadata.ticketId
    elements=stripe.elements({clientSecret:datos.client_secret})
    const paymentElements=elements.create("payment")
    paymentElements.mount("#mediosPago")
}

const pagar=async()=>{
    resultado=await stripe.confirmPayment(

        {
            elements,
            confirmParams:{
                return_url:`http://localhost:8080/purchase/${ticketId}`
            }
        }
    )

    resFetch.classList.remove('alert-danger', 'alert-success');
        
    let errorDiv = document.createElement('div');
    errorDiv.classList.add('alert', 'alert-danger');
    errorDiv.innerHTML = `${resultado.error.message}`;

    resFetch.innerHTML = '';
    resFetch.appendChild(errorDiv);
    return
}

const mostrarResultado=async(clientSecret)=>{
    const {paymentIntent} = await stripe.retrievePaymentIntent(clientSecret)
    document.getElementById("resultado").innerHTML=paymentIntent.status

}

const clientSecret=new URLSearchParams(window.location.search).get("payment_intent_client_secret")
if(clientSecret){
    mostrarResultado(clientSecret)
}
