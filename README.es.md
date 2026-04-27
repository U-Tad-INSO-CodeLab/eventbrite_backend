

## Creación de la base de datos y migración
1. Crear la base de datos en MySQL:
    ```sql
    CREATE DATABASE eventlink;
    ```
2. Copiar el archivo de ejemplo:
    ```bash
    copy .env.example .env
    ```
3. Editar el archivo .env (ejemplo):
    ```env
    PORT=3000
    NODE_ENV=development

    DATABASE_URL="mysql://root:@localhost:3306/eventlink"
    DATABASE_USER="root"
    DATABASE_PASSWORD=""
    DATABASE_NAME="eventlink"
    DATABASE_HOST="localhost"
    DATABASE_PORT=3306
    ```
4. Ejecutar:
    ```bash
    npx prisma migrate dev --name init
    ```