function ok(res, data = null, message = "OK", status = 200) {
  return res.writeHead(status, { "Content-Type": "application/json" })
    .end(JSON.stringify({ success: true, message, data }));
}

function fail(res, message = "Erreur", status = 400, details = null) {
  return res.writeHead(status, { "Content-Type": "application/json" })
    .end(JSON.stringify({ success: false, message, details }));
}

module.exports = { ok, fail };
