
// ------------- Variables que vamos a utilizar ------------
const API_PRODUCTS = './db/productos.json';
let inventarioDb =[];
const stock = [];
let carrito = [];
const search = "";
const inputs = document.querySelectorAll('input');
const barraSearch = inputs[0];
const btnSearch = document.querySelector('#btnSearch');
const checks = document.querySelectorAll('input.check');
const cardContainer = document.querySelector('#cardContainer');
const btnFinalizarCompra = document.querySelector('#btnFinalizarCompra');
const btnVaciar = document.querySelector('#btnVaciar');
let carritoContainer = document.querySelector('#carritoContainer');
const loader = document.querySelector('.loader');
const cartToggleBtn = document.getElementById('cart-toggle-btn');//seleccionar el toggle


//----------------- Funciones -----------------------

//Obtenemos la informacion a traves de un archivo JSON externo a nuestro archivo Js , utilizando fecth.

const getData = async (url)=> {
    try {
        const response = await fetch(url);
        const data = await response.json();
        inventarioDb = data;
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

// Llamamos a la función getData y utilizamos .then() para manejar la promesa

getData(API_PRODUCTS)
    .then(() => {
        //Cargamos el stock en el inventario
        cargaStock(inventarioDb);
    });


// Función que carga el inventario al stock

function cargaStock(arr) {
    for (const el of arr) {
        stock.push(el);
    }
}

// Función de búsqueda por filtrado genérica

function filtrar(arr, filtro, param) {
    return arr.filter((el) => {
        if (param == "precio") {
            return el.precio <= parseFloat(filtro);
        } else {
            return el[`${param}`].includes(filtro);
        }
    });
}

//funcion de busqueda

function busqueda(arr, filtro) {
    const encontrado = arr.find((el) => {
        return el.nombre.includes(filtro);
    });
    return encontrado;
}

//funcion que mantenga la primer letra en mayuscula y sea mas facil coincidir con la busqueda

function inicioMayus(palabra) {
    palabra = palabra.toLowerCase();

    inicial = palabra[0].toUpperCase();
    resto = palabra.slice(1);

    palabraFinal = inicial + resto;

    return palabraFinal;
}

// Función constructora de cards

function crearCard(arr) {
    cardContainer.innerHTML = "";
    if (Array.isArray(arr)) {
        arr.forEach(el => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
            <div class="card">
            <img src="${el.img}" alt="${el.nombre}" class="card-img">
            <div class="card-body">
                <h3 class="card-title">${el.nombre}</h3>
                <p class="card-text">${el.marca}</p>
                <div class="card-footer">
                    <span class="price">$${el.precio}</span>
                    <button class="btn btnAgregar" data-id="${el.id}">Agregar</button>
                </div>
            </div>
        </div>
            `;
            cardContainer.appendChild(card);
        });
    } else {
        console.error("El argumento dado no es un array.");
    }
}

//Funcion para que guarde los datos en el local Storage

function guardarLS(key, prod) {
    localStorage.setItem(key, JSON.stringify(prod));
}

// para que siga apareciendo la info del carrito desde el Local Storage cuando se cargue la pagina

window.addEventListener('DOMContentLoaded', () => {
    let carritoLS = JSON.parse(localStorage.getItem('carrito'));
    if (carritoLS) {
        carrito = carritoLS;
        actualizarCarrito();
    }
});

//funcion que determina si corresponde el valor de envio o no

const costoEnvio = (total) => {
    return total >= 300000 ? 0 : 8000;
};

//Funcion que totalice el carrito

function totalizar(arr) {
    const total = arr.reduce((acc, el) => acc + (el.precio * el.cantidad), 0);
    return total + costoEnvio(total);
}

// Función para actualizar la vista del carrito

function actualizarCarrito() {
    carritoContainer.innerHTML = '';
    if (carrito.length === 0) {
        const carritoVacio = document.createElement('p');
        carritoVacio.textContent = 'Tu carrito está vacío.';
        carritoContainer.appendChild(carritoVacio);
    } else {
        carrito.forEach(producto => {
            const productItem = document.createElement('div');
            productItem.classList.add('carrito-item');
            productItem.innerHTML = `
            <div class="cart-item">
            <img src="${producto.img}" alt="${producto.nombre}" class="cart-item-img">
            <div class="cart-item-details">
                <h4 class="cart-item-title">${producto.nombre}</h4>
                <p class="cart-item-price">$${producto.precio}</p>
                <p class="cart-item-count">cantidad: ${producto.cantidad} </p>
                <div class="cart-item-actions">
                    <button class="btn btn-remove btnEliminar" data-id="${producto.id}">Eliminar</button>
                </div>
            </div>
        </div>
            `;
            carritoContainer.appendChild(productItem);
        });
    }
}

// agregar los productos al carrito

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('btnAgregar')) {
        const productId = event.target.getAttribute('data-id');
        const productToAdd = stock.find(product => product.id === parseInt(productId));

        Toastify({
            text: "Agregaste 1 producto",
            duration: 2000,
            newWindow: true,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
              background: "linear-gradient(to right, #090979, #00ffd0)",
            },
          }).showToast();

        if (productToAdd) {
            const existingProductIndex = carrito.findIndex(product => product.id === parseInt(productId));
            if (existingProductIndex !== -1) {
                carrito[existingProductIndex].cantidad++;
                guardarLS('carrito', carrito);
                actualizarCarrito();
            } else {
                productToAdd.cantidad = 1;
                carrito.push(productToAdd);
                guardarLS('carrito', carrito);
                actualizarCarrito();
            }
        }
    }
});

//Finalizar la compra

btnFinalizarCompra.addEventListener('click', () => {
    if (carrito.length === 0) {
        Swal.fire({
            text:"El carrito esta vacio",
            icon:"info" ,
            iconColor:"#ffa",
            width: 300,
            height:150,
            padding: "1em",
            color: "#ffa",
            background:"#716aeb",
            confirmButtonColor: "#a0fc45",
        });
    } else {
        //mostramos un mensaje con sweet para la confirmacion de la compra.
        Swal.fire({
            title: "¿Desea Finalizar la compra?",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            denyButtonText: `Continuar comprando`,
            confirmButtonColor: "#a0fc45",
            cancelButtonColor: "#fd501d",
            color: "#ffa",
            background:"#716aeb",
          }).then((result) => {
            if (result.isConfirmed) {
                const totalCompra = totalizar(carrito);
                Swal.fire({
                title: `El total de tu compra es: $${totalCompra}`,
                icon:"success",
                iconColor:"#ffa",
                color: "#ffa",
                confirmButtonColor: "#a0fc45",
                background:"#716aeb",
                confirmButtonColor: "#a0fc45",
                }).then(()=> {
                    if (costoEnvio(totalCompra) === 0) {
                        Swal.fire({
                        text:"¡Tenes envío gratis!",
                        iconColor:"#ffa",
                        width: 300,
                        height:150,
                        padding: "2em",
                        color: "#ffa",
                        background:"#716aeb",
                        confirmButtonColor: "#a0fc45",
                    })
                }
                carrito = [];
                limpiarLocalStorage();
                actualizarCarrito();
              });
            }
          });
        }

    });

//Eliminamos lo almacenado.

function limpiarLocalStorage() {
    localStorage.removeItem('carrito');
    carritoContainer.innerHTML = '';
}

//Para eliminar productos individuales del carrito

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('btnEliminar')) {
        const productId = event.target.getAttribute('data-id');
        eliminarProducto(parseInt(productId));
    }
});

//Vaciar el carrito

btnVaciar.addEventListener('click', () => {
    if (carrito.length === 0) {
        Swal.fire({
            text:"El carrito esta vacio",
            icon:"info" ,
            iconColor:"#ffa",
            width: 300,
            height:150,
            padding: "1em",
            color: "#ffa",
            background:"#716aeb",
            confirmButtonColor: "#a0fc45",
        });
    } else {
        Swal.fire({
            text: "¿Esta seguro de vaciar el carrito?",
            icon: "warning",
            showCancelButton: true,
            color: "#ffa",
            background:"#716aeb",
            confirmButtonColor: "#a0fc45",
            cancelButtonColor: "#fd501d",
            confirmButtonText: "Vaciar"
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                text: "Se vacio el carrito",
                icon: "success",
                iconColor:"#ffa",
                color: "#ffa",
                background:"#716aeb",
                confirmButtonColor: "#a0fc45",
              });
                //segun el resultado del pop-up , vaciamos y actualizamos la vista del carrito.
                carrito.length = 0;
                localStorage.setItem('carrito', JSON.stringify(carrito));
                actualizarCarrito();
    
            }
        });
    }
});

//Funcion que elimina productos del carrito
function eliminarProducto(id) {
    const index = carrito.findIndex(producto => producto.id === id);
    if (index !== -1) {
        carrito.splice(index, 1);
        localStorage.setItem('carrito', JSON.stringify(carrito));

        //muestra un toast que remarca la eliminacion del producto.
        Toastify({
            text: "Eliminaste el producto",
            duration: 2000,
            newWindow: true,
            close: true,
            gravity: "bottom",
            position: "right",
            stopOnFocus: true,
            style: {
              background: "linear-gradient(to left, #833ab4, #fd1d1d,#fcb045)",
            },
          }).showToast();

          //actualiza la vista del carrito
        actualizarCarrito();
    }
}

//Para poder utilizar filtro al buscar.

// Event listener para el botón de búsqueda
btnSearch.addEventListener('click', () => {
    realizarBusqueda();
});

// Event listener para realizar la búsqueda cuando se presiona "Enter"
barraSearch.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        realizarBusqueda();
    }
});

// Función para realizar la búsqueda


function realizarBusqueda() {
    // Mostrar el loader antes de realizar la búsqueda
    loader.classList.remove('none');

    // Simular una pequeña demora antes de iniciar la búsqueda
    setTimeout(() => {
        // Obtener el valor del campo de búsqueda
        const textModif = inicioMayus(barraSearch.value);
        
        // Obtener el valor del radio input seleccionado
        const valueSearch = Array.from(checks).find(check => check.checked)?.value;
        
        // Filtrar los productos en función del término de búsqueda y del radio input seleccionado
        const filtros = filtrar(stock, textModif, valueSearch);
        
        // Mostrar las cartas después de que se haya completado la búsqueda
        crearCard(filtros);
        
        // Ocultar el loader después de que se hayan mostrado las cartas
        loader.classList.add('none');
    }, 500);
}


//evento de clic al botón para abrir y cerrar el carrito

cartToggleBtn.addEventListener('click', () => {
   //alternar la clase 'hidden' para que se vea o oculte el carrito
    carritoContainer.classList.toggle('hidden');

    // Si el carrito se esta viendo, mostramos los botones, caso contrario se ocultan
    if (!carritoContainer.classList.contains('hidden')) {
        btnFinalizarCompra.style.display = 'block';
        btnVaciar.style.display = 'block';
    } else {
        btnFinalizarCompra.style.display = 'none';
        btnVaciar.style.display = 'none';
    }
});





