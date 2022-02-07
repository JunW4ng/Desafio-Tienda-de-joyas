const express = require("express");
const joyas = require("./data/joyas");
const app = express();

const HATEOASV1 = () => joyas.results;

const HATEOASV2 = () =>
  joyas.results.map((joya) => ({
    id_joya: joya.id,
    nombre: joya.name,
    modelo: joya.model,
    categoria: joya.category,
    material: joya.metal,
    cadena_joya: joya.cadena,
    medida_joya: joya.medida,
    valor: joya.value,
    stock_joya: joya.stock,
  }));

//? Separa por categoria
const filtroPorCategoria = (categoria) => {
  return joyas.results.filter((joya) => joya.category == categoria);
};

//? Filtro por id
const filtroPorId = (id) => {
  return joyas.results.find((joya) => joya.id == id);
};

//? Elimina campos que no son recibidos como parametro
const filtroPorCampo = (joya, campo) => {
  for (propiedad in joya) {
    if (!campo.includes(propiedad)) delete joya[propiedad];
  }
  return joya;
};

//? Ordena ascendente o descendente
const orden = (orden) => {
  const order = orden == "desc" ? { a: -1, b: 1 } : { a: 1, b: -1 };
  return joyas.results.sort((a, b) => (a.value > b.value ? order.a : order.b));
};

//? Devuelve todas las joyas
app.get("/api/v1/joyas", (_, res) => {
  res.send({ joyas: HATEOASV1() });
});

app.get("/api/v2/joyas", (req, res) => {
  //? Orden ascendente o descendiente
  const { value } = req.query;
  if (["asc", "desc"].includes(value)) return res.send(orden(value));

  //? Paginacion y limites
  if (req.query.page) {
    const { page, limits } = req.query;
    return res.send({
      joya: HATEOASV2().slice(page * limits - limits, page * limits),
    });
  }
  res.send({ joyas: HATEOASV2() });
});

//? Joyas por categoria
app.get("/joyas/category/:categoria", (req, res) => {
  const { categoria } = req.params;
  res.send(filtroPorCategoria(categoria));
});

app.get("/joyas/:id/", (req, res) => {
  //? Devuelve campo(s) de una joya
  const { id } = req.params;
  const { campo } = req.query;
  if (campo)
    return res.send({
      joya: filtroPorCampo(filtroPorId(id), campo.split(",")),
    });

  //? Manda payload de error si no encuentra id
  filtroPorId(id)
    ? res.send({ joya: filtroPorId(id) })
    : res.status(404).send({
        error: "404 Not Found",
        message: "No existe una joya con ese id",
      });
});

app.listen(3000, () => console.log("Your app listening on port 3000"));
