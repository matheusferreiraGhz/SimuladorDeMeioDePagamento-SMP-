#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char *argv[]) {
    if (argc < 4) {
        printf("Uso: %s <codigo> <valor> <metodo>\n", argv[0]);
        return 1;
    }

    char *codigo = argv[1];
    char *valor = argv[2];
    char *metodo = argv[3];

    printf("========================================\n");
    printf("      CONFIRMACAO DE DOACAO\n");
    printf("========================================\n\n");
    printf("Codigo do doador: %s\n", codigo);
    printf("Valor doado: R$ %s\n", valor);
    printf("Metodo de pagamento: %s\n", metodo);
    printf("\nStatus: DOACAO CONFIRMADA\n");

    return 0;
}

