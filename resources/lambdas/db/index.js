const mysql = require('mysql2/promise');

const sqlScript = `
-- Create the database
CREATE DATABASE IF NOT EXISTS evengod;

-- Switch to the new database
USE evengod;

-- Create tables
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    UNIQUE(name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    category_id INT DEFAULT 0,
    description TEXT,
    user_uuid VARCHAR(36) NOT NULL,
    start_date DATE,
    end_date DATE,
    inscriptions_start_date DATE,
    inscriptions_end_date DATE,
    virtual_room_link TEXT,
    modality VARCHAR(50),
    state VARCHAR(50),
    location VARCHAR(100),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET DEFAULT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_uuid VARCHAR(36),
    event_id INT,
    state VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE(user_uuid, event_id)
) ENGINE=InnoDB;

-- Create index for searching events by category_id
CREATE INDEX IF NOT EXISTS idx_event_by_category_id ON events(category_id);

-- Create indexes for searching inscriptions by event_id and user_id
CREATE INDEX IF NOT EXISTS idx_inscription_by_event_id ON inscriptions (event_id);
CREATE INDEX IF NOT EXISTS idx_inscription_by_user_id ON inscriptions (user_uuid);

-- Insert categories if they don't exist
INSERT IGNORE INTO categories (name) VALUES 
('Sin Categoría'),
('Tecnología'),
('Medioambiente'),
('Salud'),
('Educación'),
('Finanzas'),
('Emprendimiento'),
('Ciencia'),
('Arte y Cultura'),
('Psicología'),
('Política');
`;

exports.handler = async (event) => {
    // Database configuration
    const dbConfig = {
        host: process.env.RDS_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    };

    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);

        await connection.query(sqlScript);

        console.log('Schema setup completed successfully');
        return { statusCode: 200, body: JSON.stringify('Schema setup completed successfully') };
    } catch (error) {
        console.error('Error setting up schema:', error);
        return { statusCode: 500, body: JSON.stringify('Error setting up schema: ' + error.message) };
    } finally {
        if (connection) await connection.end();
    }
};