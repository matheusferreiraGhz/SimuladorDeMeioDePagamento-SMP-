<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: publico/inicial.html');
    exit;
}

$codigo = $_POST['codigo_doador'] ?? '';
$valor = $_POST['valor_doador'] ?? '';
$metodo = $_POST['metodo'] ?? '';

$programa = __DIR__ . '\Cprogram\confirmacao.exe';
$comando = "gcc \"" . __DIR__ . "\\Cprogram\\confirmacao.c\" -o \"" . $programa . "\" 2>NUL && \"" . $programa . "\" \"" . $codigo . "\" \"" . $valor . "\" \"" . $metodo . "\"";

$output = [];
$return = 0;
exec($comando, $output, $return);

if ($return !== 0) {
    echo "<h2>Erro ao confirmar doação.</h2>";
    echo "<p>Verifique os dados enviados.</p>";
    exit;
}

echo "<pre>";
foreach ($output as $linha) {
    echo htmlspecialchars($linha) . "\n";
}
echo "</pre>";
?>
