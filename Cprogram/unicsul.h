#ifndef UNICSUL_H
#define UNICSUL_H

#include <time.h>

struct tm proxima_data_util(struct tm data_operacao)
{
    struct tm proxima = data_operacao;

    /* Move to the next day */
    proxima.tm_mday++;

    /* Normalize the date */
    mktime(&proxima);

    /* tm_wday:
       0 = Sunday
       1 = Monday
       2 = Tuesday
       3 = Wednesday
       4 = Thursday
       5 = Friday
       6 = Saturday
    */

    if (proxima.tm_wday == 6)       /* Saturday */
    {
        proxima.tm_mday += 2;
        mktime(&proxima);
    }
    else if (proxima.tm_wday == 0)  /* Sunday */
    {
        proxima.tm_mday += 1;
        mktime(&proxima);
    }

    return proxima;
}

int grava_log(const char *date,
              const char *time,
              int code,
              float value,
              const char *data)
{
    char filename[256];
    FILE *arquivo;

    /*
       date: YYYY-MM-DD
       time: HH:MM:SS
    */

    snprintf(filename, sizeof(filename),
             "../log/%.4s%.2s%.2s_%.2s%.2s%.2s_%06d.json",
             date,       // YYYY
             date + 5,   // MM
             date + 8,   // DD
             time,       // HH
             time + 3,   // MM
             time + 6,   // SS
             code);      // 6 digits

    arquivo = fopen(filename, "w");

    if (arquivo == NULL)
    {
        return 1;
    }

    fprintf(arquivo, "{\n");
    fprintf(arquivo, "    \"date\": \"%s\",\n", date);
    fprintf(arquivo, "    \"time\": \"%s\",\n", time);
    fprintf(arquivo, "    \"code\": %06d,\n", code);
    fprintf(arquivo, "    \"value\": %.2f,\n", value);
    fprintf(arquivo, "    \"data\": \"%s\"\n", data);
    fprintf(arquivo, "}\n");

    if (fclose(arquivo) != 0)
    {
        return 2;
    }

    return 0;
}

#endif