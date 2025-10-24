const express= require ('express');
const app = express();
const cors = require ('cors');
app.use (cors());
app.use(express.json());
const multer = require('multer');


const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fieldSize: 20 * 1024 * 1024, 
    fileSize: 10 * 1024 * 1024   // 10 MB por archivo
  }
});



const db= require ('./connection');


// Insertar clientes 

app.post("/api/clientes/insertar", async (req, res) => {
    let {
        nombreEmpresa,
        impresion,
        razonSocial,
        rfc,
        email,
        telefono,
        regimen,
        cfdi,
        estado,
        colonia,
        cp,
        calle,
        numeroExterior,
        numeroInterior
    } = req.body;

    // Convertir a números o null si vienen vacíos o nulos
    telefono = telefono ? Number(telefono) : null;
    cp = cp ? Number(cp) : null;
    numeroExterior = numeroExterior ? Number(numeroExterior) : null;
    numeroInterior = numeroInterior ? Number(numeroInterior) : null;

    try {
        const clienteInsertado = await db.query(
            `INSERT INTO clientes 
            (nombre_empresa, impresion, razon_social, rfc, email, telefono, regimen, cfdi, estado, colonia, cp, calle, num_ext, num_int)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
            RETURNING *`,
            [
                nombreEmpresa,
                impresion,
                razonSocial,
                rfc,
                email,
                telefono,
                regimen,
                cfdi,
                estado,
                colonia,
                cp,
                calle,
                numeroExterior,
                numeroInterior
            ]
        );
        res.json(clienteInsertado.rows);
    } catch (error) {
        console.error("Error al insertar cliente:", error);
        res.status(500).send("Error en el servidor");
    }
});



//Insertar productos 

app.post("/api/productos/insertar", upload.fields([
  { name: 'imagenFinal' },
  { name: 'imagenGrabado' },
  { name: 'imagen' },
  { name: 'imagenSuaje' }
]), async (req, res) => {
  try {
    const {
     grabado, num_cliente, clave_material, suajesNumsuaje, clave,
      fecha, descripcion, tipo, producto, guia, anchoInt, largoInt, altoInt, ceja,
      anchoCarton, largoCarton, marcas, pegado,
      ancho_suaje, largo_suaje, corto_sep, largo_sep, tintas, precio_unitario
    } = req.body;

    const parseNumber = (value) => (value !== '' && value !== undefined ? parseFloat(value) : null);

    
    const suajesNumsuajeNum = parseNumber(suajesNumsuaje);
    const anchoIntNum = parseNumber(anchoInt);
    const largoIntNum = parseNumber(largoInt);
    const altoIntNum = parseNumber(altoInt);
    const cejaNum = parseNumber(ceja);
    const anchoCartonNum = parseNumber(anchoCarton);
    const largoCartonNum = parseNumber(largoCarton);
    const ancho_suajeNum = parseNumber(ancho_suaje);
    const largo_suajeNum = parseNumber(largo_suaje);
    const corto_sepNum = parseNumber(corto_sep);
    const largo_sepNum = parseNumber(largo_sep);
    const precio_unitarioNum = parseNumber(precio_unitario);

   
    const imagenFinal = req.files['imagenFinal'] ? req.files['imagenFinal'][0].buffer : null;
    const imagenGrabado = req.files['imagenGrabado'] ? req.files['imagenGrabado'][0].buffer : null;
    const imagen = req.files['imagen'] ? req.files['imagen'][0].buffer : null;
    const imagenSuaje = req.files['imagenSuaje'] ? req.files['imagenSuaje'][0].buffer : null;

    
    const productoinsertado = await db.query(
      `INSERT INTO productos (
        imagen_suaje, alto_int, ceja, ancho_carton, largo_carton,
        imagen_final, imagen_grabado, ancho_suaje, largo_suaje,
        corto_sep, largo_sep, imagen, suajes_num_suaje, fecha,
        ancho_int, largo_int, grabado, clientes_num_cliente,
        marcas, clave, pegado, descripcion, tipo, producto, guia,
        clave_material, precio_unitario
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,$24,$25,$26, $27
      ) RETURNING identificador`,
      [
        imagenSuaje, altoIntNum, cejaNum, anchoCartonNum, largoCartonNum,
        imagenFinal, imagenGrabado, ancho_suajeNum, largo_suajeNum,
        corto_sepNum, largo_sepNum, imagen, suajesNumsuajeNum, fecha,
        anchoIntNum, largoIntNum, grabado, num_cliente,
        marcas, clave, pegado, descripcion, tipo, producto, guia,
        clave_material, precio_unitarioNum
      ]
    );

    const id_producto = productoinsertado.rows[0].identificador; 

    
    if (id_producto) {
      const tintasArray = JSON.parse(tintas || '[]');
      for (let id_tinta of tintasArray) {
        const idTintaNum = parseNumber(id_tinta);
        if (idTintaNum !== null) {
          await db.query(
            `INSERT INTO producto_tinta (id_producto, id_tinta) VALUES ($1, $2)`,
            [id_producto, idTintaNum]
          );
        }
      }
    }

    res.json({ message: 'Producto insertado correctamente', producto: productoinsertado.rows[0] });

  } catch (error) {
    console.error("Error al insertar producto:", error);
    res.status(500).send("Error en el servidor");
  }
});


app.post("/api/cotizaciones/insertar", async (req, res) => {
  try {
    const { num_cliente, fecha, productos } = req.body;

    // Validar datos mínimos
    if (!num_cliente || !productos || productos.length === 0) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }


    // 1️⃣ Insertar cabecera en cotizaciones
    const resultCotizacion = await db.query(
      `INSERT INTO cotizaciones (num_cliente, fecha)
       VALUES ($1, $2)
       RETURNING id`,
      [num_cliente, fecha || new Date()]
    );

    const idCotizacion = resultCotizacion.rows[0].id;

    // 2️⃣ Insertar cada producto en detalle_cotizaciones
    const insertDetalleQuery = `
      INSERT INTO detalle_cotizaciones (
        id_cotizacion, id_producto, cantidad,
        precio_carton, precio_tintas, precio_maquina, precio_pegado,
        precio_fijos, precio_utilidad, precio_otros, precio_envio,
        precio_venta, precio_final
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
      )
    `;

    for (const p of productos) {
      await db.query(insertDetalleQuery, [
        idCotizacion,
        p.idProducto,
        parseFloat(p.cantidad) || 0,
        parseFloat(p.totalCarton) || 0,
        parseFloat(p.precioTintas) || 0,
        parseFloat(p.precioMaquina) || 0,
        parseFloat(p.precioPegadoFinal) || 0,
        parseFloat(p.fijosCalculada) || 0,
        parseFloat(p.utilidadCalculada) || 0,
        parseFloat(p.otros) || 0,
        parseFloat(p.envioCalculada) || 0,
        parseFloat(p.precioVenta) || 0,
        parseFloat(p.precioFinal) || 0
      ]);
    }

    // 3️⃣ Respuesta final
    res.json({
      message: "Cotización y detalles insertados correctamente",
      idCotizacion,
    
    });

  } catch (error) {
    console.error("❌ Error al insertar cotización:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});



// Insertar Matriales 
app.post("/api/materiales/insertar", async (req, res) => {
  let { clave, material, tipo, flauta, resistencia, precio, tipo_material, calibre, peso } = req.body;

  // Convertir campos numéricos vacíos a null
  resistencia = resistencia === '' ? null : Number(resistencia);
  precio = precio === '' ? null : Number(precio);
  calibre = calibre === '' ? null : Number(calibre);
  peso = peso === '' ? null : Number(peso);

  try {
    await db.query(
      `INSERT INTO materiales 
        (clave, material, tipo, flauta, resistencia, precio, tipo_material, calibre, peso)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [clave, material, tipo, flauta, resistencia, precio, tipo_material, calibre, peso]
    );
    res.send("Material insertado correctamente");
  } catch (error) {
    console.error("Error al insertar:", error);
    res.status(500).send("Error en el servidor");
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

// Insertar tinta
app.post("/api/tintas/insertar", async (req, res) => {
    const { gcmi, nombre_tinta } = req.body;
    try {
        const tintaInsertada = await db.query(
            "INSERT INTO tintas (gcmi, nombre_tinta) VALUES ($1, $2) RETURNING *",
            [gcmi, nombre_tinta]
        );
        res.json(tintaInsertada.rows);
    } catch (error) {
        console.error("Error al insertar tinta:", error);
        res.send("Error en el servidor");
    }
});

app.post("/api/utilidad/calcular", async (req, res) => {
  try {
    const { area, cantidad } = req.body;

    if (!area || !cantidad) {
      return res.status(400).json({ message: "Faltan parámetros (area o cantidad)" });
    }

   
    const categoriaQuery = `
      SELECT id, nombre
      FROM categoria_cajas
      WHERE $1 BETWEEN area_min AND area_max
      LIMIT 1
    `;
    const categoriaResult = await db.query(categoriaQuery, [area]);
    const categoria = categoriaResult.rows[0];

    if (!categoria) {
      return res.status(404).json({ message: "No se encontró categoría para el área" });
    }

    // 2️⃣ Buscar todas las utilidades de esa categoría
    const utilidadesQuery = `
      SELECT rango, precio
      FROM utilidades
      WHERE categoria_id = $1
    `;
    const utilidadesResult = await db.query(utilidadesQuery, [categoria.id]);
    const utilidades = utilidadesResult.rows;

    // 3️⃣ Determinar el rango correcto según la cantidad
    let precioUtilidad = 0;
    let rangoSeleccionado = "";

    for (const u of utilidades) {
      const rango = u.rango.trim();

      if (rango.startsWith("<")) {
        const max = parseInt(rango.replace("<", ""));
        if (cantidad < max) {
          precioUtilidad = parseFloat(u.precio);
          rangoSeleccionado = rango;
          break;
        }
      } else if (rango.startsWith(">=")) {
        const min = parseInt(rango.replace(">=", ""));
        if (cantidad >= min) {
          precioUtilidad = parseFloat(u.precio);
          rangoSeleccionado = rango;
          break;
        }
      } else if (rango.includes("-")) {
        const [min, max] = rango.split("-").map(n => parseInt(n));
        if (cantidad >= min && cantidad <= max) {
          precioUtilidad = parseFloat(u.precio);
          rangoSeleccionado = rango;
          break;
        }
      }
    }

    // 4️⃣ Responder al frontend
    res.json({
      categoria: categoria.nombre,
      rango: rangoSeleccionado,
      precioUtilidad,
    });

  } catch (error) {
    console.error("Error al calcular utilidad:", error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
});



//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Busqueda por id
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

app.get('/api/producto/catalogo', async (req, res) => {
  try {
    const query = `
  SELECT
    p.identificador,               
    c.nombre_empresa,
    c.impresion,
    p.fecha,
    p.descripcion,
    p.tipo,
    p.producto,
    p.ancho_int,
    p.largo_int,
    p.alto_int,
    encode(p.imagen_final, 'base64') AS imagen_final_base64,
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

app.get("/api/porcentajeCantidad", async (req, res) => {
    try {
        const resultado = await db.query("SELECT * FROM porcentaje_cantidad");
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener porcentaje:", error);
        res.status(500).send("Error en el servidor");
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

app.get("/api/productos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Consulta al producto por identificador
    const resultado = await db.query("SELECT * FROM productos WHERE identificador = $1", [id]);
    
    if (resultado.rows.length === 0) {
      return res.status(404).send("Producto no encontrado");
    }

    const producto = resultado.rows[0];

    // Convertir imágenes bytea a base64
    const imagenFinal = producto.imagen_final ? Buffer.from(producto.imagen_final).toString('base64') : null;
    const imagenGrabado = producto.imagen_grabado ? Buffer.from(producto.imagen_grabado).toString('base64') : null;
    const imagenSuaje = producto.imagen_suaje ? Buffer.from(producto.imagen_suaje).toString('base64') : null;
    const imagenBase = producto.imagen ? Buffer.from(producto.imagen).toString('base64') : null;

    // Construir objeto para frontend
    const productoJson = {
      ...producto,
      imagenFinal,
      imagenGrabado,
      imagenSuaje,
      imagenBase
    };

    res.json([productoJson]);

  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).send("Error en el servidor");
  }
});


app.get("/api/productos/tintas/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await db.query(
      `SELECT t.id_tinta, t.nombre_tinta, t.gcmi
       FROM producto_tinta pt
       JOIN tintas t ON pt.id_tinta = t.id_tinta
       JOIN productos p ON pt.id_producto = p.identificador
       WHERE p.identificador = $1
       ORDER BY t.id_tinta`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).send("No se encontraron tintas para este producto");
    }

    res.json(resultado.rows);

  } catch (error) {
    console.error("Error al obtener tintas del producto:", error);
    res.status(500).send("Error en el servidor");
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

// Obtener cotización por id
app.get('/api/buscarTabla/cotizaciones/:id', async (req, res) => {
  const { id } = req.params

  // Validar que sea un número válido
  const idNum = parseInt(id)
  if (isNaN(idNum)) {
    return res.status(400).json({ error: 'ID de cotización inválido' })
  }

  try {
    const resultado = await db.query('SELECT * FROM cotizaciones WHERE id = $1', [idNum])

    if (!resultado.rows || resultado.rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró la cotización' })
    }

    res.json(resultado.rows[0])
  } catch (error) {
    console.error('Error al obtener la cotización:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

app.get('/api/detalleCotizaciones/:id_cotizacion', async (req, res) => {
  const { id_cotizacion } = req.params;
  try {
    // Consulta principal para detalle de cotización + producto + material
    const resultado = await db.query(`
      SELECT 
        dc.id,
        dc.id_cotizacion,
        dc.id_producto,
        dc.cantidad,
        dc.precio_final,
        p.producto,
        CONCAT(p.largo_int, 'x', p.ancho_int, 'x', p.alto_int) AS medidas,
        m.tipo AS material_tipo,
        m.material AS material_nombre,
        m.resistencia,
        m.flauta AS material_flauta,
        m.calibre,
        m.peso
      FROM detalle_cotizaciones dc
      JOIN productos p ON dc.id_producto = p.identificador
      LEFT JOIN materiales m ON p.clave_material = m.clave
      WHERE dc.id_cotizacion = $1
    `, [id_cotizacion]);

    // Para cada producto, obtenemos las tintas
    const detalleConTintas = await Promise.all(resultado.rows.map(async (item) => {
      const { rows: tintas } = await db.query(`
        SELECT t.id_tinta, t.gcmi, t.nombre_tinta
        FROM producto_tinta pt
        JOIN tintas t ON pt.id_tinta = t.id_tinta
        WHERE pt.id_producto = $1
      `, [item.id_producto]);

      return {
        ...item,
        tintas
      };
    }));

    res.json(detalleConTintas);
  } catch (error) {
    console.error('Error al obtener detalle de cotización:', error);
    res.status(500).json({ error: 'Error al obtener detalle de cotización' });
  }
});



// GET /api/productos/por-cliente/:clienteId
app.get('/api/productos/por-cliente/:clienteId', async (req, res) => {
  const clienteId = req.params.clienteId?.trim().toUpperCase(); // limpiar y normalizar

  if (!clienteId) return res.json([]); // cliente no enviado → arreglo vacío

  try {
    const query = `
      SELECT *
      FROM productos
      WHERE TRIM(UPPER(clientes_num_cliente)) = $1
      ORDER BY producto ASC
    `;
    const { rows } = await db.query(query, [clienteId]);

    res.json(rows); // devuelve [] si no hay productos
  } catch (error) {
    console.error('Error al obtener productos por cliente:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

app.get('/api/utilidades', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        c.nombre AS categoria,
        u.rango,
        u.precio
      FROM utilidades u
      INNER JOIN categoria_cajas c
        ON u.categoria_id = c.id
      ORDER BY u.categoria_id, u.id
    `;

    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener utilidades:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

//obtener datos cotizacion 
app.get('/api/cotizaciones/detalle/:idCotizacion', async (req, res) => {
  try {
    const { idCotizacion } = req.params;

    const query = `
      SELECT 
        p.identificador as id_producto,
        p.producto,
        p.largo_int,
        p.ancho_int, 
        p.alto_int,
        p.clave_material,
        m.calibre,
        dc.cantidad,
        dc.precio_final AS precio_unitario,
        CONCAT(p.largo_int, ' x ', p.ancho_int, ' x ', p.alto_int) AS medidas,
        COALESCE(pt.cantidad_tintas, 0) AS tintas
      FROM detalle_cotizaciones dc
      INNER JOIN productos p ON dc.id_producto = p.identificador
      INNER JOIN materiales m ON p.clave_material = m.clave
      LEFT JOIN (
        SELECT id_producto, COUNT(*) as cantidad_tintas 
        FROM producto_tinta 
        GROUP BY id_producto
      ) pt ON p.identificador = pt.id_producto
      WHERE dc.id_cotizacion = $1
    `;

    const { rows } = await db.query(query, [idCotizacion]);
    res.json(rows);
  } catch (error) {
    console.error('Error al traer productos:', error);
    res.status(500).json({ error: 'Error al traer productos' });
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

app.put("/api/porcentajeCantidad/actualizar/:id", async (req, res) => {
  const { id } = req.params;
  const { porcentaje } = req.body;

  try {
    const resultado = await db.query(
      "UPDATE porcentaje_cantidad SET porcentaje = $1 WHERE id = $2 RETURNING *",
      [porcentaje, id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).send("No se encontró el porcentaje con ese ID");
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al actualizar porcentaje:", error);
    res.status(500).send("Error en el servidor");
  }
});

app.put("/api/general/actualizar/:tabla/:id", async (req, res) => {
  const { tabla, id } = req.params;
  const { precio } = req.body;

  
  const tablasPermitidas = [
    "tinta_cantidad",
    "maquina_cantidad",
    "pegado_cantidad",
    "envio_cantidad",
    "fijos_cantidad",
    "utilidades"
  ];

  if (!tablasPermitidas.includes(tabla)) {
    return res.status(400).send("Tabla no permitida");
  }

  try {
    const query = `UPDATE ${tabla} SET precio = $1 WHERE id = $2 RETURNING *`;
    const resultado = await db.query(query, [precio, id]);

    if (resultado.rowCount === 0) {
      return res.status(404).send("No se encontró el registro con ese ID");
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al actualizar precio:", error);
    res.status(500).send("Error en el servidor");
  }
});




// Actualizar Productos

app.put("/api/productos/actualizar/:identificador", upload.fields([
  { name: 'imagenFinal' },
  { name: 'imagenGrabado' },
  { name: 'imagenBase' },
  { name: 'imagenSuaje' }
]), async (req, res) => {
  const { identificador } = req.params;

  try {
    const {
      grabado, num_cliente, clave_material, suajes_num_suaje,
      fecha, descripcion, tipo, producto, guia,
      ancho_int, largo_int, alto_int, ceja,
      ancho_carton, largo_carton, marcas, pegado,
      ancho_suaje, largo_suaje, corto_sep, largo_sep, tintas, precio_unitario
    } = req.body;

    // Función para convertir a número o null
    const parseNumber = value => (value !== '' && value !== undefined ? parseFloat(value) : null);

    // Preparar campos a actualizar
    const camposActualizar = {
      grabado,
      num_cliente,
      clave_material,
      suajes_num_suaje: parseNumber(suajes_num_suaje),
      fecha,
      descripcion,
      tipo,
      producto,
      guia,
      ancho_int: parseNumber(ancho_int),
      largo_int: parseNumber(largo_int),
      alto_int: parseNumber(alto_int),
      ceja: parseNumber(ceja),
      ancho_carton: parseNumber(ancho_carton),
      largo_carton: parseNumber(largo_carton),
      marcas,
      pegado,
      ancho_suaje: parseNumber(ancho_suaje),
      largo_suaje: parseNumber(largo_suaje),
      corto_sep: parseNumber(corto_sep),
      largo_sep: parseNumber(largo_sep),
      precio_unitario: parseNumber(precio_unitario)
    };

    // Manejo opcional de imágenes
    if (req.files['imagenFinal']) camposActualizar.imagen_final = req.files['imagenFinal'][0].buffer;
    if (req.files['imagenGrabado']) camposActualizar.imagen_grabado = req.files['imagenGrabado'][0].buffer;
    if (req.files['imagenBase']) camposActualizar.imagen = req.files['imagenBase'][0].buffer;
    if (req.files['imagenSuaje']) camposActualizar.imagen_suaje = req.files['imagenSuaje'][0].buffer;

    // Eliminar campos undefined
    Object.keys(camposActualizar).forEach(key => {
      if (camposActualizar[key] === undefined) delete camposActualizar[key];
    });

    // Construir query dinámico
    const keys = Object.keys(camposActualizar);
    if (keys.length > 0) {
      const values = Object.values(camposActualizar);
      const setString = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      await db.query(`UPDATE productos SET ${setString} WHERE identificador = $${keys.length + 1}`, [...values, identificador]);
    }

    // Actualizar tintas (solo si se envían)
    if (tintas !== undefined) {
      const tintasArray = JSON.parse(tintas);
      if (Array.isArray(tintasArray)) {
        // Primero eliminar las existentes
        await db.query('DELETE FROM producto_tinta WHERE id_producto = $1', [identificador]);

        // Insertar nuevas
        for (let id_tinta of tintasArray) {
          const idTintaNum = parseNumber(id_tinta);
          if (idTintaNum !== null) {
            await db.query('INSERT INTO producto_tinta (id_producto, id_tinta) VALUES ($1, $2)', [identificador, idTintaNum]);
          }
        }
      }
    }

    // ✅ Solo se envía la respuesta una vez
    res.json({ message: 'Producto actualizado correctamente' });

  } catch (error) {
    console.error("Error al actualizar producto:", error);

    // Evitar enviar respuesta si ya se envió
    if (!res.headersSent) {
      res.status(500).json({ error: "Error en el servidor al actualizar producto" });
    }
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
  const {
    material,
    tipo,
    flauta,
    resistencia,
    precio,
    tipo_material,
    calibre,
    peso
  } = req.body;

  // Validación básica (puedes ajustar según qué campos sean obligatorios)
  if (!material || !tipo || !flauta || !resistencia || precio === undefined) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const resultado = await db.query(
      `UPDATE materiales 
       SET material=$1, tipo=$2, flauta=$3, resistencia=$4, precio=$5,
           tipo_material=$6, calibre=$7, peso=$8
       WHERE clave=$9 RETURNING *`,
      [material, tipo, flauta, resistencia, precio, tipo_material, calibre, peso, clave]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Material no encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al actualizar material:", error);
    res.status(500).json({ error: "Error en el servidor" });
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

app.put('/api/categoria_cajas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { area_min, area_max } = req.body;
    const query = `
      UPDATE categoria_cajas
      SET area_min = $1, area_max = $2
      WHERE id = $3
      RETURNING *;
    `;
    const result = await db.query(query, [area_min, area_max, id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar caja:', error);
    res.status(500).json({ message: 'Error en el servidor' });
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
        if (error.code === "23503") { // FK violation
      res.status(409).send(
        "No se puede eliminar este producto porque está siendo usado en otra parte"
      );
    } else {
      res.status(500).send("Error en el servidor");
    }
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


// Materiales
app.delete("/api/materiales/borrar/:clave", async (req, res) => {
  const { clave } = req.params;
  try {
    await db.query("DELETE FROM materiales WHERE clave = $1", [clave]);
    res.status(200).send("Material eliminado correctamente");
  } catch (error) {
    console.error("Error al eliminar material:", error);

    if (error.code === "23503") { // FK violation
      res.status(409).send(
        "No se puede eliminar este material porque está siendo usado en otra parte"
      );
    } else {
      res.status(500).send("Error en el servidor");
    }
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

app.delete("/api/tintas/borrar/:id_tinta", async (req, res) => {
    const { id_tinta } = req.params;
    try {
        await db.query("DELETE FROM tintas WHERE id_tinta = $1", [id_tinta]);
        res.send("Tinta eliminada correctamente");
    } catch (error) {
        console.error("Error al eliminar tinta:", error);
        res.send("Error en el servidor");
    }
});

app.delete("/api/cotizaciones/borrar/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Ejecutar la eliminación en la tabla cotizaciones
        const result = await db.query("DELETE FROM cotizaciones WHERE id = $1", [id]);

        // Puedes comprobar si se eliminó alguna fila
        if (result.rowCount === 0) {
            return res.status(404).send("Cotización no encontrada");
        }

        res.send("Cotización eliminada correctamente");
    } catch (error) {
        console.error("Error al eliminar cotización:", error);
        res.status(500).send("Error en el servidor");
    }
});



app.listen(3000,(err)=>{
    console.log("Si escucha el puerto 3000");
})