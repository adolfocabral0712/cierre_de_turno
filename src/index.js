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
    // API - RENDIMIENTOS Y DENSIDAD BASICA
    // =========================================================
    if (url.pathname === "/api/rendimientos") {
      return proxyJSON(env.JSON_RENDIMIENTOS);
    }

    // =========================================================
    // PAGINA RENDIMIENTOS
    // /rendimientos -> /rendimientos.html
    // =========================================================
    if (
      url.pathname === "/rendimientos" ||
      url.pathname === "/rendimientos/"
    ) {

      const assetUrl = new URL(request.url);

      assetUrl.pathname =
        "/rendimientos.html";

      return env.ASSETS.fetch(
        new Request(
          assetUrl.toString(),
          request
        )
      );
    }

    // =========================================================
    // ARCHIVOS ESTÁTICOS
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
          "Content-Type":
            "application/json; charset=utf-8"
        }
      }
    );
  }


  try {

    const url =
      new URL(urlOrigen);

    // Forzar descarga directa Dropbox
    url.searchParams.set(
      "dl",
      "1"
    );

    // Evitar caché
    url.searchParams.set(
      "t",
      Date.now().toString()
    );


    const respuesta = await fetch(
      url.toString(),
      {
        headers: {
          "User-Agent":
            "Cloudflare-Worker"
        }
      }
    );


    if (!respuesta.ok) {

      return new Response(
        JSON.stringify({
          error: true,
          mensaje:
            "No fue posible obtener el JSON.",
          statusOrigen:
            respuesta.status
        }),
        {
          status: 502,
          headers: {
            "Content-Type":
              "application/json; charset=utf-8"
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
        mensaje:
          "Error interno al consultar la fuente.",
        detalle:
          error instanceof Error
            ? error.message
            : String(error)
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
