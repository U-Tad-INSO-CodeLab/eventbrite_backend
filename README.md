## Database setup and migration

1. Create the database in MySQL:
    ```sql
    CREATE DATABASE eventlink;
    ```
2. Copy the example environment file:
    ```bash
    # macOS / Linux
    cp .env.example .env

    # Windows
    copy .env.example .env
    ```
3. Edit the `.env` file with your database credentials:
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
4. Run the initial migration:
    ```bash
    npx prisma migrate dev --name init
    ```