const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const PORT = 3000;

// C program
const cProgram = path.join(__dirname, "cprogram/processamento.exe");

const server = http.createServer((req, res) => {

    // --------------------------------
    // GET /
    // --------------------------------
    if (req.method === "GET" && req.url === "/") {

        const filePath = path.join(__dirname, "public", "index.html");

        fs.readFile(filePath, "utf8", (err, data) => {

            if (err) {
                res.writeHead(500, {
                    "Content-Type": "text/plain; charset=UTF-8"
                });

                res.end("Erro ao carregar index.html");
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

            const codigo = params.get("codigo");
            const valor = params.get("valor");
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
            console.log("Método:", metodo);


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
                        </head>

                        <body>

                            <h1>Resultado do processamento</h1>

                            <p><strong>Código:</strong> ${codigo}</p>
                            <p><strong>Valor:</strong> ${valor}</p>
                            <p><strong>Método:</strong> ${metodo}</p>

                            <h2>Resposta do programa C:</h2>

                            <pre>${stdout}</pre>

                            <a href="/">Voltar</a>

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