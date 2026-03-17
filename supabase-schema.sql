-- Borrar tablas anteriores (si las creaste con snake_case)
drop table if exists installments cascade;
drop table if exists sales cascade;

-- Tabla de ventas
create table sales (
  id            text primary key,
  date          text not null,
  "clientName"  text,
  "clientPhone" text,
  model         text,
  capacity      text,
  color         text,
  condition     text,
  "priceUSD"              numeric,
  "priceARS"              numeric,
  "dollarRateAtSale"      numeric,
  "saleType"              text,
  vendor                  text,
  "commissionUSD"         numeric,
  status                  text,
  "nextDueDate"           text,
  "partner1Investment"    numeric,
  "partner2Investment"    numeric,
  "partner1Profit"        numeric,
  "partner2Profit"        numeric,
  "totalProfit"           numeric,
  "createdAt"             timestamptz default now()
);

-- Tabla de cuotas
create table installments (
  id                      text primary key,
  "saleId"                text references sales(id) on delete cascade,
  number                  int,
  "dueDate"               text,
  "amountUSD"             numeric,
  "dollarRateAtPayment"   numeric,
  "amountARS"             numeric,
  status                  text,
  "paidDate"              text
);

-- Row Level Security (acceso total sin auth, uso interno)
alter table sales enable row level security;
alter table installments enable row level security;

create policy "allow all" on sales       for all using (true) with check (true);
create policy "allow all" on installments for all using (true) with check (true);
