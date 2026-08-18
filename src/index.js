export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    // =========================================================
    // API - MUESTRAS
    // =========================================================
    if (url.pathname === "/api/muestras") {
      return proxyJSON(env.JSON_MUESTRAS);
    }

    // =========================================================
    // API - DESCARGAS PENDIENTES
    // =========================================================
    if (url.pathname === "/api/descargas") {
      return proxyJSON(env.JSON_DESCARGAS);
    }

    // =========================================================
    // API - DESCARGA CIERRE TURNO
    // =========================================================
    if (url.pathname === "/api/cierre") {
      return proxyJSON(env.JSON_CIERRE_TURNO);
    }

    // =========================================================
    // ARCHIVOS ESTÁTICOS
    // index.html, css, etc.
    // =========================================================
    return env.ASSETS.fetch(request);
  }
};


// =============================================================
// PROXY JSON
// =============================================================

async function proxyJSON(urlOrigen) {

  if (!urlOrigen) {

    return new Response(
      JSON.stringify({
        error: true,
        mensaje: "Fuente no configurada."
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      }
    );
  }


  try {

    const respuesta = await fetch(
      urlOrigen,
      {
        headers: {
          "User-Agent": "Cloudflare-Worker"
        }
      }
    );


    if (!respuesta.ok) {

      return new Response(
        JSON.stringify({
          error: true,
          mensaje: "No fue posible obtener el JSON.",
          statusOrigen: respuesta.status
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          }
        }
      );
    }


    const contenido =
      await respuesta.text();


    return new Response(
      contenido,
      {
        status: 200,

        headers: {

          "Content-Type":
            "application/json; charset=utf-8",

          "Cache-Control":
            "no-store, no-cache, must-revalidate",

          "Pragma":
            "no-cache",

          "Expires":
            "0"
        }
      }
    );


  } catch (error) {

    return new Response(
      JSON.stringify({
        error: true,
        mensaje: "Error interno al consultar la fuente."
      }),
      {
        status: 500,
        headers: {
          "Content-Type":
            "application/json; charset=utf-8"
        }
      }
    );
  }
}
