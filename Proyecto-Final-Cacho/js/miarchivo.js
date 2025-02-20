// Clase 14 - 3er Entrega de Proyecto - Carlos Cattaneo
"use strict"

//-- CLASE Espectaculo -------------------------------------------------

class Espectaculo {
  constructor(datosEspectaculo) {
    this.id = parseInt(datosEspectaculo.id);
    this.tipo = datosEspectaculo.tipo; // PELICULA, TEATRO, RECITAL
    this.nombre = datosEspectaculo.nombre;
    this.lugar = datosEspectaculo.lugar;
    this.precio = parseFloat(datosEspectaculo.precio);
    this.stockEntradas = parseInt(datosEspectaculo.stockEntradas);
    this.imagen = datosEspectaculo.imagen;
    this.entradasVendidas = 0;
  }

  set actualizarEntradas(cantidad) {
    this.stockEntradas -= cantidad;
    this.entradasVendidas += cantidad;
    return true;
  }

  get obtenerStock() {
    return this.stockEntradas;
  }

  comprarEntradas(cantidad) {
    this.actualizarEntradas = cantidad;
  }

  devolverEntradas(cantidad) {
    this.actualizarEntradas = -cantidad;
  }
}

//-- CLASE Elementos de carrito --------------------------

class ItemCarrito {
  constructor(nuevoItem) {
    this.id = nuevoItem.id;
    this.tipo = nuevoItem.tipo;
    this.nombre = nuevoItem.nombre;
    this.precio = nuevoItem.precio;
    this.lugar = nuevoItem.lugar;
    this.cantidad = nuevoItem.cantidad;
    this.imagen = nuevoItem.imagen;
  }
}

//-- FUNCIONES --------------------------------------------------------

const imprimirBotonesPagoCarrito = (espectaculos, carrito) => {
  const total = calcularTotal(carrito);
  $('#boton-pago').append(`<div class="pagos-container"><h5 class="carrito-total text-center">El total a pagar es de: $${total}.</h5>
                              <div><button id="idButtonPagoCarrito" class="btn btn-success">Finalizar Compra</button>
                              <button id="idButtonVaciarCarrito" class="btn btn-danger">Vaciar Carrito</button><div><div>`
  );
  $("#idButtonPagoCarrito").click(() => { finalizarCompra(espectaculos, carrito) });
  $("#idButtonVaciarCarrito").click(() => { vaciarCarrito(espectaculos, carrito) });
}

const eliminarBotonesPagoCarrito = () => {
  $('#boton-pago').empty();
}

const actualizarCantidadDisponible = (espectaculo) => {
  // Busca el input de cantidad y lo asigna al maximo posible a comprar
  const idTarjetaEspectaculo = `${espectaculo.id}_cantidad`;
  // Se actualiza el maximo, y se reinicia el number box a 0
  $(`#${idTarjetaEspectaculo}`)
    .attr({ 'max': espectaculo.obtenerStock })
    .val('0');

  console.log("llegue 23.1");
  if (espectaculo.obtenerStock === 0) {
    console.log("llegue 23.2");
    // Busca el boton, le agrega el texto y la funcionalidad para el click
    const idTarjetaEspectaculo = `espectaculo_${espectaculo.id}`;
    const idButtonTarjetaEspectaculo = `button_${idTarjetaEspectaculo}`;
    $(`#${idButtonTarjetaEspectaculo}`)
      .text('Stock no disponible')
      .attr('class', 'btn btn-danger')
      // .removeClass()
      // .addClass('btn btn-danger')
      .click(() => { mostrarMensajeEnModal("No se pueden agregar más entradas al carrito.", true) });
  }
}

const agregarAlCarrito = (espectaculo, carrito) => {
  const idTarjetaEspectaculo = `${espectaculo.id}_cantidad`;  // Con los datos de mi espectaculo, creo el nombre del id a buscar.

  if ($(`#${idTarjetaEspectaculo}`)) {        // Si esta en el HTML
    const cantEntradas = parseInt($(`#${idTarjetaEspectaculo}`).val()); // Obtiene la cantidad ingresada en el input del number box
    if (cantEntradas && cantEntradas > 0 && cantEntradas <= espectaculo.obtenerStock) {   // Validar que la cantidad sea menor al stock de entradas disponible
      let pos = carrito.findIndex(elemento => elemento.id === espectaculo.id);   // Busco posicion del elemento en "carrito" (si no existe devuelve -1)
      if (pos >= 0) {             // Si existe le sumo la cantidad, sino lo creo y agrego al carrito
        carrito[pos].cantidad = carrito[pos].cantidad + cantEntradas;
      } else {
        const item = new ItemCarrito({
          id: espectaculo.id,
          tipo: espectaculo.tipo,
          nombre: espectaculo.nombre,
          precio: espectaculo.precio,
          lugar: espectaculo.lugar,
          imagen: espectaculo.imagen,
          cantidad: cantEntradas,
        });
        carrito.push(item);
      }
      espectaculo.comprarEntradas(cantEntradas);  // Descuento las entradas disponibles en listaDeEspectaculos
      actualizarCantidadDisponible(espectaculo);  // actualiza la UI
      mostrarMensajeEnModal(`Se agregaron ${cantEntradas} entradas para "${espectaculo.nombre}" al carrito`);
    } else if (cantEntradas === 0) {
      mostrarMensajeEnModal("Por favor seleccione la cantidad de entradas", true);
    } else if (cantEntradas > espectaculo.obtenerStock) {
      mostrarMensajeEnModal(`Superó el número de entradas disponibles. Para ${espectaculo.nombre} quedan ${espectaculo.obtenerStock} entradas.`, true);
    }
  }
}

const calcularTotal = (carrito) => {
  let total = 0;
  carrito.forEach(item => { total += (item.cantidad * item.precio) });
  return total;
}

const eliminarItemsCarrito = (carrito) => {
  while (carrito.length > 0) { carrito.pop() };
}


const vaciarCarrito = (espectaculos, carrito) => {
  // Devuelvo el stock de entradas del carrito a la lista de espectaculos
  carrito.forEach((item, i) => {
    let pos = espectaculos.findIndex(elemento => elemento.id === item.id); // Busco posicion del elemento en "espectaculos"
    espectaculos[pos].devolverEntradas(item.cantidad);                    // Se actualiza el stock de entradas para el espectaculo correspondiente
  });
  eliminarItemsCarrito(carrito);                                // Saco el item del carrito
  imprimirTarjetasFiltradas(espectaculos, "CARRITO", carrito);  // Llama de nuevo a imprimir pantalla carrito
}


const actualizarTotalPago = (espectaculos, carrito) => {
  eliminarBotonesPagoCarrito();
  imprimirBotonesPagoCarrito(espectaculos, carrito);

}

const eliminarDelCarrito = (espectaculos, carrito, itemCarrito) => {
  const pos = carrito.findIndex(elemento => elemento.id === itemCarrito.id);  // Busco posición del elemento en el carrito
  const posEspectaculo = espectaculos.findIndex(elemento => elemento.id === itemCarrito.id);  // Busco posición del elemento en la lista de espectaculos
  espectaculos[posEspectaculo].devolverEntradas(carrito[pos].cantidad); // Actualizar cantidad de entradas
  carrito.splice(pos, 1);   // Elimina el elemento del carrito
  eliminarLaTarjeta(itemCarrito);
  mostrarMensajeEnModal(`${itemCarrito.nombre} fue eliminado del carrito`, true);
  if (carrito.length === 0) {
    imprimirTarjetasFiltradas(espectaculos, "CARRITO", carrito)
  } else {
    actualizarTotalPago(espectaculos, carrito);
  };
}

const agregarCompraAStorage = (carrito) => {
  // Guardar carrito en storage como una lista de listas
  if (localStorage.getItem("compras")) {
    let comprasStorage = JSON.parse(localStorage.getItem("compras"));
    comprasStorage.push(carrito);
    localStorage.setItem("compras", JSON.stringify(comprasStorage));
  } else {
    const listaDeCompras = [carrito];
    localStorage.setItem("compras", JSON.stringify(listaDeCompras));
  }
}

const finalizarCompra = (espectaculos, carrito) => {
  agregarCompraAStorage(carrito);   // Guardar compra en lista de compras en Storage
  eliminarItemsCarrito(carrito);
  eliminarTarjetas();
  eliminarBotonesPagoCarrito();
  localStorage.setItem("espectaculos", JSON.stringify(espectaculos));   // Actualizo los espectaculos en el Storage
  mostrarMensajeEnModal("Se realizó el pago. Gracias por su compra.");  // Mensaje de pago.
  imprimirTarjetasFiltradas(espectaculos, "CARRITO", carrito);
}

// Realiza la busqueda ingresa, y dependiendo el resultado imprime el mensaje correspondiente y en caso de encontrar coincidencias, las cards.
const buscador = (espectaculos, carrito, busqueda) => {
  $('#cardsId').addClass('search');
  let mensajeDeBusqueda = '';
  if (busqueda.trim() === '') {
    mensajeDeBusqueda = 'Error en la búsqueda: solo ingresó espacios.';
  } else {
    const listaResultados = espectaculos.filter(espectaculo => espectaculo.nombre.toLowerCase().includes(`${busqueda.trim().toLowerCase()}`));
    if (listaResultados.length === 0) {
      mensajeDeBusqueda = `No se encontró ningún espectáculo que incluya "${busqueda}" en su nombre.`;
    } else {
      mensajeDeBusqueda = `Resultado de la busqueda "${busqueda}":`;
      listaResultados.forEach(espectaculo => {
        imprimirTarjeta(espectaculo, carrito);
      });
      fadeInTarjetas();
    }
  }
  mostrarMensaje(mensajeDeBusqueda);
}

const fadeInTarjetas = () => {
  $('#cardsId').fadeIn(1000);
}


// Funcion que recibe un elemento del arreglo recibido del Storage y crea una instancia de la clase Espectaculo
const crearEspectaculo = (element) => {
  const espectaculo = new Espectaculo({
    id: element.id,
    tipo: element.tipo,
    nombre: element.nombre,
    lugar: element.lugar,
    precio: element.precio,
    stockEntradas: element.stockEntradas,
    imagen: element.imagen,
    entradasVendidas: element.entradasVendidas,
  });
  return espectaculo;
}

const convertirEspectaculosStorage = (listaStorage, listaConvertida) => {
  // Se convierte espectaculosStorage en una lista con objetos de la clase Espectaculo (espectaculosStorageConvertidos)
  listaStorage.forEach(element => {
    const espectaculo = crearEspectaculo(element);
    listaConvertida.push(espectaculo);
  });
}

const llamarJsonYAlmacenarEnStorage = () => {
  // Si key "espectaculos" existe en el localStorage, no se hace nada, sino se traen los espectaculos del JSON y se guardan en el localStorage
  if (!localStorage.key("espectaculos")) {
    // Se declara la URL del archivo JSON local
    const URLJSON = "json/espectaculos.json";
    // Se pide la información almacenada en el JSON
    $.getJSON(URLJSON, function (respuesta, estado) {
      if (estado === "success") {
        const listaDeEspectaculos = respuesta;
        console.log(listaDeEspectaculos);
        // Se guarda en el sessionStorage (con key espectaculos) el arreglo traido desde el archivo JSON
        localStorage.setItem("espectaculos", JSON.stringify(listaDeEspectaculos));
      }
    });
  }
}

//-- VARIABLES ----------------------------------------------------------

// Arreglo para carrito
let listaDeCarrito = [];

const arregloMenu = [
  { tipo: "PELICULA", texto: "CINE" },
  { tipo: "RECITAL", texto: "RECITALES" },
  { tipo: "TEATRO", texto: "TEATRO" },
];

// Arreglo de espectaculos convertidos del Storage
const espectaculosStorageConvertidos = [];

// Arreglo desde Storage sin formato de clase Espectaculo
let espectaculosStorage = [];

// Boton en logo lleva a inicio
$("#botonLogo").click(() => {
  imprimirTarjetasFiltradas(espectaculosStorageConvertidos, "INICIO", listaDeCarrito)
});


//-- PROGRAMA PRINCIPAL ----------------------------------------------------------

//-- CARGAR DE ARCHIVO JSON, GUARDAR EN STORAGE Y CARGAR DE STORAGE --
llamarJsonYAlmacenarEnStorage();

$(document).ready(() => {
  // Se trae la lista de espectaculos del Storage
  espectaculosStorage = JSON.parse(localStorage.getItem("espectaculos"));

  // Se convierte espectaculosStorage a un array de objetos Espectaculo
  convertirEspectaculosStorage(espectaculosStorage, espectaculosStorageConvertidos);

  //-- CREAR SECCIONES DE LA PAGINA --

  // Crea el menú del NavBar de HTML
  crearMenuNavBar(arregloMenu, espectaculosStorageConvertidos, listaDeCarrito);
  crearCarousel();    // Crea el carousel
  crearFormulario();  // Crea el formulario
  // Imprimir todas las Cards utilizando espectaculosStorageConvertidos
  imprimirTarjetasFiltradas(espectaculosStorageConvertidos, "INICIO", listaDeCarrito)

});