-- Create the database
CREATE DATABASE IF NOT EXISTS evengoddb;

-- Switch to the new database
USE evengod;

-- Create tables
CREATE TABLE categories (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	UNIQUE(name)
) ENGINE=InnoDB;

CREATE TABLE events (
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


CREATE TABLE inscriptions (
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
CREATE INDEX idx_event_by_category_id ON events(category_id);

-- Create indexes for searching inscriptions by event_id and user_uuid
CREATE INDEX idx_inscription_by_event_id ON inscriptions (event_id);
CREATE INDEX idx_inscription_by_user_uuid ON inscriptions (user_uuid);

INSERT INTO categories (name)
VALUES 
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