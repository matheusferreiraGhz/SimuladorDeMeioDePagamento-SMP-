#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include "unicsul.h"

static void get_data_hora(char *data, char *hora)
{
    time_t agora = time(NULL);
    struct tm *local = localtime(&agora);

    if (local == NULL)
    {
        data[0] = '\0';
        hora[0] = '\0';
        return;
    }

    strftime(data, 30, "%Y-%m-%d", local);
    strftime(hora, 30, "%H:%M:%S", local);
}

static void get_prox_data(const char *data, int dias, char *prox_data)
{
    int ano;
    int mes;
    int dia;

    if (sscanf(data, "%d-%d-%d", &ano, &mes, &dia) != 3)
    {
        prox_data[0] = '\0';
        return;
    }

    struct tm data_operacao = {};
    data_operacao.tm_year = ano - 1900;
    data_operacao.tm_mon = mes - 1;
    data_operacao.tm_mday = dia;
    mktime(&data_operacao);

    for (int indice = 0; indice < dias; indice++)
    {
        data_operacao = proxima_data_util(data_operacao);
    }

    strftime(prox_data, 30, "%Y-%m-%d", &data_operacao);
}

int main(int argc, char *argv[])
{
    char dt_proc[30];
    char hr_proc[30];
    char prox_dt[30];
    int codigo;
    int metodo;
    float valor;

    if (argc != 4)
    {
        printf("Quantidade de argumentos invalida.\n");
        return 1;
    }

    codigo = atoi(argv[1]);
    valor = (float)atof(argv[2]);
    metodo = atoi(argv[3]);

    get_data_hora(dt_proc, hr_proc);
    get_prox_data(dt_proc, 1, prox_dt);

    printf("Data do proc: %s\n", dt_proc);
    printf("Hora do proc: %s\n", hr_proc);
    printf("Proxima data util: %s\n", prox_dt);
    printf("Codigo: %d\n", codigo);
    printf("Valor: %.2f\n", valor);
    printf("Metodo: %d\n", metodo);

    if (metodo == 0)
    {
        printf("<h1>OBRIGADO PELO PAGAMENTO VIA PIX</h1>\n");
        grava_log(dt_proc, hr_proc, codigo, valor, prox_dt);
    }
    else if (metodo == 1)
    {
        float taxa_mdr = valor * 0.01f;

        printf("<h1>OBRIGADO PELO PAGAMENTO VIA DEBITO</h1>\n");
        printf("Taxa MDR (1%%): R$ %.2f\n", taxa_mdr);
        grava_log(dt_proc, hr_proc, codigo, valor, prox_dt);
    }
    else if (metodo == 2)
    {
        float taxa_mdr = valor * 0.05f;

        printf("<h1>OBRIGADO PELO PAGAMENTO VIA CREDITO</h1>\n");
        printf("Taxa MDR (5%%): R$ %.2f\n", taxa_mdr);
        grava_log(dt_proc, hr_proc, codigo, valor, prox_dt);
    }
    else
    {
        printf("Metodo de pagamento invalido.\n");
        return 1;
    }

    return 0;
}
