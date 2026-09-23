const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const PORT = 5810;

// C program
const cProgram = path.join(__dirname, "cprogram/processamento.exe");

const server = http.createServer((req, res) => {

    // --------------------------------
    // GET /
    // --------------------------------
    if (req.method === "GET" && req.url === "/") {

        const filePath = path.join(__dirname, "publico", "inicial.html");

        fs.readFile(filePath, "utf8", (err, data) => {

            if (err) {
                res.writeHead(500, {
                    "Content-Type": "text/plain; charset=UTF-8"
                });

                res.end("Erro ao carregar inicial.html");
                return;
            }

            res.writeHead(200, {
                "Content-Type": "text/html; charset=UTF-8"
            });

            res.end(data);
        });

        return;
    }


    // --------------------------------
    // Static files from publico
    // --------------------------------
    if (req.method === "GET") {

        const requestedPath = decodeURIComponent(req.url.split("?")[0]);
        const publicRoot = path.resolve(__dirname, "publico");
        const filePath = path.resolve(publicRoot, `.${requestedPath}`);

        if (filePath.startsWith(`${publicRoot}${path.sep}`)) {
            const contentTypes = {
                ".css": "text/css; charset=UTF-8",
                ".jpeg": "image/jpeg",
                ".jpg": "image/jpeg",
                ".png": "image/png"
            };
            const contentType = contentTypes[path.extname(filePath).toLowerCase()];

            if (contentType) {
                fs.readFile(filePath, (err, data) => {
                    if (err) {
                        res.writeHead(err.code === "ENOENT" ? 404 : 500, {
                            "Content-Type": "text/plain; charset=UTF-8"
                        });
                        res.end(err.code === "ENOENT" ? "Arquivo não encontrado." : "Erro ao carregar arquivo.");
                        return;
                    }

                    res.writeHead(200, { "Content-Type": contentType });
                    res.end(data);
                });
                return;
            }
        }
    }


    // --------------------------------
    // POST /pagto
    // --------------------------------
    if (req.method === "POST" && req.url === "/pagto") {

        let body = "";

        // Receive form data
        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {

            // Convert form data
            const params = new URLSearchParams(body);

            const codigo = params.get("codigo") ?? params.get("codigo_doador");
            const valor = params.get("valor") ?? params.get("valor_doador");
            const paymentMethod = params.get("meio");


            // --------------------------------
            // Convert payment method
            // --------------------------------

            let metodo;

            if (paymentMethod === "pix") {
                metodo = "0";
            }
            else if (paymentMethod === "debito") {
                metodo = "1";
            }
            else if (paymentMethod === "credito") {
                metodo = "2";
            }
            else {
                res.writeHead(400, {
                    "Content-Type": "text/plain; charset=UTF-8"
                });

                res.end("Método de pagamento inválido.");
                return;
            }


            // --------------------------------
            // Display received values
            // --------------------------------

            console.log("Código:", codigo);
            console.log("Valor:", valor);
            console.log("Método:", paymentMethod);


            // --------------------------------
            // Call C program
            // --------------------------------

            execFile(
                cProgram,
                [codigo, valor, metodo],
                (error, stdout, stderr) => {

                    if (error) {

                        console.error("Erro ao executar C:");
                        console.error(error);

                        res.writeHead(500, {
                            "Content-Type": "text/plain; charset=UTF-8"
                        });

                        res.end("Erro ao executar o programa C.");
                        return;
                    }


                    if (stderr) {
                        console.error("C stderr:", stderr);
                    }


                    // --------------------------------
                    // Return C program output
                    // --------------------------------

                    res.writeHead(200, {
                        "Content-Type": "text/html; charset=UTF-8"
                    });

                    res.end(`
                        <!DOCTYPE html>
                        <html lang="pt-BR">
                        <head>
                            <meta charset="UTF-8">
                            <title>Processamento</title>
                            <link rel="stylesheet" href="css/processo.css">
                        </head>

                        <body>
                            <div class="box">
                            <h1 class="titulo">Resultado do processamento</h1>

                            <p class="valor"><strong>Código do Doador:</strong> ${codigo}</p>
                            <p class="valor"><strong>Valor doado:</strong> ${valor}</p>
                            <p class="valor"><strong>Método de pagamento Utilizado:</strong> ${paymentMethod}</p>

                            <h2 class="titulo">Resposta do programa C:</h2>

                            <pre class="valor">${stdout}</pre>

                            <a href="/" class="botao">Voltar</a>
                            </div>

                        </body>
                        </html>
                    `);
                }
            );
        });

        return;
    }


    // --------------------------------
    // 404
    // --------------------------------

    res.writeHead(404, {
        "Content-Type": "text/plain; charset=UTF-8"
    });

    res.end("Página não encontrada.");
});


server.listen(PORT, () => {
    console.log(`Servidor executando em http://localhost:${PORT}`);
});