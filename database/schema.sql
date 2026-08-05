-- ============================================================
-- SpiceRoute — Database Creation Script
-- MySQL 8 / AWS RDS
-- Run this to recreate all tables from scratch
-- ============================================================

CREATE DATABASE IF NOT EXISTS team13
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE team13;

-- ── Table 1: Menu Items ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS `menu_menuitem` (
  `id`          bigint        AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `name`        varchar(100)  NOT NULL,
  `description` longtext      NOT NULL,
  `price`       numeric(8,2)  NOT NULL,
  `category`    varchar(20)   NOT NULL,   -- starter | main | dessert | drink
  `is_veg`      bool          NOT NULL DEFAULT 0,
  `is_spicy`    bool          NOT NULL DEFAULT 0,
  `image_url`   varchar(200)  NOT NULL DEFAULT '',
  `calories`    integer UNSIGNED NULL CHECK (`calories` >= 0)
);

-- ── Table 2: Customers ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS `menu_customer` (
  `id`          bigint        AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `phone`       varchar(10)   NOT NULL UNIQUE,
  `name`        varchar(100)  NOT NULL DEFAULT '',
  `created_at`  datetime(6)   NOT NULL,
  `updated_at`  datetime(6)   NOT NULL
);

-- ── Table 3: Orders ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `menu_order` (
  `id`          bigint        AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `total`       numeric(10,2) NOT NULL,
  `created_at`  datetime(6)   NOT NULL,
  `customer_id` bigint        NOT NULL,
  CONSTRAINT `menu_order_customer_fk`
    FOREIGN KEY (`customer_id`) REFERENCES `menu_customer` (`id`)
    ON DELETE CASCADE
);

-- ── Table 4: Order Items ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS `menu_orderitem` (
  `id`           bigint        AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `name`         varchar(100)  NOT NULL,   -- snapshot at order time
  `price`        numeric(8,2)  NOT NULL,   -- snapshot at order time
  `qty`          integer UNSIGNED NOT NULL CHECK (`qty` >= 0),
  `menu_item_id` bigint        NULL,       -- SET NULL if menu item deleted
  `order_id`     bigint        NOT NULL,
  CONSTRAINT `menu_orderitem_menuitem_fk`
    FOREIGN KEY (`menu_item_id`) REFERENCES `menu_menuitem` (`id`)
    ON DELETE SET NULL,
  CONSTRAINT `menu_orderitem_order_fk`
    FOREIGN KEY (`order_id`) REFERENCES `menu_order` (`id`)
    ON DELETE CASCADE
);

-- ── Django migrations tracking table ────────────────────────
CREATE TABLE IF NOT EXISTS `django_migrations` (
  `id`      bigint      AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `app`     varchar(255) NOT NULL,
  `name`    varchar(255) NOT NULL,
  `applied` datetime(6)  NOT NULL
);
