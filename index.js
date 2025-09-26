const express= require ('express');
const app = express();
const cors = require ('cors');
app.use (cors());
app.use(express.json());

const db= require ('./connection');


// Insertar clientes 

app.post("/api/clientes/insertar", async (req, res) => {
    const { nombreEmpresa, impresion, razonSocial, rfc, email, telefono,  regimen, cfdi, estado, colonia, cp, calle, numeroExterior, numeroInterior } = req.body;
    try {
        const clienteinsertado = await db.query(
            "INSERT INTO clientes (nombre_empresa, impresion, razon_social, rfc, email, telefono, regimen, cfdi, estado, colonia, cp, calle, num_ext, num_int) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *",
            [nombreEmpresa, impresion, razonSocial, rfc, email, telefono, regimen, cfdi, estado, colonia, cp, calle, numeroExterior, numeroInterior]
        );
        res.json(clienteinsertado.rows);
    } catch (error) {
        console.error("Error al insertar cliente:", error);
        res.send("Error en el servidor");
    }
});

//Insertar productos 

app.post("/api/productos/insertar", async (req, res) => {
    const { identificador, grabado, num_cliente, materialesClave, suajesNumsuaje, clave, fecha, descripcion, tipo, producto, guia, anchoInt, largoInt, altoInt, ceja, anchoCarton, largoCarton, marcas, pegado, tipoCarton, imagenFinal, imagenGrabado } = req.body;
    try {
        const productoinsertado = await db.query(
            "INSERT INTO productos (identificador, grabado, clientes_num_cliente, materiales_clave, suajes_num_suaje, clave, fecha, descripcion, tipo, producto, guia, ancho_int, largo_int, alto_int, ceja, ancho_carton, largo_carton, marcas, pegado, tipo_carton, imagen_final, imagen_grabado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,$13, $14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING *",
            [identificador, grabado, num_cliente, materialesClave, suajesNumsuaje, clave, fecha, descripcion, tipo, producto, guia, anchoInt, largoInt, altoInt, ceja, anchoCarton, largoCarton, marcas, pegado, tipoCarton, imagenFinal, imagenGrabado]
        );
        res.json(productoinsertado.rows);
    } catch (error) {
        console.error("Error al insertar producto:", error);
        res.send("Error en el servidor");
    }
});

//Insertar pedidos 

app.post("/api/pedidos/insertar", async (req, res) => {
    const { noPedido, ordenCompraId, clientesNumcliente, productosIdentificador, fecha, observaciones, banco, anticipo, saldo, iva, cantidad, total, noCheque, precioUnitario, importe  } = req.body;
    try {
        const pedidoinsertado = await db.query(
            "INSERT INTO pedidos (no_pedido, orden_compra_id, clientes_num_cliente, productos_identificador, fecha, observaciones, banco, anticipo, saldo, iva, cantidad, total, no_cheque, precio_unitario, importe) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *",
            [noPedido, ordenCompraId, clientesNumcliente, productosIdentificador, fecha, observaciones, banco, anticipo, saldo, iva, cantidad, total, noCheque, precioUnitario, importe]
        );
        res.json(pedidoinsertado.rows);
    } catch (error) {
        console.error("Error al insertar cliente:", error);
        res.send("Error en el servidor");
    }
});



// Insertar proveedores 
app.post("/api/proveedor/insertar", async (req, res) => {
    const { nombre, ejecutivo_ventas, correo, categoria, telefono, estado, colonia, cp, calle, numero_exterior, numero_interior, rfc, cuenta_bancaria, banco, clabe, beneficiario } = req.body;
    try {
        const proveedorinsertado = await db.query(
            "INSERT INTO proveedores (nombre, ejecutivo_ventas, correo, categoria, telefono, estado, colonia, cp, calle, numero_exterior, numero_interior, rfc, cuenta_bancaria, banco, clabe, beneficiario) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *",
            [nombre, ejecutivo_ventas, correo, categoria, telefono, estado, colonia, cp, calle, numero_exterior, numero_interior, rfc, cuenta_bancaria, banco, clabe, beneficiario]
        );
        res.json(proveedorinsertado.rows);
    } catch (error) {
        console.error("Error al insertar:", error);
        res.send("Error en el servidor");
    }
});


// POST /api/tintas/insertar
app.post('/api/tintas/insertar', async (req, res) => {
  const { gcmi, nombre_tinta } = req.body

  try {
    const result = await db.query(
      'INSERT INTO tintas (gcmi, nombre_tinta) VALUES ($1, $2) RETURNING *',
      [gcmi, nombre_tinta]
    )
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})


//Insertar grabados
app.post("/api/grabados/insertar", async (req, res) => {
    const {idGrabados, numSuaje , tintas, imagenGrabado} = req.body;
    try {
        const grabadoinsertar = await db.query(
            "INSERT INTO grabados (idgrabados, num_suaje , tintas, imagen_grabado) VALUES ($1, $2, $3, $4) RETURNING *",
          [idGrabados, numSuaje , tintas, imagenGrabado]
          );
        res.json(grabadoinsertar.rows);
    } catch (error) {
        console.error("Error al insertar:", error);
        res.send("Error en el servidor");
    }
});


// Insertar Matriales 
app.post("/api/materiales/insertar", async (req, res) => {
    const {clave, material , tipo, flauta, resistencia, precio} = req.body;
    try {
        const grabadoinsertar = await db.query(
            "INSERT INTO materiales (clave, material , tipo, flauta, resistencia, precio) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
          [clave, material , tipo, flauta, resistencia, precio]
          );
        res.json(grabadoinsertar.rows);
    } catch (error) {
        console.error("Error al insertar:", error);
        res.send("Error en el servidor");
    }
});

// Insertar operaodr 
app.post("/api/operador/insertar", async (req, res) => {
    const {idOperador, nombre , puesto} = req.body;
    try {
        const operadorinsertar = await db.query(
            "INSERT INTO operador (idoperador, nombre , puesto) VALUES ($1, $2, $3) RETURNING *",
          [idOperador, nombre , puesto]
          );
        res.json(operadorinsertar.rows);
    } catch (error) {
        console.error("Error al insertar:", error);
        res.send("Error en el servidor");
    }
});


//Insertar Orden_Produccion 
app.post("/api/ordenproduccion/insertar", async (req, res) => {
    const {noOrden, procesoRecepcionId, procesoSuajeId, procesoArmadoId, procesoEnvioId, procesoPegadoId, procesoImpresionId, procesoCalidadId, procesoAlmacenId, productoIdentificador, fecha, estado} = req.body;
    try {
        const operadorinsertar = await db.query(
            "INSERT INTO orden_Produccion (no_orden, proceso_recepcion_id, proceso_suaje_id, proceso_armado_id, proceso_envio_id, proceso_pegado_id, proceso_impresion_id, proceso_calidad_id, proceso_Almacen_id, producto_identificador, fecha, estado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
          [noOrden, procesoRecepcionId, procesoSuajeId, procesoArmadoId, procesoEnvioId, procesoPegadoId, procesoImpresionId, procesoCalidadId, procesoAlmacenId, productoIdentificador, fecha, estado]
          );
        res.json(operadorinsertar.rows);
    } catch (error) {
        console.error("Error al insertar:", error);
        res.send("Error en el servidor");
    }
});

// Insertar preceso_almacen 
app.post("/api/operador/insertar", async (req, res) => {
    const {idprocesoAlmacen, tipoArmado, cantidad} = req.body;
    try {
        const operadorinsertar = await db.query(
            "INSERT INTO preceso_almacen  (idproceso_almacen, tipo_armado, cantidad) VALUES ($1, $2, $3) RETURNING *",
          [idprocesoAlmacen, tipoArmado, cantidad]
          );
        res.json(operadorinsertar.rows);
    } catch (error) {
        console.error("Error al insertar:", error);
        res.send("Error en el servidor");
    }
});

// Insertar calidad 
app.post("/api/calidad/insertar", async (req, res) => {
    const {idprocesoCalidad, certificado, etiquetas, revision, autorizacionCalidad, autorizacionAdamistracion, estado} = req.body;
    try {
        const calidadinsertar  = await db.query(
            "INSERT INTO preceso_calidad  (idproceso_calidad, certificado, etiquetas, revision, autorizacion_calidad, autorizacion_administracion, estado) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
          [idprocesoCalidad, certificado, etiquetas, revision, autorizacionCalidad, autorizacionAdamistracion, estado]
          );
        res.json(calidadinsertar.rows);
    } catch (error) {
        console.error("Error al insertar:", error);
        res.send("Error en el servidor");
    }
});

//Insertar envio
app.post("/api/envio/insertar", async (req, res) => {
    const {idProcesoEnvio, operadorIdOperador, operador, observaciones, totalEnvio, vehiculo, estado} = req.body;
    try {
        const envioinsertar = await db.query(
            "INSERT INTO preceso_envio (id_proceso_envio, operador_idoperador, operador, observaciones, total_envio, vehiculo, estado) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
          [idProcesoEnvio, operadorIdOperador, operador, observaciones, totalEnvio, vehiculo, estado]
          );
        res.json(envioinsertar.rows);
    } catch (error) {
        console.error("Error al insertar:", error);
        res.send("Error en el servidor");
    }
});

//Insertar impresion
app.post("/api/impresion/insertar", async (req, res) => {
    const {idProcesoImpresion, cantidadImpresion, calidadTono, calidadMedidas, autorizacionImpresion, merma, totalEntrgadas, firmaOperador, estado} = req.body;
    try {
        const impresioninsertar = await db.query(
            "INSERT INTO preceso_envio (id_proceso_impresion, cantidad_impresion, calidad_tono, calidad_medidas, autorizacion_impresion, merma, total_entrgadas, firma_operador, estado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
          [idProcesoImpresion, cantidadImpresion, calidadTono, calidadMedidas, autorizacionImpresion, merma, totalEntrgadas, firmaOperador, estado]
          );
        res.json(impresioninsertar.rows);
    } catch (error) {
        console.error("Error al insertar:", error);
        res.send("Error en el servidor");
    }
});

//Insertar pegado
app.post("/api/pegado/insertar", async (req, res) => {
    const {idPegado, calidadCuadre, calidadDesagarre, calidadMarcas, autorizacionPegado, estado} = req.body;
    try {
        const pegadoinsertar = await db.query(
            "INSERT INTO preceso_almacen  (id_pegado, calidad_cuadre, calidad_desagarre, calidad_marca, autorizacion_pegado, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
          [idPegado, calidadCuadre, calidadDesagarre, calidadMarcas, autorizacionPegado, estado]
          );
        res.json(pegadoinsertar.rows);
    } catch (error) {
        console.error("Error al insertar:", error);
        res.send("Error en el servidor");
    }
});

//Insertar Recepcion 
app.post("/api/recepcion/insertar", async (req, res) => {
    const {idProesoRecepcion, cantidadRecibida, calidadMedidaCarton, calidadrecistencia, certificadoCalidad, autorizacionRecepcion,autorizacionPlaneacion , estado} = req.body;
    try {
        const recepcioninsertar = await db.query(
            "INSERT INTO preceso_almacen  (id_pegado, calidad_cuadre, calidad_desagarre, calidad_marcas, autorizacion_pegado, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
          [idProesoRecepcion, cantidadRecibida, calidadMedidaCarton, calidadrecistencia, certificadoCalidad, autorizacionRecepcion,autorizacionPlaneacion , estado]
          );
        res.json(recepcioninsertar.rows);
    } catch (error) {
        console.error("Error al insertar:", error);
        res.send("Error en el servidor");
    }
});

// insertar Proceso_SUAJE 
app.post("/api/procesosuaje/insertar", async (req, res) => {
    const {idProesoSuaje, operadorIdOperador, calidadMedidas  , calidadCuadre, calidadMarca, autorizacionSuaje,merma , totalEntrgadas, firmaOperador, estado} = req.body;
    try {
        const procesoSuajeinsertar = await db.query(
            "INSERT INTO preceso_suaje   (id_proeso_Suaje, operador_id_operador, calidad_medidas  , calidad_cuadre, calidad_marca, autorizacion_suaje,merma , total_entrgadas, firma_operador, estado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
          [idProesoSuaje, operadorIdOperador, calidadMedidas  , calidadCuadre, calidadMarca, autorizacionSuaje,merma , totalEntrgadas, firmaOperador, estado]
          );
        res.json(procesoSuajeinsertar.rows);
    } catch (error) {
        console.error("Error al insertar:", error);
        res.send("Error en el servidor");
    }
});
//insertar Suaje
app.post("/api/suajes/insertar", async (req, res) => {
    const {numSuaje, anchoSuaje, largoSuaje, resistencia} = req.body;
    try {
        const Suajeinsertar = await db.query(
            "INSERT INTO suajes (num_suaje, ancho_suaje, largo_suaje, resistencia) VALUES ($1, $2, $3, $4) RETURNING *",
          [numSuaje, anchoSuaje, largoSuaje, resistencia]
          );
        res.json(Suajeinsertar.rows);
    } catch (error) {
        console.error("Error al insertar:", error);
        res.send("Error en el servidor");
    }
});

//insertatr vehiculo
app.post("/api/vehiculos/insertar", async (req, res) => {
    const {idVehiculos, procesoIdEnvio , marcaModelo, placa} = req.body;
    try {
        const vehiculoinsertar = await db.query(
            "INSERT INTO vehiculos (idvehiculos, proceso_id_envio , marca_modelo, placa) VALUES ($1, $2, $3, $4) RETURNING *",
          [idVehiculos, procesoIdEnvio , marcaModelo, placa]
          );
        res.json(vehiculoinsertar.rows);
    } catch (error) {
        console.error("Error al insertar:", error);
        res.send("Error en el servidor");
    }
});

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Busqueda por id
app.get('/api/producto/catalogo', async (req, res) => {
  try {
    const query = `
      SELECT
    c.nombre_empresa,
    c.impresion,
    p.fecha,
    p.descripcion,
    p.tipo,
    p.producto,
    p.ancho_int,
    p.largo_int,
    p.alto_int,
    p.imagen_final,
    p.tipo_carton,
    m.tipo AS material_tipo
FROM productos p
INNER JOIN clientes c ON p.clientes_num_cliente = c.num_cliente
INNER JOIN materiales m ON p.clave_material = m.clave
ORDER BY p.fecha ASC;
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al traer productos:', error);
    res.status(500).json({ error: 'Error al traer productos' });
  }
});

// Obtener todos los clientes
app.get("/api/clientes", async (req, res) => {
    try {
        const resultado = await db.query("SELECT * FROM clientes");
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).send("Error en el servidor");
    }
});

// Obtener todas las tintas
app.get("/api/tintas", async (req, res) => {
    try {
        const resultado = await db.query("SELECT * FROM tintas");
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener tintas:", error);
        res.status(500).send("Error en el servidor");
    }
});

// Obtener todos los materiales
app.get("/api/materiales", async (req, res) => {
    try {
        const resultado = await db.query("SELECT * FROM materiales");
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener materiales:", error);
        res.status(500).send("Error en el servidor");
        }
    });

// Obtener todos los productos
app.get("/api/productos", async (req, res) => {
    try {
        const resultado = await db.query("SELECT * FROM productos");
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).send("Error en el servidor");
    }
});

app.get("/api/buscarTabla/:tabla", async (request, response) => {
    try {
        const { tabla } = request.params;
        console.log(`SELECT * FROM ${tabla}`);
        const resultado = await db.query(`SELECT * FROM ${tabla}`);
        console.log(resultado.rows);
        response.json(resultado.rows); 
    } catch (error) {
        console.log(error);
    }
});

// Clientes
app.get("/api/clientes/:num_cliente", async (req, res) => {
    const { num_cliente } = req.params;
    try {
        const resultado = await db.query("SELECT * FROM clientes WHERE num_cliente = $1", [num_cliente]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener cliente:", error);
        res.send("Error en el servidor");
    }
});

// Productos
app.get("/api/productos/:identificador", async (req, res) => {
    const { identificador } = req.params;
    try {
        const resultado = await db.query("SELECT * FROM productos WHERE identificador = $1", [identificador]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener producto:", error);
        res.send("Error en el servidor");
    }
});

// Pedidos
app.get("/api/pedidos/:no_pedido", async (req, res) => {
    const { no_pedido } = req.params;
    try {
        const resultado = await db.query("SELECT * FROM pedidos WHERE no_pedido = $1", [no_pedido]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener pedido:", error);
        res.send("Error en el servidor");
    }
});



// Domicilio_Proveedor
app.get("/api/domicilioproveedores/:iddomicilio_proveedor", async (req, res) => {
    const { iddomicilio_proveedor } = req.params;
    try {
        const resultado = await db.query("SELECT * FROM domicilio_proveedor WHERE iddomicilio_proveedor = $1", [iddomicilio_proveedor]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener domicilio proveedor:", error);
        res.send("Error en el servidor");
    }
});

// Proveedores
app.get("/api/proveedor/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await db.query("SELECT * FROM proveedores WHERE idproveedores = $1", [id]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener proveedor:", error);
        res.send("Error en el servidor");
    }
});

// Grabados
app.get("/api/grabados/:idgrabados", async (req, res) => {
    const { idgrabados } = req.params;
    try {
        const resultado = await db.query("SELECT * FROM grabados WHERE idgrabados = $1", [idgrabados]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener grabado:", error);
        res.send("Error en el servidor");
    }
});

// Materiales
app.get("/api/materiales/:clave", async (req, res) => {
    const { clave } = req.params;
    try {
        const resultado = await db.query("SELECT * FROM materiales WHERE clave = $1", [clave]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener material:", error);
        res.send("Error en el servidor");
    }
});

// Operador
app.get("/api/operador/:idoperador", async (req, res) => {
    const { idoperador } = req.params;
    try {
        const resultado = await db.query("SELECT * FROM operador WHERE idoperador = $1", [idoperador]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener operador:", error);
        res.send("Error en el servidor");
    }
});

// Orden Producción
app.get("/api/ordenproduccion/:no_orden", async (req, res) => {
    const { no_orden } = req.params;
    try {
        const resultado = await db.query("SELECT * FROM orden_produccion WHERE no_orden = $1", [no_orden]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener orden de producción:", error);
        res.send("Error en el servidor");
    }
});

// Proceso Almacén
app.get("/api/procesoalmacen/:idproceso_almacen", async (req, res) => {
    const { idproceso_almacen } = req.params;
    try {
        const resultado = await db.query("SELECT * FROM preceso_almacen WHERE idproceso_almacen = $1", [idproceso_almacen]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener proceso almacen:", error);
        res.send("Error en el servidor");
    }
});

// Calidad
app.get("/api/calidad/:idproceso_calidad", async (req, res) => {
    const { idproceso_calidad } = req.params;
    try {
        const resultado = await db.query("SELECT * FROM preceso_calidad WHERE idproceso_calidad = $1", [idproceso_calidad]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener proceso calidad:", error);
        res.send("Error en el servidor");
    }
});

// Envio
app.get("/api/envio/:id_proceso_envio", async (req, res) => {
    const { id_proceso_envio } = req.params;
    try {
        const resultado = await db.query("SELECT * FROM preceso_envio WHERE id_proceso_envio = $1", [id_proceso_envio]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener proceso envio:", error);
        res.send("Error en el servidor");
    }
});

// Impresion
app.get("/api/impresion/:id_proceso_impresion", async (req, res) => {
    const { id_proceso_impresion } = req.params;
    try {
        const resultado = await db.query("SELECT * FROM preceso_impresion WHERE id_proceso_impresion = $1", [id_proceso_impresion]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener impresion:", error);
        res.send("Error en el servidor");
    }
});

// Pegado
app.get("/api/pegado/:id_pegado", async (req, res) => {
    const { id_pegado } = req.params;
    try {
        const resultado = await db.query("SELECT * FROM preceso_pegado WHERE id_pegado = $1", [id_pegado]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener pegado:", error);
        res.send("Error en el servidor");
    }
});

// Recepcion
app.get("/api/recepcion/:id_proeso_recepcion", async (req, res) => {
    const { id_proeso_recepcion } = req.params;
    try {
        const resultado = await db.query("SELECT * FROM preceso_recepcion WHERE id_proeso_recepcion = $1", [id_proeso_recepcion]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener recepcion:", error);
        res.send("Error en el servidor");
    }
});

// Proceso Suaje
app.get("/api/procesosuaje/:id_proeso_suaje", async (req, res) => {
    const { id_proeso_suaje } = req.params;
    try {
        const resultado = await db.query("SELECT * FROM preceso_suaje WHERE id_proeso_suaje = $1", [id_proeso_suaje]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener proceso suaje:", error);
        res.send("Error en el servidor");
    }
});

// Suajes
app.get("/api/suajes/:num_suaje", async (req, res) => {
    const { num_suaje } = req.params;
    try {
        const resultado = await db.query("SELECT * FROM suajes WHERE num_suaje = $1", [num_suaje]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener suaje:", error);
        res.send("Error en el servidor");
    }
});

// Vehiculos
app.get("/api/vehiculos/:idvehiculos", async (req, res) => {
    const { idvehiculos } = req.params;
    try {
        const resultado = await db.query("SELECT * FROM vehiculos WHERE idvehiculos = $1", [idvehiculos]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener vehiculo:", error);
        res.send("Error en el servidor");
    }
});

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Actualizar Clientes
app.put("/api/clientes/actualizar/:num_cliente", async (req, res) => {
    const { num_cliente } = req.params;
    const { nombre_empresa, impresion, razon_social, rfc, email, telefono, regimen, cfdi, estado, colonia, cp, calle, num_ext, num_int } = req.body;
    try {
        const resultado = await db.query(
            "UPDATE clientes SET nombre_empresa=$1, impresion=$2, razon_social=$3, rfc=$4, email=$5, telefono=$6, regimen=$7, cfdi=$8, estado=$9, colonia=$10, cp=$11, calle=$12, num_ext=$13, num_int=$14 WHERE num_cliente=$15 RETURNING *",
            [nombre_empresa, impresion, razon_social, rfc, email, telefono, regimen, cfdi, estado, colonia, cp, calle, num_ext, num_int, num_cliente]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        res.send("Error en el servidor");
    }
});


// Actualizar Productos
app.put("/api/productos/:identificador", async (req, res) => {
    const { identificador } = req.params;
    const { grabadosIdgrabados, clientesNumcliente, materialesClave, suajesNumsuaje, clave, fecha, descripcion, tipo, producto, guia, anchoInt, largoInt, altoInt, ceja, tintas, anchoCarton, largoCarton, marcas, pegado, imagenFinal, tipoCarton } = req.body;
    try {
        const resultado = await db.query(
            "UPDATE productos SET grabados_idgrabados=$1, clientes_num_cliente=$2, materiales_clave=$3, suajes_num_suaje=$4, clave=$5, fecha=$6, descripcion=$7, tipo=$8, producto=$9, guia=$10, ancho_int=$11, largo_int=$12, alto_int=$13, ceja=$14, tintas=$15, ancho_carton=$16, largo_carton=$17, marcas=$18, pegado=$19, imagen_final=$20, tipo_carton=$21 WHERE identificador=$22 RETURNING *",
            [grabadosIdgrabados, clientesNumcliente, materialesClave, suajesNumsuaje, clave, fecha, descripcion, tipo, producto, guia, anchoInt, largoInt, altoInt, ceja, tintas, anchoCarton, largoCarton, marcas, pegado, imagenFinal, tipoCarton, identificador]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.send("Error en el servidor");
    }
});


// Actualizar Pedidos
app.put("/api/pedidos/:no_pedido", async (req, res) => {
    const { no_pedido } = req.params;
    const { ordenCompraId, clientesNumcliente, productosIdentificador, fecha, observaciones, banco, anticipo, saldo, iva, cantidad, total, noCheque, precioUnitario, importe } = req.body;
    try {
        const resultado = await db.query(
            "UPDATE pedidos SET orden_compra_id=$1, clientes_num_cliente=$2, productos_identificador=$3, fecha=$4, observaciones=$5, banco=$6, anticipo=$7, saldo=$8, iva=$9, cantidad=$10, total=$11, no_cheque=$12, precio_unitario=$13, importe=$14 WHERE no_pedido=$15 RETURNING *",
            [ordenCompraId, clientesNumcliente, productosIdentificador, fecha, observaciones, banco, anticipo, saldo, iva, cantidad, total, noCheque, precioUnitario, importe, no_pedido]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al actualizar pedido:", error);
        res.send("Error en el servidor");
    }
});



app.put("/api/proveedores/actualizar/:idproveedores", async (req, res) => {
    const { idproveedores } = req.params;
    const { nombre, ejecutivo_ventas, correo, categoria, telefono, estado, colonia, cp, calle, numero_exterior, numero_interior, rfc, cuenta_bancaria, banco, clabe, beneficiario } = req.body;
    try {
        const resultado = await db.query(
            "UPDATE proveedores SET nombre=$1, ejecutivo_ventas=$2, correo=$3, categoria=$4, telefono=$5, estado=$6, colonia=$7, cp=$8, calle=$9, numero_exterior=$10, numero_interior=$11, rfc=$12, cuenta_bancaria=$13, banco=$14, clabe=$15, beneficiario=$16 WHERE idproveedores=$17 RETURNING *",
            [nombre, ejecutivo_ventas, correo, categoria, telefono, estado, colonia, cp, calle, numero_exterior, numero_interior, rfc, cuenta_bancaria, banco, clabe, beneficiario, idproveedores]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al actualizar proveedor:", error);
        res.send("Error en el servidor");
    }
});


// Actualizar Grabados

app.put("/api/grabados/:idgrabados", async (req, res) => {
    const { idgrabados } = req.params;
    const { numSuaje, tintas, imagenGrabado } = req.body;
    try {
        const resultado = await db.query(
            "UPDATE grabados SET num_suaje=$1, tintas=$2, imagen_grabado=$3 WHERE idgrabados=$4 RETURNING *",
            [numSuaje, tintas, imagenGrabado, idgrabados]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al actualizar grabado:", error);
        res.send("Error en el servidor");
    }
});


// Actualizar Materiales

app.put("/api/materiales/:clave", async (req, res) => {
    const { clave } = req.params;
    const { material, tipo, flauta, resistencia, precio } = req.body;
    try {
        const resultado = await db.query(
            "UPDATE materiales SET material=$1, tipo=$2, flauta=$3, resistencia=$4, precio=$5 WHERE clave=$6 RETURNING *",
            [material, tipo, flauta, resistencia, precio, clave]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al actualizar material:", error);
        res.send("Error en el servidor");
    }
});


// Actualizar Operador

app.put("/api/operador/:idoperador", async (req, res) => {
    const { idoperador } = req.params;
    const { nombre, puesto } = req.body;
    try {
        const resultado = await db.query(
            "UPDATE operador SET nombre=$1, puesto=$2 WHERE idoperador=$3 RETURNING *",
            [nombre, puesto, idoperador]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al actualizar operador:", error);
        res.send("Error en el servidor");
    }
});


// Actualizar Orden Producción

app.put("/api/ordenproduccion/:no_orden", async (req, res) => {
    const { no_orden } = req.params;
    const { procesoRecepcionId, procesoSuajeId, procesoArmadoId, procesoEnvioId, procesoPegadoId, procesoImpresionId, procesoCalidadId, procesoAlmacenId, productoIdentificador, fecha, estado } = req.body;
    try {
        const resultado = await db.query(
            "UPDATE orden_produccion SET proceso_recepcion_id=$1, proceso_suaje_id=$2, proceso_armado_id=$3, proceso_envio_id=$4, proceso_pegado_id=$5, proceso_impresion_id=$6, proceso_calidad_id=$7, proceso_almacen_id=$8, producto_identificador=$9, fecha=$10, estado=$11 WHERE no_orden=$12 RETURNING *",
            [procesoRecepcionId, procesoSuajeId, procesoArmadoId, procesoEnvioId, procesoPegadoId, procesoImpresionId, procesoCalidadId, procesoAlmacenId, productoIdentificador, fecha, estado, no_orden]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al actualizar orden producción:", error);
        res.send("Error en el servidor");
    }
});


// Actualizar Proceso Almacén

app.put("/api/procesoalmacen/:idproceso_almacen", async (req, res) => {
    const { idproceso_almacen } = req.params;
    const { tipoArmado, cantidad } = req.body;
    try {
        const resultado = await db.query(
            "UPDATE preceso_almacen SET tipo_armado=$1, cantidad=$2 WHERE idproceso_almacen=$3 RETURNING *",
            [tipoArmado, cantidad, idproceso_almacen]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al actualizar proceso almacen:", error);
        res.send("Error en el servidor");
    }
});


// Actualizar Calidad

app.put("/api/calidad/:idproceso_calidad", async (req, res) => {
    const { idproceso_calidad } = req.params;
    const { certificado, etiquetas, revision, autorizacionCalidad, autorizacionAdamistracion, estado } = req.body;
    try {
        const resultado = await db.query(
            "UPDATE preceso_calidad SET certificado=$1, etiquetas=$2, revision=$3, autorizacion_calidad=$4, autorizacion_administracion=$5, estado=$6 WHERE idproceso_calidad=$7 RETURNING *",
            [certificado, etiquetas, revision, autorizacionCalidad, autorizacionAdamistracion, estado, idproceso_calidad]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al actualizar calidad:", error);
        res.send("Error en el servidor");
    }
});


// Actualizar Envio

app.put("/api/envio/:id_proceso_envio", async (req, res) => {
    const { id_proceso_envio } = req.params;
    const { operadorIdOperador, operador, observaciones, totalEnvio, vehiculo, estado } = req.body;
    try {
        const resultado = await db.query(
            "UPDATE preceso_envio SET operador_idoperador=$1, operador=$2, observaciones=$3, total_envio=$4, vehiculo=$5, estado=$6 WHERE id_proceso_envio=$7 RETURNING *",
            [operadorIdOperador, operador, observaciones, totalEnvio, vehiculo, estado, id_proceso_envio]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al actualizar envio:", error);
        res.send("Error en el servidor");
    }
});


// Actualizar Impresion

app.put("/api/impresion/:id_proceso_impresion", async (req, res) => {
    const { id_proceso_impresion } = req.params;
    const { cantidadImpresion, calidadTono, calidadMedidas, autorizacionImpresion, merma, totalEntrgadas, firmaOperador, estado } = req.body;
    try {
        const resultado = await db.query(
            "UPDATE preceso_impresion SET cantidad_impresion=$1, calidad_tono=$2, calidad_medidas=$3, autorizacion_impresion=$4, merma=$5, total_entrgadas=$6, firma_operador=$7, estado=$8 WHERE id_proceso_impresion=$9 RETURNING *",
            [cantidadImpresion, calidadTono, calidadMedidas, autorizacionImpresion, merma, totalEntrgadas, firmaOperador, estado, id_proceso_impresion]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al actualizar impresion:", error);
        res.send("Error en el servidor");
    }
});


// Actualizar Pegado
app.put("/api/pegado/:id_pegado", async (req, res) => {
    const { id_pegado } = req.params;
    const { calidadCuadre, calidadDesagarre, calidadMarcas, autorizacionPegado, estado } = req.body;
    try {
        const resultado = await db.query(
            "UPDATE preceso_pegado SET calidad_cuadre=$1, calidad_desagarre=$2, calidad_marcas=$3, autorizacion_pegado=$4, estado=$5 WHERE id_pegado=$6 RETURNING *",
            [calidadCuadre, calidadDesagarre, calidadMarcas, autorizacionPegado, estado, id_pegado]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al actualizar pegado:", error);
        res.send("Error en el servidor");
    }
});


// Actualizar Recepcion

app.put("/api/recepcion/:id_proceso_recepcion", async (req, res) => {
    const { id_proceso_recepcion } = req.params;
    const { cantidadRecibida, calidadMedidaCarton, calidadrecistencia, certificadoCalidad, autorizacionRecepcion, autorizacionPlaneacion, estado } = req.body;
    try {
        const resultado = await db.query(
            "UPDATE preceso_recepcion SET cantidad_recibida=$1, calidad_medida_carton=$2, calidadrecistencia=$3, certificado_calidad=$4, autorizacion_recepcion=$5, autorizacion_planeacion=$6, estado=$7 WHERE id_proceso_recepcion=$8 RETURNING *",
            [cantidadRecibida, calidadMedidaCarton, calidadrecistencia, certificadoCalidad, autorizacionRecepcion, autorizacionPlaneacion, estado, id_proceso_recepcion]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al actualizar recepcion:", error);
        res.send("Error en el servidor");
    }
});


// Actualizar Proceso Suaje
app.put("/api/procesosuaje/:id_proceso_suaje", async (req, res) => {
    const { id_proceso_suaje } = req.params;
    const { operadorIdOperador, calidadMedidas, calidadCuadre, calidadMarca, autorizacionSuaje, merma, totalEntrgadas, firmaOperador, estado } = req.body;
    try {
        const resultado = await db.query(
            "UPDATE preceso_suaje SET operador_id_operador=$1, calidad_medidas=$2, calidad_cuadre=$3, calidad_marca=$4, autorizacion_suaje=$5, merma=$6, total_entrgadas=$7, firma_operador=$8, estado=$9 WHERE id_proceso_suaje=$10 RETURNING *",
            [operadorIdOperador, calidadMedidas, calidadCuadre, calidadMarca, autorizacionSuaje, merma, totalEntrgadas, firmaOperador, estado, id_proceso_suaje]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al actualizar proceso suaje:", error);
        res.send("Error en el servidor");
    }
});


// Actualizar Suajes

app.put("/api/suajes/:num_suaje", async (req, res) => {
    const { num_suaje } = req.params;
    const { anchoSuaje, largoSuaje, resistencia } = req.body;
    try {
        const resultado = await db.query(
            "UPDATE suajes SET ancho_suaje=$1, largo_suaje=$2, resistencia=$3 WHERE num_suaje=$4 RETURNING *",
            [anchoSuaje, largoSuaje, resistencia, num_suaje]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al actualizar suaje:", error);
        res.send("Error en el servidor");
    }
});


// Actualizar Vehiculos

app.put("/api/vehiculos/:idvehiculos", async (req, res) => {
    const { idvehiculos } = req.params;
    const { procesoIdEnvio, marcaModelo, placa } = req.body;
    try {
        const resultado = await db.query(
            "UPDATE vehiculos SET proceso_id_envio=$1, marca_modelo=$2, placa=$3 WHERE idvehiculos=$4 RETURNING *",
            [procesoIdEnvio, marcaModelo, placa, idvehiculos]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al actualizar vehiculo:", error);
        res.send("Error en el servidor");
    }
});


//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// DELETE por ID 

app.delete("/api/clientes/borrar/:num_cliente", async (req, res) => {
    const { num_cliente } = req.params;
    try {
        const result = await db.query("DELETE FROM clientes WHERE num_cliente = $1", [num_cliente]);
        if (result.rowCount === 0) {
            return res.status(404).send("Cliente no encontrado");
        }
        res.status(200).send("Cliente eliminado correctamente");
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        res.status(500).send("Error en el servidor");
    }
});
// Productos
app.delete("/api/productos/:identificador", async (req, res) => {
    const { identificador } = req.params;
    try {
        await db.query("DELETE FROM productos WHERE identificador = $1", [identificador]);
        res.send("Producto eliminado correctamente");
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.send("Error en el servidor");
    }
});

// Pedidos
app.delete("/api/pedidos/:no_pedido", async (req, res) => {
    const { no_pedido } = req.params;
    try {
        await db.query("DELETE FROM pedidos WHERE no_pedido = $1", [no_pedido]);
        res.send("Pedido eliminado correctamente");
    } catch (error) {
        console.error("Error al eliminar pedido:", error);
        res.send("Error en el servidor");
    }
});


// Proveedores
app.delete("/api/proveedores/borrar/:idproveedores", async (req, res) => {
    const { idproveedores } = req.params;
    try {
        await db.query("DELETE FROM proveedores WHERE idproveedores = $1", [idproveedores]);
        res.send("Proveedor eliminado correctamente");
    } catch (error) {
        console.error("Error al eliminar proveedor:", error);
        res.send("Error en el servidor");
    }
});

// Grabados
app.delete("/api/grabados/:idgrabados", async (req, res) => {
    const { idgrabados } = req.params;
    try {
        await db.query("DELETE FROM grabados WHERE idgrabados = $1", [idgrabados]);
        res.send("Grabado eliminado correctamente");
    } catch (error) {
        console.error("Error al eliminar grabado:", error);
        res.send("Error en el servidor");
    }
});

// Materiales
app.delete("/api/materiales/:clave", async (req, res) => {
    const { clave } = req.params;
    try {
        await db.query("DELETE FROM materiales WHERE clave = $1", [clave]);
        res.send("Material eliminado correctamente");
    } catch (error) {
        console.error("Error al eliminar material:", error);
        res.send("Error en el servidor");
    }
});

// Operador
app.delete("/api/operador/:idoperador", async (req, res) => {
    const { idoperador } = req.params;
    try {
        await db.query("DELETE FROM operador WHERE idoperador = $1", [idoperador]);
        res.send("Operador eliminado correctamente");
    } catch (error) {
        console.error("Error al eliminar operador:", error);
        res.send("Error en el servidor");
    }
});

// Orden Producción
app.delete("/api/ordenproduccion/:no_orden", async (req, res) => {
    const { no_orden } = req.params;
    try {
        await db.query("DELETE FROM orden_produccion WHERE no_orden = $1", [no_orden]);
        res.send("Orden de producción eliminada correctamente");
    } catch (error) {
        console.error("Error al eliminar orden de producción:", error);
        res.send("Error en el servidor");
    }
});

// Proceso Almacén
app.delete("/api/procesoalmacen/:idproceso_almacen", async (req, res) => {
    const { idproceso_almacen } = req.params;
    try {
        await db.query("DELETE FROM preceso_almacen WHERE idproceso_almacen = $1", [idproceso_almacen]);
        res.send("Proceso almacén eliminado correctamente");
    } catch (error) {
        console.error("Error al eliminar proceso almacén:", error);
        res.send("Error en el servidor");
    }
});

// Calidad
app.delete("/api/calidad/:idproceso_calidad", async (req, res) => {
    const { idproceso_calidad } = req.params;
    try {
        await db.query("DELETE FROM preceso_calidad WHERE idproceso_calidad = $1", [idproceso_calidad]);
        res.send("Proceso calidad eliminado correctamente");
    } catch (error) {
        console.error("Error al eliminar proceso calidad:", error);
        res.send("Error en el servidor");
    }
});

// Envio
app.delete("/api/envio/:id_proceso_envio", async (req, res) => {
    const { id_proceso_envio } = req.params;
    try {
        await db.query("DELETE FROM preceso_envio WHERE id_proceso_envio = $1", [id_proceso_envio]);
        res.send("Proceso envío eliminado correctamente");
    } catch (error) {
        console.error("Error al eliminar proceso envío:", error);
        res.send("Error en el servidor");
    }
});

// Impresion
app.delete("/api/impresion/:id_proceso_impresion", async (req, res) => {
    const { id_proceso_impresion } = req.params;
    try {
        await db.query("DELETE FROM preceso_impresion WHERE id_proceso_impresion = $1", [id_proceso_impresion]);
        res.send("Proceso impresión eliminado correctamente");
    } catch (error) {
        console.error("Error al eliminar proceso impresión:", error);
        res.send("Error en el servidor");
    }
});

// Pegado
app.delete("/api/pegado/:id_pegado", async (req, res) => {
    const { id_pegado } = req.params;
    try {
        await db.query("DELETE FROM preceso_pegado WHERE id_pegado = $1", [id_pegado]);
        res.send("Proceso pegado eliminado correctamente");
    } catch (error) {
        console.error("Error al eliminar proceso pegado:", error);
        res.send("Error en el servidor");
    }
});

// Recepcion
app.delete("/api/recepcion/:id_proeso_recepcion", async (req, res) => {
    const { id_proeso_recepcion } = req.params;
    try {
        await db.query("DELETE FROM preceso_recepcion WHERE id_proeso_recepcion = $1", [id_proeso_recepcion]);
        res.send("Recepción eliminada correctamente");
    } catch (error) {
        console.error("Error al eliminar recepción:", error);
        res.send("Error en el servidor");
    }
});

// Proceso Suaje
app.delete("/api/procesosuaje/:id_proeso_suaje", async (req, res) => {
    const { id_proeso_suaje } = req.params;
    try {
        await db.query("DELETE FROM preceso_suaje WHERE id_proeso_suaje = $1", [id_proeso_suaje]);
        res.send("Proceso suaje eliminado correctamente");
    } catch (error) {
        console.error("Error al eliminar proceso suaje:", error);
        res.send("Error en el servidor");
    }
});

// Suajes
app.delete("/api/suajes/:num_suaje", async (req, res) => {
    const { num_suaje } = req.params;
    try {
        await db.query("DELETE FROM suajes WHERE num_suaje = $1", [num_suaje]);
        res.send("Suaje eliminado correctamente");
    } catch (error) {
        console.error("Error al eliminar suaje:", error);
        res.send("Error en el servidor");
    }
});

// Vehiculos
app.delete("/api/vehiculos/:idvehiculos", async (req, res) => {
    const { idvehiculos } = req.params;
    try {
        await db.query("DELETE FROM vehiculos WHERE idvehiculos = $1", [idvehiculos]);
        res.send("Vehículo eliminado correctamente");
    } catch (error) {
        console.error("Error al eliminar vehículo:", error);
        res.send("Error en el servidor");
    }
});




app.listen(3000,(err)=>{
    console.log("Si escucha el puerto 3000");
})