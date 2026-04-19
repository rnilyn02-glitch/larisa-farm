# Technical Specification: Larisa-I & Co Farm App

## 1. Infrastructure Overview
- **OS:** Ubuntu 24.04 LTS
- **Orchestration:** Docker Compose
- **Database:** PostgreSQL 16 (Container)
- **Backend Logic:** n8n (Container)
- **Frontend/Admin:** 
- **Web Server:** Traefik (Reverse Proxy + SSL)
- **Storage:** Local Volumes (or MinIO if needed later)

## 2. Database Schema (PostgreSQL)

### Table: `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default gen_random_uuid() | User ID |
| `phone` | VARCHAR | Unique, Not Null | Contact phone |
| `name` | VARCHAR | Not Null | Customer Name |
| `role` | VARCHAR | Default 'customer' | customer, manager, admin |
| `discount_level` | INT | Default 0 | Loyalty level (0-100%) |
| `telegram_id` | VARCHAR | Default 'null' | customer, manager, admin |
| `created_at` | TIMESTAMP | Default NOW() | Registration date |

### Table: `products`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Product ID |
| `name` | VARCHAR | Not Null | Product Name |
| `category` | VARCHAR | Not Null | eggs, meat, veggies, sets |
| `price` | DECIMAL | Not Null | Base Price |
| `unit` | VARCHAR | Not Null | pcs, kg, box |
| `is_active` | BOOLEAN | Default true | Show on frontend |
| `stock_qty` | INT | Default 0 | Available quantity |

### Table: `orders`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Order ID |
| `user_id` | UUID | FK -> users.id | Customer |
| `status` | VARCHAR | Default 'new' | new, confirmed, paid, delivered, cancelled |
| `total_amount` | DECIMAL | Nullable | Final amount (set by manager) |
| `payment_method` | VARCHAR | online, cash | |
| `delivery_address` | TEXT | Not Null | Address |
| `delivery_date` | DATE | Not Null | Usually Sunday |
| `created_at` | TIMESTAMP | Default NOW() | Order date |
| `updated_at` | TIMESTAMP | Default NOW() | Last update |

### Table: `order_items`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Item ID |
| `order_id` | UUID | FK -> orders.id | Order Reference |
| `product_id` | UUID | FK -> products.id | Product Reference |
| `quantity` | INT | Not Null | Quantity |
| `price_at_moment` | DECIMAL | Not Null | Price snapshot |

### Table: `payments`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Payment ID |
| `order_id` | UUID | FK -> orders.id | Order Reference |
| `yookassa_id` | VARCHAR | Unique | External Payment ID |
| `amount` | DECIMAL | Not Null | Paid Amount |
| `status` | VARCHAR | pending, succeeded, canceled | Payment Status |
| `paid_at` | TIMESTAMP | Nullable | Payment Date |

## 3. n8n Workflows Logic

### Workflow 1-NewOrder
- **Trigger:** Webhook (POST) from Frontend.
- **Action:**
  1. Insert data into `orders` and `order_items`.
  2. Send Telegram message to Manager Group: "New Order #ID, Amount: X".
  3. Send Telegram message to Customer: "Order received, waiting for confirmation".

### Workflow 2-Manager Confirm
- **Trigger:** Webhook (POST) from Admin Panel (Manager Action).
- **Input:** `order_id`, `final_amount`.
- **Action:**
  1. Update `orders` set `total_amount`, `status`='confirmed'.
  2. Call YooKassa API `createPayment`.
  3. Get `confirmation_url`.
  4. Update `payments` table.
  5. Send Telegram to Customer with Payment Link.

### Workflow 3-YooKassa_Webhook
- **Trigger:** Webhook (POST) from YooKassa.
- **Condition:** `event` == `payment.succeeded`.
- **Action:**
  1. Find `order_id` by `yookassa_id`.
  2. Update `orders` set `status`='paid'.
  3. Update `payments` set `status`='succeeded', `paid_at`=NOW().
  4. Send Telegram to Customer: "Payment received. Delivery on Sunday".
  5. Send Telegram to Manager: "Order #ID Paid".

### Workflow 4-Weekly_Delivery
- **Trigger:** Cron (Sunday 08:00).
- **Action:**
  1. Select all orders where `status`='paid' AND `delivery_date`=Today.
  2. Format list by Address.
  3. Send formatted list to Courier/Manager Telegram.

## 4. Docker Compose Structure (Draft)

```yaml
services:
  # PostgreSQL Database for n8n and Farm App
  db:
    image: postgres:16-alpine
    container_name: farm_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${N8N_DB_USER}
      POSTGRES_PASSWORD: ${N8N_DB_PASSWORD}
      POSTGRES_DB: ${N8N_DB_NAME}
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${N8N_DB_USER} -d ${N8N_DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  # n8n Workflow Automation
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    environment:
      N8N_HOST: ${N8N_DOMAIN}
      N8N_PORT: 5678
      N8N_PROTOCOL: https
      WEBHOOK_URL: https://${N8N_DOMAIN}/
      N8N_EDITOR_BASE_URL: https://${N8N_DOMAIN}/
      N8N_BASIC_AUTH_ACTIVE: "true"
      N8N_BASIC_AUTH_USER: ${N8N_BASIC_AUTH_USER}
      N8N_BASIC_AUTH_PASSWORD: ${N8N_BASIC_AUTH_PASSWORD}
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: db
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_USER: ${N8N_DB_USER}
      DB_POSTGRESDB_PASSWORD: ${N8N_DB_PASSWORD}
      DB_POSTGRESDB_DATABASE: ${N8N_DB_NAME}
      EXECUTIONS_DATA_PRUNE: true
      EXECUTIONS_DATA_MAX_AGE: 168
      GENERIC_TIMEZONE: Asia/Tomsk
      TZ: Asia/Tomsk
    volumes:
      - ./n8n_data:/home/node/.n8n
    depends_on:
      db:
        condition: service_healthy
    networks:
      - app-network

  # pgAdmin for Database Management
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_DEFAULT_EMAIL}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_DEFAULT_PASSWORD}
      PGADMIN_CONFIG_SERVER_MODE: "False"
      PGADMIN_MASTER_PASSWORD: ${PGADMIN_MASTER_PASSWORD}
    volumes:
      - ./pgadmin_data:/var/lib/pgadmin
    depends_on:
      - db
    networks:
      - app-network

  # Next.js Frontend
  nextjs:
    build: ./frontend
    container_name: nextjs_frontend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: https://${N8N_DOMAIN}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.nextjs.rule=Host(`${FRONTEND_DOMAIN}`) || Host(`www.${FRONTEND_DOMAIN}`)"
      - "traefik.http.routers.nextjs.entrypoints=websecure"
      - "traefik.http.routers.nextjs.tls.certresolver=letsencrypt"
      - "traefik.http.services.nextjs.loadbalancer.server.port=3000"
    networks:
      - app-network
    depends_on:
      - db

  # Traefik Reverse Proxy with static config
  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./traefik_data/acme.json:/acme.json
      - ./traefik_static.yml:/traefik.yml:ro
      - ./traefik_dynamic.yml:/traefik_dynamic.yml:ro
    command:
      - "--configFile=/traefik.yml"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge